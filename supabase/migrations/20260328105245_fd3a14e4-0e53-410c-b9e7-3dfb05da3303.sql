CREATE TABLE public.imovel_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  imovel_id uuid NOT NULL REFERENCES public.imoveis(id) ON DELETE CASCADE,
  viewer_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_imovel_views_imovel_id ON public.imovel_views(imovel_id);
CREATE UNIQUE INDEX idx_imovel_views_unique ON public.imovel_views(imovel_id, viewer_hash);

ALTER TABLE public.imovel_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert views" ON public.imovel_views
  FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Anyone can read views" ON public.imovel_views
  FOR SELECT TO public USING (true);