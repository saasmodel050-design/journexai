DROP POLICY IF EXISTS "admins manage content" ON public.site_content;

CREATE POLICY "admins manage content"
ON public.site_content
FOR ALL
TO authenticated
USING (private.is_admin(auth.uid()))
WITH CHECK (private.is_admin(auth.uid()));

CREATE OR REPLACE FUNCTION public.protect_profile_billing_columns()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NOT NULL
     AND NOT private.has_role(auth.uid(), 'super_admin'::public.app_role) THEN
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

DROP FUNCTION IF EXISTS public.is_admin(uuid);
DROP FUNCTION IF EXISTS public.has_role(uuid, public.app_role);