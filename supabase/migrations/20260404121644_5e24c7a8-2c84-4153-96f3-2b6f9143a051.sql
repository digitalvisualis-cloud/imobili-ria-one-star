-- has_any_role helper
CREATE OR REPLACE FUNCTION public.has_any_role(_user_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id) $$;

-- Enum types
DO $$ BEGIN CREATE TYPE public.tipo_imovel AS ENUM ('apartamento', 'casa', 'chacara', 'sitio', 'terreno', 'comercial'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.finalidade_imovel AS ENUM ('venda', 'aluguel'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- config_site
CREATE TABLE public.config_site (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome_imobiliaria TEXT NOT NULL DEFAULT '',
  logo_url TEXT, favicon_url TEXT, endereco_texto TEXT, whatsapp TEXT, email TEXT,
  google_maps_url TEXT, politica_privacidade TEXT, termos_uso TEXT, politica_cookies TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.config_site ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read config_site" ON public.config_site FOR SELECT USING (true);
CREATE POLICY "Admin update config_site" ON public.config_site FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin insert config_site" ON public.config_site FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER update_config_site_updated_at BEFORE UPDATE ON public.config_site FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
INSERT INTO public.config_site (nome_imobiliaria) VALUES ('Imobiliária One Star');

-- imoveis
CREATE TABLE public.imoveis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo_imovel TEXT NOT NULL UNIQUE, titulo TEXT NOT NULL, descricao TEXT,
  tipo public.tipo_imovel NOT NULL DEFAULT 'apartamento',
  finalidade public.finalidade_imovel NOT NULL DEFAULT 'venda',
  preco NUMERIC(15,2) NOT NULL DEFAULT 0, quartos INTEGER DEFAULT 0, banheiros INTEGER DEFAULT 0,
  vagas INTEGER DEFAULT 0, area_m2 NUMERIC(10,2) DEFAULT 0,
  bairro TEXT, cidade TEXT, estado TEXT DEFAULT 'SP',
  imagens TEXT[] DEFAULT '{}', capa_url TEXT, destaque BOOLEAN DEFAULT false,
  publicado BOOLEAN DEFAULT true, mapa_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.imoveis ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read imoveis" ON public.imoveis FOR SELECT USING (true);
CREATE POLICY "Auth insert imoveis" ON public.imoveis FOR INSERT TO authenticated WITH CHECK (public.has_any_role(auth.uid()));
CREATE POLICY "Auth update imoveis" ON public.imoveis FOR UPDATE TO authenticated USING (public.has_any_role(auth.uid()));
CREATE POLICY "Admin delete imoveis" ON public.imoveis FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE INDEX idx_imoveis_publicado ON public.imoveis (publicado);
CREATE INDEX idx_imoveis_destaque ON public.imoveis (destaque);
CREATE INDEX idx_imoveis_tipo ON public.imoveis (tipo);
CREATE INDEX idx_imoveis_finalidade ON public.imoveis (finalidade);
CREATE INDEX idx_imoveis_cidade ON public.imoveis (cidade);
CREATE INDEX idx_imoveis_bairro ON public.imoveis (bairro);
CREATE INDEX idx_imoveis_codigo ON public.imoveis (codigo_imovel);
CREATE TRIGGER update_imoveis_updated_at BEFORE UPDATE ON public.imoveis FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- api_keys
CREATE TABLE public.api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL DEFAULT 'Chave sem nome', key_hash TEXT NOT NULL, key_preview TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true, last_used_at TIMESTAMPTZ,
  created_by_user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin read api_keys" ON public.api_keys FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin insert api_keys" ON public.api_keys FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin update api_keys" ON public.api_keys FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- ai_config
CREATE TABLE public.ai_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL DEFAULT 'gemini', model TEXT NOT NULL DEFAULT 'google/gemini-2.5-flash',
  api_key_encrypted TEXT, max_tokens INTEGER DEFAULT 1024, default_mode TEXT NOT NULL DEFAULT 'enxuto',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.ai_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin read ai_config" ON public.ai_config FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin insert ai_config" ON public.ai_config FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin update ai_config" ON public.ai_config FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
INSERT INTO public.ai_config (provider, model, default_mode) VALUES ('gemini', 'google/gemini-2.5-flash', 'enxuto');

-- ai_search_logs
CREATE TABLE public.ai_search_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  query TEXT NOT NULL, provider TEXT, model TEXT, filters_extracted JSONB,
  results_count INTEGER DEFAULT 0, status TEXT NOT NULL DEFAULT 'success',
  response_time_ms INTEGER, tokens_used INTEGER, estimated_cost NUMERIC, result_ids TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.ai_search_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin read ai_search_logs" ON public.ai_search_logs FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Service insert ai_search_logs" ON public.ai_search_logs FOR INSERT TO public WITH CHECK (true);

-- login_attempts
CREATE TABLE public.login_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address TEXT NOT NULL, email TEXT, attempt_count INTEGER DEFAULT 1,
  first_attempt_at TIMESTAMPTZ DEFAULT now(), blocked_until TIMESTAMPTZ, created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.login_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin read login_attempts" ON public.login_attempts FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- api_request_logs
CREATE TABLE public.api_request_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  endpoint TEXT NOT NULL, method TEXT NOT NULL, status_code INTEGER, ip_address TEXT,
  api_key_id UUID REFERENCES public.api_keys(id), response_time_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.api_request_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin read api_request_logs" ON public.api_request_logs FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- imovel_views
CREATE TABLE public.imovel_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  imovel_id UUID NOT NULL REFERENCES public.imoveis(id) ON DELETE CASCADE,
  viewer_hash TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_imovel_views_imovel_id ON public.imovel_views(imovel_id);
CREATE UNIQUE INDEX idx_imovel_views_unique ON public.imovel_views(imovel_id, viewer_hash);
ALTER TABLE public.imovel_views ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public insert views" ON public.imovel_views FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Public read views" ON public.imovel_views FOR SELECT TO public USING (true);

-- Storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('imoveis', 'imoveis', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('site-assets', 'site-assets', true);
CREATE POLICY "Public read imoveis bucket" ON storage.objects FOR SELECT USING (bucket_id = 'imoveis');
CREATE POLICY "Auth upload imoveis bucket" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'imoveis');
CREATE POLICY "Auth update imoveis bucket" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'imoveis');
CREATE POLICY "Auth delete imoveis bucket" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'imoveis');
CREATE POLICY "Public read site-assets bucket" ON storage.objects FOR SELECT USING (bucket_id = 'site-assets');
CREATE POLICY "Auth upload site-assets bucket" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'site-assets');
CREATE POLICY "Auth update site-assets bucket" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'site-assets');
CREATE POLICY "Auth delete site-assets bucket" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'site-assets');

-- Fix IMOBILIARIA_ANDRE policies to require admin role
DROP POLICY IF EXISTS "leads_select" ON "IMOBILIARIA_ANDRE";
DROP POLICY IF EXISTS "leads_insert" ON "IMOBILIARIA_ANDRE";
DROP POLICY IF EXISTS "leads_update" ON "IMOBILIARIA_ANDRE";
DROP POLICY IF EXISTS "leads_delete" ON "IMOBILIARIA_ANDRE";
CREATE POLICY "leads_select" ON "IMOBILIARIA_ANDRE" FOR SELECT TO authenticated USING (public.has_any_role(auth.uid()));
CREATE POLICY "leads_insert" ON "IMOBILIARIA_ANDRE" FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "leads_update" ON "IMOBILIARIA_ANDRE" FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "leads_delete" ON "IMOBILIARIA_ANDRE" FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Add INSERT policy for profiles
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);