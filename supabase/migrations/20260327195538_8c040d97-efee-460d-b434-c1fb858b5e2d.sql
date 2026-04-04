
-- Table: api_keys
CREATE TABLE public.api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT 'Chave sem nome',
  key_hash text NOT NULL,
  key_preview text NOT NULL,
  active boolean NOT NULL DEFAULT true,
  last_used_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read api_keys" ON public.api_keys FOR SELECT TO public USING (true);
CREATE POLICY "Anyone can insert api_keys" ON public.api_keys FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Anyone can update api_keys" ON public.api_keys FOR UPDATE TO public USING (true);

-- Table: ai_config (singleton)
CREATE TABLE public.ai_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider text NOT NULL DEFAULT 'gemini',
  model text NOT NULL DEFAULT 'google/gemini-2.5-flash',
  api_key_encrypted text,
  max_tokens integer DEFAULT 1024,
  default_mode text NOT NULL DEFAULT 'enxuto',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.ai_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read ai_config" ON public.ai_config FOR SELECT TO public USING (true);
CREATE POLICY "Anyone can insert ai_config" ON public.ai_config FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Anyone can update ai_config" ON public.ai_config FOR UPDATE TO public USING (true);

-- Insert default row
INSERT INTO public.ai_config (provider, model, default_mode) VALUES ('gemini', 'google/gemini-2.5-flash', 'enxuto');

-- Table: ai_search_logs
CREATE TABLE public.ai_search_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  query text NOT NULL,
  provider text,
  model text,
  filters_extracted jsonb,
  results_count integer DEFAULT 0,
  status text NOT NULL DEFAULT 'success',
  response_time_ms integer,
  tokens_used integer,
  estimated_cost numeric,
  result_ids text[],
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.ai_search_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read ai_search_logs" ON public.ai_search_logs FOR SELECT TO public USING (true);
CREATE POLICY "Anyone can insert ai_search_logs" ON public.ai_search_logs FOR INSERT TO public WITH CHECK (true);
