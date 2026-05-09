
-- AFFILIATES
CREATE TABLE public.affiliates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  full_name text NOT NULL,
  email text NOT NULL,
  country text,
  social_url text,
  motivation text,
  referral_code text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'pending', -- pending|active|banned|rejected
  commission_rate numeric NOT NULL DEFAULT 20, -- percent
  payout_method text, -- paypal|bank
  paypal_email text,
  bank_details jsonb,
  total_clicks integer NOT NULL DEFAULT 0,
  total_referrals integer NOT NULL DEFAULT 0,
  total_conversions integer NOT NULL DEFAULT 0,
  total_earnings numeric NOT NULL DEFAULT 0,
  pending_earnings numeric NOT NULL DEFAULT 0,
  paid_earnings numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  approved_at timestamptz
);

-- Clicks
CREATE TABLE public.affiliate_clicks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id uuid NOT NULL REFERENCES public.affiliates(id) ON DELETE CASCADE,
  referral_code text NOT NULL,
  ip_address text,
  user_agent text,
  country text,
  referrer text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_clicks_affiliate ON public.affiliate_clicks(affiliate_id);

-- Referrals
CREATE TABLE public.referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id uuid NOT NULL REFERENCES public.affiliates(id) ON DELETE CASCADE,
  referred_user_id uuid NOT NULL UNIQUE,
  referred_email text,
  signup_date timestamptz NOT NULL DEFAULT now(),
  conversion_status text NOT NULL DEFAULT 'signup', -- signup|trial|paid
  converted_at timestamptz,
  plan text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_referrals_affiliate ON public.referrals(affiliate_id);

-- Commissions
CREATE TABLE public.commissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id uuid NOT NULL REFERENCES public.affiliates(id) ON DELETE CASCADE,
  referral_id uuid REFERENCES public.referrals(id) ON DELETE SET NULL,
  referred_user_id uuid,
  sale_amount numeric NOT NULL DEFAULT 0,
  commission_amount numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending', -- pending|approved|paid|rejected
  payout_id uuid,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_commissions_affiliate ON public.commissions(affiliate_id);

-- Payouts
CREATE TABLE public.payouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id uuid NOT NULL REFERENCES public.affiliates(id) ON DELETE CASCADE,
  amount numeric NOT NULL,
  method text NOT NULL DEFAULT 'paypal',
  destination jsonb,
  status text NOT NULL DEFAULT 'pending', -- pending|approved|paid|rejected
  admin_notes text,
  requested_at timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- profiles: track referrer
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS referred_by_code text,
  ADD COLUMN IF NOT EXISTS referred_by_affiliate_id uuid;

-- Enable RLS
ALTER TABLE public.affiliates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;

-- Policies: affiliates
CREATE POLICY "users view own affiliate" ON public.affiliates FOR SELECT
  USING (auth.uid() = user_id OR is_admin(auth.uid()));
CREATE POLICY "users create own affiliate" ON public.affiliates FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users update own affiliate" ON public.affiliates FOR UPDATE
  USING (auth.uid() = user_id);
CREATE POLICY "super admin manage affiliates" ON public.affiliates FOR ALL
  USING (has_role(auth.uid(), 'super_admin'))
  WITH CHECK (has_role(auth.uid(), 'super_admin'));

-- Clicks: public insert (tracking), owners + admins read
CREATE POLICY "anyone log clicks" ON public.affiliate_clicks FOR INSERT WITH CHECK (true);
CREATE POLICY "owner view clicks" ON public.affiliate_clicks FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.affiliates a WHERE a.id = affiliate_id AND (a.user_id = auth.uid() OR is_admin(auth.uid()))));

-- Referrals
CREATE POLICY "owner view referrals" ON public.referrals FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.affiliates a WHERE a.id = affiliate_id AND (a.user_id = auth.uid() OR is_admin(auth.uid()))));
CREATE POLICY "super admin manage referrals" ON public.referrals FOR ALL
  USING (has_role(auth.uid(), 'super_admin'))
  WITH CHECK (has_role(auth.uid(), 'super_admin'));

