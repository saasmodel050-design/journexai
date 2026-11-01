-- =====================================================
-- 1. AI coach usage tracking (server-side rate limiting)
-- =====================================================
CREATE TABLE public.ai_coach_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX ai_coach_messages_user_created_idx
  ON public.ai_coach_messages (user_id, created_at DESC);

GRANT SELECT ON public.ai_coach_messages TO authenticated;
GRANT ALL ON public.ai_coach_messages TO service_role;

ALTER TABLE public.ai_coach_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own AI usage"
  ON public.ai_coach_messages
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- =====================================================
-- 2. Contact form spam protection (rate limit per email)
-- =====================================================
CREATE OR REPLACE FUNCTION public.enforce_contact_rate_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  recent_1h int;
  recent_24h int;
BEGIN
  IF length(NEW.message) > 5000 THEN
    RAISE EXCEPTION 'Message is too long (maximum 5000 characters).';
  END IF;

  SELECT count(*) INTO recent_1h
    FROM public.contact_messages
    WHERE email = lower(NEW.email) AND created_at > now() - interval '1 hour';
  IF recent_1h >= 3 THEN
    RAISE EXCEPTION 'Too many messages sent recently. Please wait a little before sending another.';
  END IF;

  SELECT count(*) INTO recent_24h
    FROM public.contact_messages
    WHERE email = lower(NEW.email) AND created_at > now() - interval '24 hours';
  IF recent_24h >= 10 THEN
    RAISE EXCEPTION 'You have reached today''s message limit. Please email journex.ai.trade@gmail.com directly.';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS contact_messages_rate_limit ON public.contact_messages;
CREATE TRIGGER contact_messages_rate_limit
  BEFORE INSERT ON public.contact_messages
  FOR EACH ROW EXECUTE FUNCTION public.enforce_contact_rate_limit();

-- =====================================================
-- 3. Admin notification when a support message arrives
-- =====================================================
CREATE OR REPLACE FUNCTION public.notify_new_contact_message()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.platform_notifications (title, body, type, display, active)
  VALUES (
    'New support message from ' || coalesce(NEW.name, 'unknown'),
    left(NEW.message, 280),
    'support',
    'admin',
    true
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS contact_messages_notify_admin ON public.contact_messages;
CREATE TRIGGER contact_messages_notify_admin
  AFTER INSERT ON public.contact_messages
  FOR EACH ROW EXECUTE FUNCTION public.notify_new_contact_message();

-- =====================================================
-- 4. Retire the crypto payment flow (Whop is the only path)
-- =====================================================
DROP TRIGGER IF EXISTS trg_activate_pro ON public.crypto_payments;
DROP FUNCTION IF EXISTS public.activate_pro_on_approval();

COMMENT ON TABLE public.crypto_payments IS 'DEPRECATED: crypto checkout was removed; Whop is the only payment path. Retained for audit history only.';
COMMENT ON TABLE public.payment_wallets IS 'DEPRECATED: crypto checkout was removed; Whop is the only payment path. No wallet addresses may be added while deprecated.';
COMMENT ON TABLE public.trial_history IS 'DEPRECATED: trials are disabled platform-wide; table retained for historical records only.';

-- =====================================================
-- 5. Remove the orphaned trial-expiry cron job
-- (expire-trials edge function is being deleted; trials are disabled)
-- =====================================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'expire-pro-trials-hourly') THEN
    PERFORM cron.unschedule('expire-pro-trials-hourly');
  END IF;
END;
$$;