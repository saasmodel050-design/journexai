
-- 1. Revoke EXECUTE on SECURITY DEFINER functions from public/anon/authenticated
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.activate_pro_on_approval() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.credit_affiliate_commission() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.generate_referral_code() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_admin(uuid) FROM PUBLIC, anon;

-- 2. affiliates: prevent privilege escalation via UPDATE
CREATE OR REPLACE FUNCTION public.prevent_affiliate_privilege_escalation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF public.has_role(auth.uid(), 'super_admin'::app_role) THEN
    RETURN NEW;
  END IF;
  NEW.commission_rate := OLD.commission_rate;
  NEW.status := OLD.status;
  NEW.approved_at := OLD.approved_at;
  NEW.paid_earnings := OLD.paid_earnings;
  NEW.pending_earnings := OLD.pending_earnings;
  NEW.total_earnings := OLD.total_earnings;
  NEW.total_conversions := OLD.total_conversions;
  NEW.total_referrals := OLD.total_referrals;
  NEW.total_clicks := OLD.total_clicks;
  NEW.user_id := OLD.user_id;
  NEW.email := OLD.email;
  NEW.referral_code := OLD.referral_code;
  RETURN NEW;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.prevent_affiliate_privilege_escalation() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS affiliates_prevent_escalation ON public.affiliates;
CREATE TRIGGER affiliates_prevent_escalation
BEFORE UPDATE ON public.affiliates
FOR EACH ROW EXECUTE FUNCTION public.prevent_affiliate_privilege_escalation();

-- 3. ai_settings: remove public read access (admins still manage via existing ALL policy)
DROP POLICY IF EXISTS "ai settings public read" ON public.ai_settings;

-- 4. audit_logs: remove direct client INSERT; add SECURITY DEFINER RPC
DROP POLICY IF EXISTS "admins write audit logs" ON public.audit_logs;

CREATE OR REPLACE FUNCTION public.log_admin_audit(
  p_action text,
  p_entity text DEFAULT NULL,
  p_entity_id text DEFAULT NULL,
  p_before jsonb DEFAULT NULL,
  p_after jsonb DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id uuid;
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'not authorized';
  END IF;
  INSERT INTO public.audit_logs (admin_id, action, entity, entity_id, before, after)
  VALUES (auth.uid(), p_action, p_entity, p_entity_id, p_before, p_after)
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.log_admin_audit(text, text, text, jsonb, jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.log_admin_audit(text, text, text, jsonb, jsonb) TO authenticated;

-- 5. affiliate_clicks: drop always-true insert policy; route through SECURITY DEFINER RPC only
DROP POLICY IF EXISTS "anyone log clicks" ON public.affiliate_clicks;
-- track_affiliate_click stays callable from anon (definer bypasses RLS)
GRANT EXECUTE ON FUNCTION public.track_affiliate_click(text, text, text) TO anon, authenticated;

-- 6. Realtime: remove sensitive tables from publication
ALTER PUBLICATION supabase_realtime DROP TABLE public.affiliates;
ALTER PUBLICATION supabase_realtime DROP TABLE public.referrals;
ALTER PUBLICATION supabase_realtime DROP TABLE public.commissions;
ALTER PUBLICATION supabase_realtime DROP TABLE public.payouts;
ALTER PUBLICATION supabase_realtime DROP TABLE public.profiles;
ALTER PUBLICATION supabase_realtime DROP TABLE public.ai_settings;

-- 7. Realtime channel policies: default-deny, then allow authenticated to scoped topics
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname='realtime' AND tablename='messages') THEN
    EXECUTE 'ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY';
  END IF;
END $$;

DROP POLICY IF EXISTS "authenticated read own scoped topics" ON realtime.messages;
DROP POLICY IF EXISTS "authenticated write own scoped topics" ON realtime.messages;

CREATE POLICY "authenticated read own scoped topics"
ON realtime.messages
FOR SELECT
TO authenticated
USING (
  realtime.topic() LIKE ('user:' || auth.uid()::text || ':%')
  OR realtime.topic() LIKE 'public:%'
);

CREATE POLICY "authenticated write own scoped topics"
ON realtime.messages
FOR INSERT
TO authenticated
WITH CHECK (
  realtime.topic() LIKE ('user:' || auth.uid()::text || ':%')
  OR realtime.topic() LIKE 'public:%'
);

-- 8. Storage: add UPDATE and DELETE policies on payment-proofs
DROP POLICY IF EXISTS "Users update own payment proofs" ON storage.objects;
DROP POLICY IF EXISTS "Users delete own payment proofs" ON storage.objects;
DROP POLICY IF EXISTS "Admins delete payment proofs" ON storage.objects;

CREATE POLICY "Users update own payment proofs"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'payment-proofs'
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'payment-proofs'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users delete own payment proofs"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'payment-proofs'
  AND (
    (storage.foldername(name))[1] = auth.uid()::text
    OR public.is_admin(auth.uid())
  )
);
