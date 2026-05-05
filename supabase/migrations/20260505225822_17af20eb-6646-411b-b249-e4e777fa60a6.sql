
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS plan text NOT NULL DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS plan_status text NOT NULL DEFAULT 'active';

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, experience_level, market_type, plan, plan_status)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'experience_level', 'beginner'),
    COALESCE(NEW.raw_user_meta_data->>'market_type', 'crypto'),
    'free',
    'active'
  );
  RETURN NEW;
END;
$function$;
