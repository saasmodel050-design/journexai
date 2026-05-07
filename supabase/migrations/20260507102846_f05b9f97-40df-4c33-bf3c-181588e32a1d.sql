
-- ============ ROLES ============
CREATE TYPE public.app_role AS ENUM ('super_admin', 'support_admin', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role IN ('super_admin','support_admin'))
$$;

CREATE POLICY "users see own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id OR public.is_admin(auth.uid()));
CREATE POLICY "super admins manage roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(),'super_admin')) WITH CHECK (public.has_role(auth.uid(),'super_admin'));

-- Allow admins to view all profiles & trades
CREATE POLICY "admins view all profiles" ON public.profiles FOR SELECT USING (public.is_admin(auth.uid()));
CREATE POLICY "super admin update profiles" ON public.profiles FOR UPDATE USING (public.has_role(auth.uid(),'super_admin'));
CREATE POLICY "super admin delete profiles" ON public.profiles FOR DELETE USING (public.has_role(auth.uid(),'super_admin'));
CREATE POLICY "admins view all trades" ON public.trades FOR SELECT USING (public.is_admin(auth.uid()));
CREATE POLICY "super admin delete trades" ON public.trades FOR DELETE USING (public.has_role(auth.uid(),'super_admin'));

-- ============ PLANS ============
CREATE TABLE public.plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  monthly_price NUMERIC NOT NULL DEFAULT 0,
  yearly_price NUMERIC NOT NULL DEFAULT 0,
  daily_trade_limit INTEGER,
  monthly_trade_limit INTEGER,
  ai_trainer_enabled BOOLEAN NOT NULL DEFAULT false,
  reports_enabled BOOLEAN NOT NULL DEFAULT false,
  strategies_enabled BOOLEAN NOT NULL DEFAULT false,
  insights_enabled BOOLEAN NOT NULL DEFAULT false,
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "plans public read" ON public.plans FOR SELECT USING (true);
CREATE POLICY "super admin manage plans" ON public.plans FOR ALL USING (public.has_role(auth.uid(),'super_admin')) WITH CHECK (public.has_role(auth.uid(),'super_admin'));
CREATE TRIGGER plans_updated_at BEFORE UPDATE ON public.plans FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ SITE CONTENT (CMS) ============
CREATE TABLE public.site_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page TEXT NOT NULL,
  section_key TEXT NOT NULL,
  draft JSONB NOT NULL DEFAULT '{}'::jsonb,
  published JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (page, section_key)
);
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "content public read" ON public.site_content FOR SELECT USING (true);
CREATE POLICY "super admin manage content" ON public.site_content FOR ALL USING (public.has_role(auth.uid(),'super_admin')) WITH CHECK (public.has_role(auth.uid(),'super_admin'));
CREATE TRIGGER site_content_updated_at BEFORE UPDATE ON public.site_content FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ FEATURE FLAGS ============
CREATE TABLE public.feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  label TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT true,
  description TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "flags public read" ON public.feature_flags FOR SELECT USING (true);
CREATE POLICY "super admin manage flags" ON public.feature_flags FOR ALL USING (public.has_role(auth.uid(),'super_admin')) WITH CHECK (public.has_role(auth.uid(),'super_admin'));
CREATE TRIGGER feature_flags_updated_at BEFORE UPDATE ON public.feature_flags FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ AI SETTINGS ============
CREATE TABLE public.ai_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  personality TEXT NOT NULL DEFAULT 'professional_coach',
  system_prompt TEXT NOT NULL DEFAULT '',
  daily_message_limit INTEGER NOT NULL DEFAULT 5,
  free_access BOOLEAN NOT NULL DEFAULT false,
  response_depth TEXT NOT NULL DEFAULT 'detailed',
  model TEXT NOT NULL DEFAULT 'google/gemini-2.5-flash',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.ai_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ai settings public read" ON public.ai_settings FOR SELECT USING (true);
CREATE POLICY "super admin manage ai settings" ON public.ai_settings FOR ALL USING (public.has_role(auth.uid(),'super_admin')) WITH CHECK (public.has_role(auth.uid(),'super_admin'));
CREATE TRIGGER ai_settings_updated_at BEFORE UPDATE ON public.ai_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ AI USAGE LOGS ============
CREATE TABLE public.ai_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  prompt TEXT,
  response TEXT,
  tokens INTEGER,
  error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.ai_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users insert own ai logs" ON public.ai_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "admins view ai logs" ON public.ai_logs FOR SELECT USING (public.is_admin(auth.uid()));

