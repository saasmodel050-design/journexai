
CREATE SCHEMA IF NOT EXISTS private;
GRANT USAGE ON SCHEMA private TO authenticated, anon, service_role;

CREATE OR REPLACE FUNCTION private.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;
CREATE OR REPLACE FUNCTION private.is_admin(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role IN ('super_admin','support_admin'))
$$;
REVOKE ALL ON FUNCTION private.has_role(uuid, public.app_role) FROM PUBLIC;
REVOKE ALL ON FUNCTION private.is_admin(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.is_admin(uuid) TO authenticated, service_role;

-- Recreate all dependent policies to reference private.* helpers
DROP POLICY IF EXISTS "users see own roles" ON public.user_roles;
CREATE POLICY "users see own roles" ON public.user_roles FOR SELECT USING ((auth.uid() = user_id) OR private.is_admin(auth.uid()));
DROP POLICY IF EXISTS "super admins manage roles" ON public.user_roles;
CREATE POLICY "super admins manage roles" ON public.user_roles FOR ALL USING (private.has_role(auth.uid(),'super_admin')) WITH CHECK (private.has_role(auth.uid(),'super_admin'));

DROP POLICY IF EXISTS "admins view all profiles" ON public.profiles;
CREATE POLICY "admins view all profiles" ON public.profiles FOR SELECT USING (private.is_admin(auth.uid()));
DROP POLICY IF EXISTS "super admin update profiles" ON public.profiles;
CREATE POLICY "super admin update profiles" ON public.profiles FOR UPDATE USING (private.has_role(auth.uid(),'super_admin'));
DROP POLICY IF EXISTS "super admin delete profiles" ON public.profiles;
CREATE POLICY "super admin delete profiles" ON public.profiles FOR DELETE USING (private.has_role(auth.uid(),'super_admin'));

DROP POLICY IF EXISTS "admins view all trades" ON public.trades;
CREATE POLICY "admins view all trades" ON public.trades FOR SELECT USING (private.is_admin(auth.uid()));
DROP POLICY IF EXISTS "super admin delete trades" ON public.trades;
CREATE POLICY "super admin delete trades" ON public.trades FOR DELETE USING (private.has_role(auth.uid(),'super_admin'));

DROP POLICY IF EXISTS "super admin manage plans" ON public.plans;
CREATE POLICY "super admin manage plans" ON public.plans FOR ALL USING (private.has_role(auth.uid(),'super_admin')) WITH CHECK (private.has_role(auth.uid(),'super_admin'));

DROP POLICY IF EXISTS "super admin manage content" ON public.site_content;
CREATE POLICY "super admin manage content" ON public.site_content FOR ALL USING (private.has_role(auth.uid(),'super_admin')) WITH CHECK (private.has_role(auth.uid(),'super_admin'));

DROP POLICY IF EXISTS "super admin manage flags" ON public.feature_flags;
CREATE POLICY "super admin manage flags" ON public.feature_flags FOR ALL USING (private.has_role(auth.uid(),'super_admin')) WITH CHECK (private.has_role(auth.uid(),'super_admin'));

DROP POLICY IF EXISTS "super admin manage ai settings" ON public.ai_settings;
CREATE POLICY "super admin manage ai settings" ON public.ai_settings FOR ALL USING (private.has_role(auth.uid(),'super_admin')) WITH CHECK (private.has_role(auth.uid(),'super_admin'));

DROP POLICY IF EXISTS "admins view ai logs" ON public.ai_logs;
CREATE POLICY "admins view ai logs" ON public.ai_logs FOR SELECT USING (private.is_admin(auth.uid()));
DROP POLICY IF EXISTS "users view own ai logs" ON public.ai_logs;
CREATE POLICY "users view own ai logs" ON public.ai_logs FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "notifications public read active" ON public.platform_notifications;
CREATE POLICY "notifications public read active" ON public.platform_notifications FOR SELECT USING (active OR private.is_admin(auth.uid()));
DROP POLICY IF EXISTS "super admin manage notifications" ON public.platform_notifications;
CREATE POLICY "super admin manage notifications" ON public.platform_notifications FOR ALL USING (private.has_role(auth.uid(),'super_admin')) WITH CHECK (private.has_role(auth.uid(),'super_admin'));

DROP POLICY IF EXISTS "users see own tickets" ON public.support_tickets;
CREATE POLICY "users see own tickets" ON public.support_tickets FOR SELECT USING ((auth.uid() = user_id) OR private.is_admin(auth.uid()));
DROP POLICY IF EXISTS "admins manage tickets" ON public.support_tickets;
CREATE POLICY "admins manage tickets" ON public.support_tickets FOR UPDATE USING (private.is_admin(auth.uid()));
DROP POLICY IF EXISTS "super admin delete tickets" ON public.support_tickets;
CREATE POLICY "super admin delete tickets" ON public.support_tickets FOR DELETE USING (private.has_role(auth.uid(),'super_admin'));

DROP POLICY IF EXISTS "view replies for accessible tickets" ON public.ticket_replies;
CREATE POLICY "view replies for accessible tickets" ON public.ticket_replies FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.support_tickets t WHERE t.id = ticket_replies.ticket_id AND (t.user_id = auth.uid() OR private.is_admin(auth.uid()))));
DROP POLICY IF EXISTS "create replies for accessible tickets" ON public.ticket_replies;
CREATE POLICY "create replies for accessible tickets" ON public.ticket_replies FOR INSERT
  WITH CHECK ((auth.uid() = author_id) AND EXISTS (SELECT 1 FROM public.support_tickets t WHERE t.id = ticket_replies.ticket_id AND (t.user_id = auth.uid() OR private.is_admin(auth.uid()))));

