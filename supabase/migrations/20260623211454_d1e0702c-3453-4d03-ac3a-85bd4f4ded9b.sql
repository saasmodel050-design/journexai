
DROP POLICY IF EXISTS "authenticated write own scoped topics" ON realtime.messages;
CREATE POLICY "authenticated write own scoped topics"
  ON realtime.messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    realtime.topic() LIKE ('user:' || auth.uid()::text || ':%')
  );

REVOKE SELECT ON public.site_content FROM anon, authenticated;
GRANT SELECT (id, page, section_key, published, updated_at) ON public.site_content TO anon, authenticated;

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.generate_referral_code() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.prevent_affiliate_privilege_escalation() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.activate_pro_on_approval() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.credit_affiliate_commission() FROM PUBLIC, anon, authenticated;
