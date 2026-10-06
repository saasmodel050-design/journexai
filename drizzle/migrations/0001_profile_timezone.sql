ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS timezone text NOT NULL DEFAULT 'UTC';
GRANT UPDATE (timezone) ON public.profiles TO authenticated;

CREATE OR REPLACE FUNCTION public.validate_profile_timezone()
RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public' AS $$
BEGIN
  IF NEW.timezone IS NULL OR NOT EXISTS (SELECT 1 FROM pg_timezone_names WHERE name = NEW.timezone) THEN
    RAISE EXCEPTION 'Invalid timezone: %', NEW.timezone USING ERRCODE = 'check_violation';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER validate_profile_timezone BEFORE INSERT OR UPDATE OF timezone ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.validate_profile_timezone();

CREATE OR REPLACE FUNCTION public.enforce_trade_limits()
 RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE
  v_plan text;
  v_tz text;
  v_local timestamp;
  v_day_start timestamptz;
  v_month_start timestamptz;
  v_day_count int;
  v_month_count int;
  c_daily constant int := 5;    -- must match FREE_DAILY_TRADE_LIMIT in src/lib/plans.ts / usePlan.ts
  c_monthly constant int := 30; -- must match FREE_MONTHLY_TRADE_LIMIT
BEGIN
  SELECT plan, COALESCE(timezone, 'UTC') INTO v_plan, v_tz FROM public.profiles WHERE user_id = NEW.user_id;
  IF v_plan IS NULL THEN v_plan := 'free'; END IF;
  IF v_plan <> 'free' THEN RETURN NEW; END IF;
  IF v_tz IS NULL OR NOT EXISTS (SELECT 1 FROM pg_timezone_names WHERE name = v_tz) THEN v_tz := 'UTC'; END IF;

  v_local := now() AT TIME ZONE v_tz;
  v_day_start := date_trunc('day', v_local) AT TIME ZONE v_tz;
  v_month_start := date_trunc('month', v_local) AT TIME ZONE v_tz;

  SELECT count(*) INTO v_day_count FROM public.trades
  WHERE user_id = NEW.user_id AND created_at >= v_day_start;
  IF v_day_count >= c_daily THEN
    RAISE EXCEPTION 'Daily trade limit (%) reached for the Free plan. Upgrade to Pro for unlimited trades.', c_daily
      USING ERRCODE = 'check_violation';
  END IF;

  SELECT count(*) INTO v_month_count FROM public.trades
  WHERE user_id = NEW.user_id AND created_at >= v_month_start;
  IF v_month_count >= c_monthly THEN
    RAISE EXCEPTION 'Monthly trade limit (%) reached for the Free plan. Upgrade to Pro for unlimited trades.', c_monthly
      USING ERRCODE = 'check_violation';
  END IF;
  RETURN NEW;
END $function$;