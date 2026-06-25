
-- 1. Remove public read on affiliates; route lookup through SECURITY DEFINER RPC
DROP POLICY IF EXISTS "public lookup active affiliate by code" ON public.affiliates;

CREATE OR REPLACE FUNCTION public.track_affiliate_click(_code text, _ua text DEFAULT NULL::text, _referrer text DEFAULT NULL::text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE v_aff_id uuid;
BEGIN
  SELECT id INTO v_aff_id FROM public.affiliates WHERE referral_code = _code AND status = 'active' LIMIT 1;
  IF v_aff_id IS NULL THEN RETURN; END IF;
  INSERT INTO public.affiliate_clicks (affiliate_id, referral_code, user_agent, referrer)
    VALUES (v_aff_id, _code, _ua, _referrer);
  UPDATE public.affiliates SET total_clicks = total_clicks + 1 WHERE id = v_aff_id;
END $function$;

REVOKE EXECUTE ON FUNCTION public.track_affiliate_click(text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.track_affiliate_click(text, text, text) TO anon, authenticated;

-- 2. Restrict site_content public read to published content only and drop draft access
DROP POLICY IF EXISTS "content public read" ON public.site_content;

CREATE POLICY "published content public read"
ON public.site_content
FOR SELECT
TO anon, authenticated
USING (published IS NOT NULL);

REVOKE ALL ON public.site_content FROM anon, authenticated;
GRANT SELECT (id, page, section_key, published, updated_at) ON public.site_content TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.site_content TO authenticated;