DROP POLICY IF EXISTS "admins view audit logs" ON public.audit_logs;
CREATE POLICY "admins view audit logs" ON public.audit_logs FOR SELECT USING (private.is_admin(auth.uid()));
DROP POLICY IF EXISTS "admins insert audit logs" ON public.audit_logs;
CREATE POLICY "admins insert audit logs" ON public.audit_logs FOR INSERT TO authenticated WITH CHECK (private.is_admin(auth.uid()) AND admin_id = auth.uid());

DROP POLICY IF EXISTS "users view own trial history" ON public.trial_history;
CREATE POLICY "users view own trial history" ON public.trial_history FOR SELECT USING ((auth.uid() = user_id) OR private.is_admin(auth.uid()));
DROP POLICY IF EXISTS "super admin manage trial history" ON public.trial_history;
CREATE POLICY "super admin manage trial history" ON public.trial_history FOR ALL USING (private.has_role(auth.uid(),'super_admin')) WITH CHECK (private.has_role(auth.uid(),'super_admin'));

DROP POLICY IF EXISTS "users view own affiliate" ON public.affiliates;
CREATE POLICY "users view own affiliate" ON public.affiliates FOR SELECT USING ((auth.uid() = user_id) OR private.is_admin(auth.uid()));
DROP POLICY IF EXISTS "super admin manage affiliates" ON public.affiliates;
CREATE POLICY "super admin manage affiliates" ON public.affiliates FOR ALL USING (private.has_role(auth.uid(),'super_admin')) WITH CHECK (private.has_role(auth.uid(),'super_admin'));
DROP POLICY IF EXISTS "public lookup active affiliate by code" ON public.affiliates;
CREATE POLICY "public lookup active affiliate by code" ON public.affiliates FOR SELECT TO anon, authenticated USING (status = 'active');

DROP POLICY IF EXISTS "owner view clicks" ON public.affiliate_clicks;
CREATE POLICY "owner view clicks" ON public.affiliate_clicks FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.affiliates a WHERE a.id = affiliate_clicks.affiliate_id AND (a.user_id = auth.uid() OR private.is_admin(auth.uid()))));
DROP POLICY IF EXISTS "public insert affiliate clicks" ON public.affiliate_clicks;
CREATE POLICY "public insert affiliate clicks" ON public.affiliate_clicks FOR INSERT TO anon, authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.affiliates a WHERE a.id = affiliate_clicks.affiliate_id AND a.status = 'active'));

DROP POLICY IF EXISTS "owner view referrals" ON public.referrals;
CREATE POLICY "owner view referrals" ON public.referrals FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.affiliates a WHERE a.id = referrals.affiliate_id AND (a.user_id = auth.uid() OR private.is_admin(auth.uid()))));
DROP POLICY IF EXISTS "super admin manage referrals" ON public.referrals;
CREATE POLICY "super admin manage referrals" ON public.referrals FOR ALL USING (private.has_role(auth.uid(),'super_admin')) WITH CHECK (private.has_role(auth.uid(),'super_admin'));

DROP POLICY IF EXISTS "owner view commissions" ON public.commissions;
CREATE POLICY "owner view commissions" ON public.commissions FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.affiliates a WHERE a.id = commissions.affiliate_id AND (a.user_id = auth.uid() OR private.is_admin(auth.uid()))));
DROP POLICY IF EXISTS "super admin manage commissions" ON public.commissions;
CREATE POLICY "super admin manage commissions" ON public.commissions FOR ALL USING (private.has_role(auth.uid(),'super_admin')) WITH CHECK (private.has_role(auth.uid(),'super_admin'));

DROP POLICY IF EXISTS "owner view payouts" ON public.payouts;
CREATE POLICY "owner view payouts" ON public.payouts FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.affiliates a WHERE a.id = payouts.affiliate_id AND (a.user_id = auth.uid() OR private.is_admin(auth.uid()))));
DROP POLICY IF EXISTS "owner request payouts" ON public.payouts;
CREATE POLICY "owner request payouts" ON public.payouts FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.affiliates a WHERE a.id = payouts.affiliate_id AND a.user_id = auth.uid()));
DROP POLICY IF EXISTS "super admin manage payouts" ON public.payouts;
CREATE POLICY "super admin manage payouts" ON public.payouts FOR ALL USING (private.has_role(auth.uid(),'super_admin')) WITH CHECK (private.has_role(auth.uid(),'super_admin'));

