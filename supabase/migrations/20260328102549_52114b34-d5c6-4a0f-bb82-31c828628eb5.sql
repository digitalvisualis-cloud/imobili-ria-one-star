
-- Enum de roles
CREATE TYPE public.app_role AS ENUM ('admin', 'editor', 'viewer');

-- Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  must_change_password BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- User roles
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Login attempts
CREATE TABLE public.login_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address TEXT NOT NULL,
  email TEXT,
  attempt_count INTEGER DEFAULT 1,
  first_attempt_at TIMESTAMPTZ DEFAULT now(),
  blocked_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.login_attempts ENABLE ROW LEVEL SECURITY;

-- API request logs
CREATE TABLE public.api_request_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL,
  status_code INTEGER,
  ip_address TEXT,
  api_key_id UUID REFERENCES public.api_keys(id),
  response_time_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.api_request_logs ENABLE ROW LEVEL SECURITY;

-- Add created_by_user_id to api_keys
ALTER TABLE public.api_keys ADD COLUMN created_by_user_id UUID REFERENCES auth.users(id);

-- has_role function (security definer)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Helper: check if user has any admin/editor/viewer role
CREATE OR REPLACE FUNCTION public.has_any_role(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id
  )
$$;

-- Trigger to auto-create profile on user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- RLS POLICIES
-- =============================================

-- PROFILES: users read own, admin reads all
CREATE POLICY "Users can read own profile" ON public.profiles
  FOR SELECT TO authenticated
  USING (id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "Service can insert profiles" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- USER_ROLES: users read own, admin reads all
CREATE POLICY "Users can read own roles" ON public.user_roles
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admin can insert roles" ON public.user_roles
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admin can update roles" ON public.user_roles
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admin can delete roles" ON public.user_roles
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- LOGIN_ATTEMPTS: edge functions insert (anon/service), admin reads
CREATE POLICY "Anyone can insert login_attempts" ON public.login_attempts
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can read login_attempts" ON public.login_attempts
  FOR SELECT USING (true);

CREATE POLICY "Anyone can update login_attempts" ON public.login_attempts
  FOR UPDATE USING (true);

-- API_REQUEST_LOGS: edge functions insert, admin reads
CREATE POLICY "Anyone can insert api_request_logs" ON public.api_request_logs
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin can read api_request_logs" ON public.api_request_logs
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- =============================================
-- UPDATE EXISTING RLS POLICIES
-- =============================================

-- CONFIG_SITE: keep public SELECT, restrict INSERT/UPDATE to authenticated
DROP POLICY IF EXISTS "Anyone can insert config_site" ON public.config_site;
DROP POLICY IF EXISTS "Anyone can update config_site" ON public.config_site;

CREATE POLICY "Authenticated can insert config_site" ON public.config_site
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'));

CREATE POLICY "Authenticated can update config_site" ON public.config_site
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'));

-- IMOVEIS: keep public SELECT for published, restrict mutations
DROP POLICY IF EXISTS "Anyone can insert imoveis" ON public.imoveis;
DROP POLICY IF EXISTS "Anyone can update imoveis" ON public.imoveis;
DROP POLICY IF EXISTS "Anyone can delete imoveis" ON public.imoveis;

CREATE POLICY "Admin/Editor can insert imoveis" ON public.imoveis
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'));

CREATE POLICY "Admin/Editor can update imoveis" ON public.imoveis
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'));

CREATE POLICY "Admin/Editor can delete imoveis" ON public.imoveis
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'));

-- API_KEYS: restrict to admin (and editor read-only)
DROP POLICY IF EXISTS "Anyone can insert api_keys" ON public.api_keys;
DROP POLICY IF EXISTS "Anyone can read api_keys" ON public.api_keys;
DROP POLICY IF EXISTS "Anyone can update api_keys" ON public.api_keys;

CREATE POLICY "Admin can manage api_keys" ON public.api_keys
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Editor can read api_keys" ON public.api_keys
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'editor'));

-- AI_CONFIG: restrict to admin
DROP POLICY IF EXISTS "Anyone can insert ai_config" ON public.ai_config;
DROP POLICY IF EXISTS "Anyone can read ai_config" ON public.ai_config;
DROP POLICY IF EXISTS "Anyone can update ai_config" ON public.ai_config;

CREATE POLICY "Admin can manage ai_config" ON public.ai_config
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Edge function reads ai_config via service role, so public SELECT not needed

-- AI_SEARCH_LOGS: keep public INSERT (edge function), restrict SELECT to authenticated
DROP POLICY IF EXISTS "Anyone can read ai_search_logs" ON public.ai_search_logs;

CREATE POLICY "Authenticated can read ai_search_logs" ON public.ai_search_logs
  FOR SELECT TO authenticated
  USING (public.has_any_role(auth.uid()));

-- Updated_at trigger for profiles
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
