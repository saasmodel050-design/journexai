GRANT SELECT, INSERT, UPDATE, DELETE ON public.platform_notifications TO authenticated;
GRANT SELECT ON public.platform_notifications TO anon;
GRANT ALL ON public.platform_notifications TO service_role;