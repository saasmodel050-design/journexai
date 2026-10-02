CREATE OR REPLACE FUNCTION public.enforce_trade_limits()
 RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE
  v_plan text;
  v_day_count int;
  v_month_count int;
  c_daily constant int := 5;    -- must match FREE_DAILY_TRADE_LIMIT in src/hooks/usePlan.ts
  c_monthly constant int := 30; -- must match FREE_MONTHLY_TRADE_LIMIT in src/hooks/usePlan.ts
BEGIN
  SELECT plan INTO v_plan FROM public.profiles WHERE user_id = NEW.user_id;
  IF v_plan IS NULL THEN v_plan := 'free'; END IF;
  IF v_plan <> 'free' THEN RETURN NEW; END IF;

  SELECT count(*) INTO v_day_count FROM public.trades
  WHERE user_id = NEW.user_id
    AND created_at >= date_trunc('day', now())
    AND created_at < date_trunc('day', now()) + interval '1 day';
  IF v_day_count >= c_daily THEN
    RAISE EXCEPTION 'Daily trade limit (%) reached for the Free plan. Upgrade to Pro for unlimited trades.', c_daily
      USING ERRCODE = 'check_violation';
  END IF;

  SELECT count(*) INTO v_month_count FROM public.trades
  WHERE user_id = NEW.user_id
    AND created_at >= date_trunc('month', now())
    AND created_at < date_trunc('month', now()) + interval '1 month';
  IF v_month_count >= c_monthly THEN
    RAISE EXCEPTION 'Monthly trade limit (%) reached for the Free plan. Upgrade to Pro for unlimited trades.', c_monthly
      USING ERRCODE = 'check_violation';
  END IF;

  RETURN NEW;
END $function$;

DROP TRIGGER IF EXISTS trades_enforce_limits ON public.trades;
CREATE TRIGGER trades_enforce_limits BEFORE INSERT ON public.trades
  FOR EACH ROW EXECUTE FUNCTION public.enforce_trade_limits();
REVOKE EXECUTE ON FUNCTION public.enforce_trade_limits() FROM PUBLIC, anon, authenticated;