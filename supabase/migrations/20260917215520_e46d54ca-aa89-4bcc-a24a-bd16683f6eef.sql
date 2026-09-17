CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(_user_id, 'super_admin'::public.app_role)
      OR public.has_role(_user_id, 'support_admin'::public.app_role)
$$;

REVOKE ALL ON FUNCTION public.is_admin(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO authenticated;

REVOKE UPDATE ON public.profiles FROM authenticated;
GRANT UPDATE (full_name, experience_level, market_type, avatar_url) ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

CREATE OR REPLACE FUNCTION public.protect_profile_billing_columns()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NOT NULL
     AND NOT public.has_role(auth.uid(), 'super_admin'::public.app_role) THEN
    NEW.plan := OLD.plan;
    NEW.plan_status := OLD.plan_status;
    NEW.subscription_type := OLD.subscription_type;
    NEW.payment_status := OLD.payment_status;
    NEW.trial_start_date := OLD.trial_start_date;
    NEW.trial_end_date := OLD.trial_end_date;
    NEW.referred_by_code := OLD.referred_by_code;
    NEW.referred_by_affiliate_id := OLD.referred_by_affiliate_id;
    NEW.trial_reminder_day1_sent_at := OLD.trial_reminder_day1_sent_at;
    NEW.trial_reminder_day2_sent_at := OLD.trial_reminder_day2_sent_at;
    NEW.trial_reminder_day3_sent_at := OLD.trial_reminder_day3_sent_at;
    NEW.trial_expired_email_sent_at := OLD.trial_expired_email_sent_at;
  END IF;
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.protect_profile_billing_columns() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS protect_profile_billing_columns ON public.profiles;
CREATE TRIGGER protect_profile_billing_columns
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.protect_profile_billing_columns();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_ref_code text := NEW.raw_user_meta_data->>'ref_code';
  v_aff_id uuid := NULL;
  v_aff_user uuid := NULL;
BEGIN
  IF v_ref_code IS NOT NULL AND length(v_ref_code) > 0 THEN
    SELECT id, user_id INTO v_aff_id, v_aff_user
    FROM public.affiliates
    WHERE referral_code = v_ref_code AND status = 'active'
    LIMIT 1;

    IF v_aff_user = NEW.id THEN
      v_aff_id := NULL;
    END IF;
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
    'free',
    'active',
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'country',
    NULL,
    NULL,
    'unpaid',
    'none',
    CASE WHEN v_aff_id IS NOT NULL THEN v_ref_code ELSE NULL END,
    v_aff_id
  );

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user')
  ON CONFLICT DO NOTHING;

  IF v_aff_id IS NOT NULL THEN
    INSERT INTO public.referrals (
      affiliate_id, referred_user_id, referred_email, conversion_status, plan
    ) VALUES (
      v_aff_id, NEW.id, NEW.email, 'signup', 'free'
    )
    ON CONFLICT (referred_user_id) DO NOTHING;

    UPDATE public.affiliates
    SET total_referrals = total_referrals + 1
    WHERE id = v_aff_id;
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

DROP POLICY IF EXISTS "super admin manage content" ON public.site_content;
DROP POLICY IF EXISTS "admins manage content" ON public.site_content;
DROP POLICY IF EXISTS "authenticated write content" ON public.site_content;
DROP POLICY IF EXISTS "authenticated users write content" ON public.site_content;

CREATE POLICY "admins manage content"
ON public.site_content
FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

GRANT INSERT (id, page, section_key, draft, published),
      UPDATE (page, section_key, draft, published),
      DELETE
ON public.site_content TO authenticated;
GRANT ALL ON public.site_content TO service_role;