-- Billing period tracking
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS pro_until timestamptz;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS cancel_at_period_end boolean NOT NULL DEFAULT false;

-- Webhook audit / idempotency
CREATE TABLE public.webhook_events (
  event_id text PRIMARY KEY,
  provider text NOT NULL DEFAULT 'whop',
  event_type text NOT NULL,
  email text,
  user_id uuid,
  amount numeric,
  currency text,
  status text NOT NULL DEFAULT 'received',
  error text,
  payload jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz
);
GRANT SELECT ON public.webhook_events TO authenticated;
GRANT ALL ON public.webhook_events TO service_role;
ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view webhook events" ON public.webhook_events
  FOR SELECT TO authenticated USING (private.is_admin(auth.uid()));
CREATE INDEX webhook_events_created_idx ON public.webhook_events (created_at DESC);

-- Purchases that could not be matched to an account yet
CREATE TABLE public.pending_purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  event text NOT NULL,
  event_id text,
  billing text,
  pro_until timestamptz,
  payload jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz,
  resolved_user_id uuid
);
GRANT SELECT ON public.pending_purchases TO authenticated;
GRANT ALL ON public.pending_purchases TO service_role;
ALTER TABLE public.pending_purchases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view pending purchases" ON public.pending_purchases
  FOR SELECT TO authenticated USING (private.is_admin(auth.uid()));
CREATE UNIQUE INDEX pending_purchases_event_uidx ON public.pending_purchases (event_id) WHERE event_id IS NOT NULL;
CREATE INDEX pending_purchases_email_open_idx ON public.pending_purchases (lower(email)) WHERE resolved_at IS NULL;

-- Exact email lookup for the webhook (service role only)
CREATE OR REPLACE FUNCTION public.find_user_id_by_email(p_email text)
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, auth
AS $$ SELECT id FROM auth.users WHERE lower(email) = lower(trim(p_email)) LIMIT 1 $$;
REVOKE EXECUTE ON FUNCTION public.find_user_id_by_email(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.find_user_id_by_email(text) TO service_role;

CREATE OR REPLACE FUNCTION public.get_user_email(p_user_id uuid)
RETURNS text LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, auth
AS $$ SELECT lower(email) FROM auth.users WHERE id = p_user_id $$;
REVOKE EXECUTE ON FUNCTION public.get_user_email(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_email(uuid) TO service_role;

-- Downgrade cancelled subscriptions once their paid period ends
CREATE OR REPLACE FUNCTION public.expire_cancelled_subscriptions()
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE n int;
BEGIN
  UPDATE public.profiles
     SET plan = 'free', plan_status = 'active', subscription_type = 'none',
         payment_status = 'unpaid', cancel_at_period_end = false
   WHERE plan = 'pro' AND cancel_at_period_end = true
     AND pro_until IS NOT NULL AND pro_until <= now();
  GET DIAGNOSTICS n = ROW_COUNT;
  RETURN n;
END $$;
REVOKE EXECUTE ON FUNCTION public.expire_cancelled_subscriptions() FROM PUBLIC, anon, authenticated;

SELECT cron.unschedule('expire-cancelled-subscriptions')
  WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'expire-cancelled-subscriptions');
SELECT cron.schedule('expire-cancelled-subscriptions', '0 * * * *', $$SELECT public.expire_cancelled_subscriptions()$$);

-- Signup: create profile, capture referral, and claim any pending purchase
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE
  v_ref_code text := NEW.raw_user_meta_data->>'ref_code';
  v_aff_id uuid := NULL;
  v_aff_user uuid := NULL;
  v_pending public.pending_purchases%ROWTYPE;
BEGIN
  IF v_ref_code IS NOT NULL AND length(v_ref_code) > 0 THEN
    SELECT id, user_id INTO v_aff_id, v_aff_user
    FROM public.affiliates WHERE referral_code = v_ref_code AND status = 'active' LIMIT 1;
    IF v_aff_user = NEW.id THEN v_aff_id := NULL; END IF;
  END IF;

  INSERT INTO public.profiles (
    user_id, full_name, experience_level, market_type, plan, plan_status,
    phone, country, trial_start_date, trial_end_date, payment_status,
    subscription_type, referred_by_code, referred_by_affiliate_id
  ) VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'experience_level', 'beginner'),
    COALESCE(NEW.raw_user_meta_data->>'market_type', 'crypto'),
    'free', 'active',
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'country',
    NULL, NULL, 'unpaid', 'none',
    CASE WHEN v_aff_id IS NOT NULL THEN v_ref_code ELSE NULL END,
    v_aff_id
  );

  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user') ON CONFLICT DO NOTHING;

  IF v_aff_id IS NOT NULL THEN
    INSERT INTO public.referrals (affiliate_id, referred_user_id, referred_email, conversion_status, plan)
    VALUES (v_aff_id, NEW.id, NEW.email, 'signup', 'free')
    ON CONFLICT (referred_user_id) DO NOTHING;
    UPDATE public.affiliates SET total_referrals = total_referrals + 1 WHERE id = v_aff_id;
  END IF;

  -- Claim the most recent unmatched Whop purchase for this email (only if still within its paid period)
  IF NEW.email IS NOT NULL THEN
    SELECT * INTO v_pending FROM public.pending_purchases
     WHERE lower(email) = lower(NEW.email) AND resolved_at IS NULL
     ORDER BY created_at DESC LIMIT 1;
    IF FOUND THEN
      IF v_pending.pro_until IS NULL OR v_pending.pro_until > now() THEN
        UPDATE public.profiles
           SET plan = 'pro', plan_status = 'active',
               subscription_type = COALESCE(v_pending.billing, 'monthly'),
               payment_status = 'paid', pro_until = v_pending.pro_until,
               cancel_at_period_end = false
         WHERE user_id = NEW.id;
      END IF;
      UPDATE public.pending_purchases SET resolved_at = now(), resolved_user_id = NEW.id
       WHERE lower(email) = lower(NEW.email) AND resolved_at IS NULL;
    END IF;
  END IF;

  RETURN NEW;
END;
$function$;