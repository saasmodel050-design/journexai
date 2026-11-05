CREATE OR REPLACE FUNCTION public.admin_set_user_plan(p_user_id uuid, p_plan text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, private
AS $$
DECLARE
  v_before jsonb;
  v_after jsonb;
BEGIN
  IF auth.uid() IS NULL OR NOT private.has_role(auth.uid(), 'super_admin'::public.app_role) THEN
    RAISE EXCEPTION 'not authorized' USING ERRCODE = '42501';
  END IF;

  IF p_plan NOT IN ('free', 'pro') THEN
    RAISE EXCEPTION 'invalid plan';
  END IF;

  SELECT jsonb_build_object(
    'plan', plan,
    'plan_status', plan_status,
    'subscription_type', subscription_type,
    'payment_status', payment_status,
    'pro_until', pro_until,
    'cancel_at_period_end', cancel_at_period_end
  )
  INTO v_before
  FROM public.profiles
  WHERE user_id = p_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'profile not found';
  END IF;

  UPDATE public.profiles
  SET plan = p_plan,
      plan_status = 'active',
      subscription_type = 'none',
      payment_status = 'unpaid',
      trial_start_date = NULL,
      trial_end_date = NULL,
      pro_until = NULL,
      cancel_at_period_end = false,
      updated_at = now()
  WHERE user_id = p_user_id
  RETURNING jsonb_build_object(
    'plan', plan,
    'plan_status', plan_status,
    'subscription_type', subscription_type,
    'payment_status', payment_status,
    'pro_until', pro_until,
    'cancel_at_period_end', cancel_at_period_end
  ) INTO v_after;

  PERFORM public.log_admin_audit(
    'update_user_plan',
    'profiles',
    p_user_id::text,
    v_before,
    v_after
  );
END;
$$;

REVOKE ALL ON FUNCTION public.admin_set_user_plan(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_set_user_plan(uuid, text) TO authenticated;