-- ============ NOTIFICATIONS ============
CREATE TABLE public.platform_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  body TEXT,
  type TEXT NOT NULL DEFAULT 'announcement', -- announcement|update|warning|maintenance
  display TEXT NOT NULL DEFAULT 'banner',     -- banner|popup|email
  active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.platform_notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notifications public read active" ON public.platform_notifications FOR SELECT USING (active OR public.is_admin(auth.uid()));
CREATE POLICY "super admin manage notifications" ON public.platform_notifications FOR ALL USING (public.has_role(auth.uid(),'super_admin')) WITH CHECK (public.has_role(auth.uid(),'super_admin'));

-- ============ SUPPORT TICKETS ============
CREATE TABLE public.support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open', -- open|pending|resolved|closed
  priority TEXT NOT NULL DEFAULT 'normal',
  assigned_to UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users see own tickets" ON public.support_tickets FOR SELECT USING (auth.uid() = user_id OR public.is_admin(auth.uid()));
CREATE POLICY "users create own tickets" ON public.support_tickets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "admins manage tickets" ON public.support_tickets FOR UPDATE USING (public.is_admin(auth.uid()));
CREATE POLICY "super admin delete tickets" ON public.support_tickets FOR DELETE USING (public.has_role(auth.uid(),'super_admin'));
CREATE TRIGGER tickets_updated_at BEFORE UPDATE ON public.support_tickets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.ticket_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  author_id UUID NOT NULL,
  is_admin_reply BOOLEAN NOT NULL DEFAULT false,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.ticket_replies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "view replies for accessible tickets" ON public.ticket_replies FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.support_tickets t WHERE t.id = ticket_id AND (t.user_id = auth.uid() OR public.is_admin(auth.uid())))
);
CREATE POLICY "create replies for accessible tickets" ON public.ticket_replies FOR INSERT WITH CHECK (
  auth.uid() = author_id AND EXISTS (SELECT 1 FROM public.support_tickets t WHERE t.id = ticket_id AND (t.user_id = auth.uid() OR public.is_admin(auth.uid())))
);

-- ============ AUDIT LOGS ============
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID,
  action TEXT NOT NULL,
  entity TEXT,
  entity_id TEXT,
  before JSONB,
  after JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins view audit logs" ON public.audit_logs FOR SELECT USING (public.is_admin(auth.uid()));
CREATE POLICY "admins write audit logs" ON public.audit_logs FOR INSERT WITH CHECK (public.is_admin(auth.uid()) AND auth.uid() = admin_id);

-- ============ Update handle_new_user to add 'user' role ============
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
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
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user') ON CONFLICT DO NOTHING;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============ SEED DATA ============
INSERT INTO public.plans (slug,name,monthly_price,yearly_price,daily_trade_limit,monthly_trade_limit,ai_trainer_enabled,reports_enabled,strategies_enabled,insights_enabled,features,sort_order) VALUES
('free','Free',0,0,1,30,false,false,false,false,'["1 trade/day","30 trades/month","Basic journaling"]'::jsonb,1),
('pro','Pro',29,290,NULL,NULL,true,true,true,true,'["Unlimited trades","AI Trainer","Reports","Strategies","Advanced insights"]'::jsonb,2)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.feature_flags (key,label,description,enabled) VALUES
('ai_trainer','AI Trainer','Enable AI Trainer chat',true),
('reports','Reports','Enable reports module',true),
('strategies','Strategies','Enable strategy analysis',true),
('insights','AI Insights','Enable AI insights cards',true),
('analytics','Analytics Dashboard','Enable analytics page',true),
('notifications','Notifications','Enable in-app notifications',true),
('email_alerts','Email Alerts','Enable email alerts',false),
('chat_system','Chat System','Enable chat system',true)
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.ai_settings (personality, system_prompt, daily_message_limit, free_access, response_depth, model)
SELECT 'professional_coach', 'You are Journex AI, a professional trading coach. Analyze the user''s recent trades and give clear, actionable, data-driven feedback. Be concise, supportive, and specific.', 5, false, 'detailed', 'google/gemini-2.5-flash'
WHERE NOT EXISTS (SELECT 1 FROM public.ai_settings);

-- Promote saasmodel050@gmail.com to super_admin and ensure user role exists
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'super_admin'::app_role FROM auth.users WHERE email = 'saasmodel050@gmail.com'
ON CONFLICT DO NOTHING;
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'user'::app_role FROM auth.users WHERE email = 'saasmodel050@gmail.com'
ON CONFLICT DO NOTHING;
