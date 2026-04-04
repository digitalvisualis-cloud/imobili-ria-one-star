
-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create enum types
CREATE TYPE public.tipo_imovel AS ENUM ('apartamento', 'casa', 'chacara', 'sitio', 'terreno', 'comercial');
CREATE TYPE public.finalidade_imovel AS ENUM ('venda', 'aluguel');

-- Create config_site table
CREATE TABLE public.config_site (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome_imobiliaria TEXT NOT NULL DEFAULT '',
  logo_url TEXT,
  favicon_url TEXT,
  endereco_texto TEXT,
  whatsapp TEXT,
  email TEXT,
  google_maps_url TEXT,
  politica_privacidade TEXT,
  termos_uso TEXT,
  politica_cookies TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.config_site ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Anyone can read config_site" ON public.config_site FOR SELECT USING (true);
CREATE POLICY "Anyone can update config_site" ON public.config_site FOR UPDATE USING (true);
CREATE POLICY "Anyone can insert config_site" ON public.config_site FOR INSERT WITH CHECK (true);

-- Trigger
CREATE TRIGGER update_config_site_updated_at
  BEFORE UPDATE ON public.config_site
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default config
INSERT INTO public.config_site (nome_imobiliaria) VALUES ('André Monteiro Imóveis');

-- Create imoveis table
CREATE TABLE public.imoveis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  codigo_imovel TEXT NOT NULL UNIQUE,
  titulo TEXT NOT NULL,
  descricao TEXT,
  tipo public.tipo_imovel NOT NULL DEFAULT 'apartamento',
  finalidade public.finalidade_imovel NOT NULL DEFAULT 'venda',
  preco NUMERIC(15,2) NOT NULL DEFAULT 0,
  quartos INTEGER DEFAULT 0,
  banheiros INTEGER DEFAULT 0,
  vagas INTEGER DEFAULT 0,
  area_m2 NUMERIC(10,2) DEFAULT 0,
  bairro TEXT,
  cidade TEXT,
  estado TEXT DEFAULT 'SP',
  imagens TEXT[] DEFAULT '{}',
  capa_url TEXT,
  destaque BOOLEAN DEFAULT false,
  publicado BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.imoveis ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read published imoveis" ON public.imoveis FOR SELECT USING (true);
CREATE POLICY "Anyone can insert imoveis" ON public.imoveis FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update imoveis" ON public.imoveis FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete imoveis" ON public.imoveis FOR DELETE USING (true);

-- Indexes
CREATE INDEX idx_imoveis_publicado ON public.imoveis (publicado);
CREATE INDEX idx_imoveis_destaque ON public.imoveis (destaque);
CREATE INDEX idx_imoveis_tipo ON public.imoveis (tipo);
CREATE INDEX idx_imoveis_finalidade ON public.imoveis (finalidade);
CREATE INDEX idx_imoveis_cidade ON public.imoveis (cidade);
CREATE INDEX idx_imoveis_bairro ON public.imoveis (bairro);
CREATE INDEX idx_imoveis_codigo ON public.imoveis (codigo_imovel);

-- Trigger
CREATE TRIGGER update_imoveis_updated_at
  BEFORE UPDATE ON public.imoveis
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket for property images and site assets
INSERT INTO storage.buckets (id, name, public) VALUES ('imoveis', 'imoveis', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('site-assets', 'site-assets', true);

-- Storage policies
CREATE POLICY "Public read imoveis bucket" ON storage.objects FOR SELECT USING (bucket_id = 'imoveis');
CREATE POLICY "Anyone can upload to imoveis bucket" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'imoveis');
CREATE POLICY "Anyone can update imoveis bucket" ON storage.objects FOR UPDATE USING (bucket_id = 'imoveis');
CREATE POLICY "Anyone can delete from imoveis bucket" ON storage.objects FOR DELETE USING (bucket_id = 'imoveis');

CREATE POLICY "Public read site-assets bucket" ON storage.objects FOR SELECT USING (bucket_id = 'site-assets');
CREATE POLICY "Anyone can upload to site-assets bucket" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'site-assets');
CREATE POLICY "Anyone can update site-assets bucket" ON storage.objects FOR UPDATE USING (bucket_id = 'site-assets');
CREATE POLICY "Anyone can delete from site-assets bucket" ON storage.objects FOR DELETE USING (bucket_id = 'site-assets');