DROP POLICY IF EXISTS "Public read active wallets" ON public.payment_wallets;
CREATE POLICY "Public read active wallets" ON public.payment_wallets FOR SELECT USING ((active = true) OR private.is_admin(auth.uid()));
DROP POLICY IF EXISTS "Admins manage wallets" ON public.payment_wallets;
CREATE POLICY "Admins manage wallets" ON public.payment_wallets FOR ALL USING (private.is_admin(auth.uid())) WITH CHECK (private.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Users view own payments" ON public.crypto_payments;
CREATE POLICY "Users view own payments" ON public.crypto_payments FOR SELECT USING ((auth.uid() = user_id) OR private.is_admin(auth.uid()));
DROP POLICY IF EXISTS "Admins update payments" ON public.crypto_payments;
CREATE POLICY "Admins update payments" ON public.crypto_payments FOR UPDATE USING (private.is_admin(auth.uid())) WITH CHECK (private.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Users read own payment proofs" ON storage.objects;
CREATE POLICY "Users read own payment proofs" ON storage.objects FOR SELECT
  USING ((bucket_id = 'payment-proofs') AND (((storage.foldername(name))[1] = (auth.uid())::text) OR private.is_admin(auth.uid())));
DROP POLICY IF EXISTS "Users delete own payment proofs" ON storage.objects;
CREATE POLICY "Users delete own payment proofs" ON storage.objects FOR DELETE
  USING ((bucket_id = 'payment-proofs') AND (((storage.foldername(name))[1] = (auth.uid())::text) OR private.is_admin(auth.uid())));

-- Now safe to drop public helpers
DROP FUNCTION IF EXISTS public.has_role(uuid, public.app_role);
DROP FUNCTION IF EXISTS public.is_admin(uuid);

-- Update trigger function that still referenced public.has_role
CREATE OR REPLACE FUNCTION public.prevent_affiliate_privilege_escalation()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF private.has_role(auth.uid(),'super_admin') THEN RETURN NEW; END IF;
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
END $$;

-- Replace log_admin_audit with SECURITY INVOKER version (uses RLS insert policy added above)
DROP FUNCTION IF EXISTS public.log_admin_audit(text, text, text, jsonb, jsonb);
CREATE OR REPLACE FUNCTION public.log_admin_audit(p_action text, p_entity text DEFAULT NULL, p_entity_id text DEFAULT NULL, p_before jsonb DEFAULT NULL, p_after jsonb DEFAULT NULL)
RETURNS uuid LANGUAGE plpgsql SECURITY INVOKER SET search_path = public AS $$
DECLARE v_id uuid;
BEGIN
  IF NOT private.is_admin(auth.uid()) THEN RAISE EXCEPTION 'not authorized'; END IF;
  INSERT INTO public.audit_logs (admin_id, action, entity, entity_id, before, after)
  VALUES (auth.uid(), p_action, p_entity, p_entity_id, p_before, p_after)
  RETURNING id INTO v_id;
  RETURN v_id;
END $$;
REVOKE ALL ON FUNCTION public.log_admin_audit(text, text, text, jsonb, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.log_admin_audit(text, text, text, jsonb, jsonb) TO authenticated;

-- Convert track_affiliate_click to SECURITY INVOKER
CREATE OR REPLACE FUNCTION public.track_affiliate_click(_code text, _ua text DEFAULT NULL, _referrer text DEFAULT NULL)
RETURNS void LANGUAGE plpgsql SECURITY INVOKER SET search_path = public AS $$
DECLARE v_aff_id uuid;
BEGIN
  SELECT id INTO v_aff_id FROM public.affiliates WHERE referral_code = _code AND status = 'active' LIMIT 1;
  IF v_aff_id IS NULL THEN RETURN; END IF;
  INSERT INTO public.affiliate_clicks (affiliate_id, referral_code, user_agent, referrer)
    VALUES (v_aff_id, _code, _ua, _referrer);
  BEGIN
    UPDATE public.affiliates SET total_clicks = total_clicks + 1 WHERE id = v_aff_id;
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END $$;
REVOKE ALL ON FUNCTION public.track_affiliate_click(text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.track_affiliate_click(text, text, text) TO anon, authenticated, service_role;

-- Defense in depth: re-assert column-level grants on site_content (draft excluded for anon/authenticated)
REVOKE ALL ON public.site_content FROM anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.site_content TO authenticated; -- RLS still gates writes to super_admin
GRANT SELECT (id, page, section_key, published, updated_at) ON public.site_content TO anon, authenticated;
GRANT ALL ON public.site_content TO service_role;
