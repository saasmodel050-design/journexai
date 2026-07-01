
-- 1. Drop the public SECURITY DEFINER function callable by anon/authenticated
DROP FUNCTION IF EXISTS public.track_affiliate_click(text, text, text);

-- 2. Re-assert site_content column-level grants so draft is NEVER readable by anon/authenticated
REVOKE ALL ON public.site_content FROM anon, authenticated;
GRANT SELECT (id, page, section_key, published, updated_at) ON public.site_content TO anon, authenticated;
GRANT INSERT (id, page, section_key, draft, published), UPDATE (page, section_key, draft, published), DELETE ON public.site_content TO authenticated;
GRANT ALL ON public.site_content TO service_role;
