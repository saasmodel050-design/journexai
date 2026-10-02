CREATE OR REPLACE FUNCTION public.credit_affiliate_commission()
 RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE
  v_aff public.affiliates%ROWTYPE;
  v_sale numeric;
  v_rate numeric;
  v_commission numeric;
  v_existing int;
  v_yearly boolean := (NEW.subscription_type = 'yearly');
BEGIN
  IF NEW.referred_by_affiliate_id IS NULL THEN RETURN NEW; END IF;
  IF NEW.plan <> 'pro' OR NEW.payment_status <> 'paid' THEN RETURN NEW; END IF;
  IF OLD.plan = 'pro' AND OLD.payment_status = 'paid' THEN RETURN NEW; END IF;

  SELECT * INTO v_aff FROM public.affiliates WHERE id = NEW.referred_by_affiliate_id;
  IF NOT FOUND OR v_aff.status <> 'active' THEN RETURN NEW; END IF;
  IF v_aff.user_id = NEW.user_id THEN RETURN NEW; END IF;

  SELECT count(*) INTO v_existing FROM public.commissions
    WHERE affiliate_id = v_aff.id AND referred_user_id = NEW.user_id;
  IF v_existing > 0 THEN RETURN NEW; END IF;

  -- Actual live Pro price for the purchased billing period
  SELECT CASE WHEN v_yearly THEN yearly_price ELSE monthly_price END INTO v_sale
  FROM public.plans
  WHERE active = true AND monthly_price > 0 AND (slug IN ('pro','plan-pro') OR lower(name) = 'pro')
  ORDER BY sort_order LIMIT 1;
  IF v_sale IS NULL OR v_sale <= 0 THEN RETURN NEW; END IF;

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