-- Commissions
CREATE POLICY "owner view commissions" ON public.commissions FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.affiliates a WHERE a.id = affiliate_id AND (a.user_id = auth.uid() OR is_admin(auth.uid()))));
CREATE POLICY "super admin manage commissions" ON public.commissions FOR ALL
  USING (has_role(auth.uid(), 'super_admin'))
  WITH CHECK (has_role(auth.uid(), 'super_admin'));

-- Payouts
CREATE POLICY "owner view payouts" ON public.payouts FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.affiliates a WHERE a.id = affiliate_id AND (a.user_id = auth.uid() OR is_admin(auth.uid()))));
CREATE POLICY "owner request payout" ON public.payouts FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.affiliates a WHERE a.id = affiliate_id AND a.user_id = auth.uid()));
CREATE POLICY "super admin manage payouts" ON public.payouts FOR ALL
  USING (has_role(auth.uid(), 'super_admin'))
  WITH CHECK (has_role(auth.uid(), 'super_admin'));

-- Updated_at triggers
CREATE TRIGGER affiliates_updated BEFORE UPDATE ON public.affiliates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER commissions_updated BEFORE UPDATE ON public.commissions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER payouts_updated BEFORE UPDATE ON public.payouts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-generate referral code
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  base text;
  candidate text;
  attempts int := 0;
BEGIN
  IF NEW.referral_code IS NOT NULL AND length(NEW.referral_code) > 0 THEN
    RETURN NEW;
  END IF;
  base := lower(regexp_replace(coalesce(split_part(NEW.full_name, ' ', 1), 'aff'), '[^a-zA-Z0-9]', '', 'g'));
  IF length(base) < 3 THEN base := 'aff'; END IF;
  LOOP
    candidate := substr(base, 1, 6) || lpad((floor(random()*9999))::int::text, 4, '0');
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.affiliates WHERE referral_code = candidate);
    attempts := attempts + 1;
    IF attempts > 10 THEN
      candidate := 'aff' || substr(replace(gen_random_uuid()::text,'-',''), 1, 8);
      EXIT;
    END IF;
  END LOOP;
  NEW.referral_code := candidate;
  RETURN NEW;
END $$;

CREATE TRIGGER affiliates_gen_code BEFORE INSERT ON public.affiliates
  FOR EACH ROW EXECUTE FUNCTION public.generate_referral_code();

-- Update handle_new_user to capture referral
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
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
    SELECT id INTO v_aff_id FROM public.affiliates WHERE referral_code = v_ref_code AND status = 'active' LIMIT 1;
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
    v_ref_code, v_aff_id
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
END $$;

-- Trigger on auth.users (recreate)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Commission credit on profile becoming paid pro
CREATE OR REPLACE FUNCTION public.credit_affiliate_commission()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_aff public.affiliates%ROWTYPE;
  v_sale numeric := 29;
  v_rate numeric;
  v_commission numeric;
  v_existing int;
BEGIN
  IF NEW.referred_by_affiliate_id IS NULL THEN RETURN NEW; END IF;
  IF NEW.plan <> 'pro' OR NEW.payment_status <> 'paid' THEN RETURN NEW; END IF;
  IF OLD.plan = 'pro' AND OLD.payment_status = 'paid' THEN RETURN NEW; END IF;

  SELECT * INTO v_aff FROM public.affiliates WHERE id = NEW.referred_by_affiliate_id;
  IF NOT FOUND OR v_aff.status <> 'active' THEN RETURN NEW; END IF;

  SELECT count(*) INTO v_existing FROM public.commissions
    WHERE affiliate_id = v_aff.id AND referred_user_id = NEW.user_id;
  IF v_existing > 0 THEN RETURN NEW; END IF;

  v_rate := COALESCE(v_aff.commission_rate, 20);
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
END $$;

CREATE TRIGGER profiles_commission_credit AFTER UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.credit_affiliate_commission();
