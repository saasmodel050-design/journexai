
-- 1. Update default commission rate to 25
ALTER TABLE public.affiliates ALTER COLUMN commission_rate SET DEFAULT 25;
UPDATE public.affiliates SET commission_rate = 25 WHERE commission_rate = 20;

-- 2. Recreate commission trigger with dynamic plan price + self-referral skip already in handle_new_user
CREATE OR REPLACE FUNCTION public.credit_affiliate_commission()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_aff public.affiliates%ROWTYPE;
  v_sale numeric;
  v_rate numeric;
  v_commission numeric;
  v_existing int;
BEGIN
  IF NEW.referred_by_affiliate_id IS NULL THEN RETURN NEW; END IF;
  IF NEW.plan <> 'pro' OR NEW.payment_status <> 'paid' THEN RETURN NEW; END IF;
  IF OLD.plan = 'pro' AND OLD.payment_status = 'paid' THEN RETURN NEW; END IF;

  SELECT * INTO v_aff FROM public.affiliates WHERE id = NEW.referred_by_affiliate_id;
  IF NOT FOUND OR v_aff.status <> 'active' THEN RETURN NEW; END IF;

  -- Self-referral guard
  IF v_aff.user_id = NEW.user_id THEN RETURN NEW; END IF;

  SELECT count(*) INTO v_existing FROM public.commissions
    WHERE affiliate_id = v_aff.id AND referred_user_id = NEW.user_id;
  IF v_existing > 0 THEN RETURN NEW; END IF;

  -- Get live Pro plan price (fallback to 29)
  SELECT COALESCE(monthly_price, 29) INTO v_sale FROM public.plans
    WHERE slug = 'pro' AND active = true LIMIT 1;
  IF v_sale IS NULL OR v_sale = 0 THEN v_sale := 29; END IF;

  v_rate := COALESCE(v_aff.commission_rate, 25);
  v_commission := round((v_sale * v_rate / 100)::numeric, 2);

  INSERT INTO public.commissions (affiliate_id, referred_user_id, sale_amount, commission_amount, status)
  VALUES (v_aff.id, NEW.user_id, v_sale, v_commission, 'pending');

  UPDATE public.affiliates
    SET total_conversions = total_conversions + 1,
        pending_earnings = pending_earnings + v_commission,
        total_earnings = total_earnings + v_commission
    WHERE id = v_aff.id;

  UPDATE public.referrals
    SET conversion_status = 'paid', converted_at = now(), plan = 'pro'
    WHERE referred_user_id = NEW.user_id;

  RETURN NEW;
END $function$;

-- Ensure trigger exists on profiles
DROP TRIGGER IF EXISTS trg_credit_affiliate_commission ON public.profiles;
CREATE TRIGGER trg_credit_affiliate_commission
  AFTER UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.credit_affiliate_commission();

-- 3. Add self-referral guard to handle_new_user (prevent linking if affiliate is the same user)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_start_trial boolean := COALESCE((NEW.raw_user_meta_data->>'start_trial')::boolean, false);
  v_already_trialed boolean := false;
  v_plan text := 'free';
  v_status text := 'active';
  v_trial_start timestamptz := NULL;
  v_trial_end timestamptz := NULL;
  v_sub_type text := 'none';
  v_ref_code text := NEW.raw_user_meta_data->>'ref_code';
  v_aff_id uuid := NULL;
  v_aff_user uuid := NULL;
BEGIN
  IF v_start_trial THEN
    SELECT EXISTS(SELECT 1 FROM public.trial_history WHERE email = NEW.email) INTO v_already_trialed;
    IF NOT v_already_trialed THEN
      v_plan := 'pro_trial'; v_status := 'active';
      v_trial_start := now(); v_trial_end := now() + interval '3 days';
      v_sub_type := 'trial';
    END IF;
  END IF;

  IF v_ref_code IS NOT NULL AND length(v_ref_code) > 0 THEN
    SELECT id, user_id INTO v_aff_id, v_aff_user FROM public.affiliates
      WHERE referral_code = v_ref_code AND status = 'active' LIMIT 1;
    -- block self-referral
    IF v_aff_user = NEW.id THEN
      v_aff_id := NULL;
    END IF;
  END IF;

  INSERT INTO public.profiles (
    user_id, full_name, experience_level, market_type, plan, plan_status,
    phone, country, trial_start_date, trial_end_date, subscription_type,
    referred_by_code, referred_by_affiliate_id
  ) VALUES (
    NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name',''),
    COALESCE(NEW.raw_user_meta_data->>'experience_level','beginner'),
    COALESCE(NEW.raw_user_meta_data->>'market_type','crypto'),
    v_plan, v_status,
    NEW.raw_user_meta_data->>'phone', NEW.raw_user_meta_data->>'country',
    v_trial_start, v_trial_end, v_sub_type,
    CASE WHEN v_aff_id IS NOT NULL THEN v_ref_code ELSE NULL END,
    v_aff_id
  );

  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user') ON CONFLICT DO NOTHING;

  IF v_plan = 'pro_trial' THEN
    INSERT INTO public.trial_history (email, user_id, trial_start_date, trial_end_date, outcome)
    VALUES (NEW.email, NEW.id, v_trial_start, v_trial_end, 'active') ON CONFLICT (email) DO NOTHING;
  END IF;

  IF v_aff_id IS NOT NULL THEN
    INSERT INTO public.referrals (affiliate_id, referred_user_id, referred_email, conversion_status, plan)
    VALUES (v_aff_id, NEW.id, NEW.email, CASE WHEN v_plan='pro_trial' THEN 'trial' ELSE 'signup' END, v_plan)
    ON CONFLICT (referred_user_id) DO NOTHING;
    UPDATE public.affiliates SET total_referrals = total_referrals + 1 WHERE id = v_aff_id;
  END IF;

  RETURN NEW;
END $function$;

-- 4. Enable realtime
ALTER TABLE public.site_content REPLICA IDENTITY FULL;
ALTER TABLE public.plans REPLICA IDENTITY FULL;
ALTER TABLE public.affiliates REPLICA IDENTITY FULL;
ALTER TABLE public.referrals REPLICA IDENTITY FULL;
ALTER TABLE public.commissions REPLICA IDENTITY FULL;
ALTER TABLE public.payouts REPLICA IDENTITY FULL;
ALTER TABLE public.feature_flags REPLICA IDENTITY FULL;
ALTER TABLE public.ai_settings REPLICA IDENTITY FULL;
ALTER TABLE public.platform_notifications REPLICA IDENTITY FULL;

DO $$
BEGIN
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.site_content; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.plans; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.affiliates; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.referrals; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.commissions; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.payouts; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.feature_flags; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.ai_settings; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.platform_notifications; EXCEPTION WHEN duplicate_object THEN NULL; END;
END $$;
