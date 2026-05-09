
CREATE OR REPLACE FUNCTION public.track_affiliate_click(
  _code text, _ua text DEFAULT NULL, _referrer text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_aff_id uuid;
BEGIN
  SELECT id INTO v_aff_id FROM public.affiliates
    WHERE referral_code = _code AND status = 'active' LIMIT 1;
  IF v_aff_id IS NULL THEN RETURN; END IF;
  INSERT INTO public.affiliate_clicks (affiliate_id, referral_code, user_agent, referrer)
    VALUES (v_aff_id, _code, _ua, _referrer);
  UPDATE public.affiliates SET total_clicks = total_clicks + 1 WHERE id = v_aff_id;
END $$;

REVOKE ALL ON FUNCTION public.track_affiliate_click(text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.track_affiliate_click(text, text, text) TO anon, authenticated;
