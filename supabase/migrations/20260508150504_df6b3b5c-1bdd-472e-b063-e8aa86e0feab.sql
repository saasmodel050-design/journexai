
-- Extend profiles with trial + contact fields
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS country text,
  ADD COLUMN IF NOT EXISTS trial_start_date timestamptz,
  ADD COLUMN IF NOT EXISTS trial_end_date timestamptz,
  ADD COLUMN IF NOT EXISTS payment_status text NOT NULL DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS subscription_type text NOT NULL DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS trial_reminder_day1_sent_at timestamptz,
  ADD COLUMN IF NOT EXISTS trial_reminder_day2_sent_at timestamptz,
  ADD COLUMN IF NOT EXISTS trial_reminder_day3_sent_at timestamptz,
  ADD COLUMN IF NOT EXISTS trial_expired_email_sent_at timestamptz;

-- Trial history (prevents multiple trials per email)
CREATE TABLE IF NOT EXISTS public.trial_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  user_id uuid,
  trial_start_date timestamptz NOT NULL DEFAULT now(),
  trial_end_date timestamptz NOT NULL,
  outcome text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.trial_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users view own trial history" ON public.trial_history;
CREATE POLICY "users view own trial history" ON public.trial_history
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "super admin manage trial history" ON public.trial_history;
CREATE POLICY "super admin manage trial history" ON public.trial_history
  FOR ALL USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

CREATE TRIGGER trial_history_set_updated_at
  BEFORE UPDATE ON public.trial_history
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Update new-user trigger to optionally start trial
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
BEGIN
  IF v_start_trial THEN
    SELECT EXISTS(SELECT 1 FROM public.trial_history WHERE email = NEW.email) INTO v_already_trialed;
    IF NOT v_already_trialed THEN
      v_plan := 'pro_trial';
      v_status := 'active';
      v_trial_start := now();
      v_trial_end := now() + interval '3 days';
      v_sub_type := 'trial';
    END IF;
  END IF;

  INSERT INTO public.profiles (
    user_id, full_name, experience_level, market_type,
    plan, plan_status, phone, country,
    trial_start_date, trial_end_date, subscription_type
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'experience_level', 'beginner'),
    COALESCE(NEW.raw_user_meta_data->>'market_type', 'crypto'),
    v_plan, v_status,
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'country',
    v_trial_start, v_trial_end, v_sub_type
  );

  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user') ON CONFLICT DO NOTHING;

  IF v_plan = 'pro_trial' THEN
    INSERT INTO public.trial_history (email, user_id, trial_start_date, trial_end_date, outcome)
    VALUES (NEW.email, NEW.id, v_trial_start, v_trial_end, 'active')
    ON CONFLICT (email) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$function$;

-- Make sure trigger exists on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
