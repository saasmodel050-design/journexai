CREATE OR REPLACE FUNCTION public.enforce_trade_limits()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_plan text;
  v_day_count int;
  v_month_count int;
BEGIN
  SELECT plan INTO v_plan FROM public.profiles WHERE user_id = NEW.user_id;

  IF v_plan IS NULL THEN
    v_plan := 'free';
  END IF;

  IF v_plan <> 'free' THEN
    RETURN NEW;
  END IF;

  SELECT count(*) INTO v_day_count
  FROM public.trades
  WHERE user_id = NEW.user_id
    AND trade_time >= date_trunc('day', now())
    AND trade_time < date_trunc('day', now()) + interval '1 day';

  IF v_day_count >= 1 THEN
    RAISE EXCEPTION 'Daily trade limit reached for the Free plan. Upgrade to Pro for unlimited trades.'
      USING ERRCODE = 'check_violation';
  END IF;

  SELECT count(*) INTO v_month_count
  FROM public.trades
  WHERE user_id = NEW.user_id
    AND trade_time >= date_trunc('month', now())
    AND trade_time < date_trunc('month', now()) + interval '1 month';

  IF v_month_count >= 30 THEN
    RAISE EXCEPTION 'Monthly trade limit reached for the Free plan. Upgrade to Pro for unlimited trades.'
      USING ERRCODE = 'check_violation';
  END IF;

  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trades_enforce_limits ON public.trades;
CREATE TRIGGER trades_enforce_limits
BEFORE INSERT ON public.trades
FOR EACH ROW EXECUTE FUNCTION public.enforce_trade_limits();