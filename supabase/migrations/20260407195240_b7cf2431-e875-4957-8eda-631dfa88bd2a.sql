
-- Fix 1: Add unique constraint to imovel_views to prevent view count manipulation
ALTER TABLE imovel_views ADD CONSTRAINT uq_imovel_viewer UNIQUE (imovel_id, viewer_hash);

-- Fix 2: Restrict imoveis INSERT/UPDATE to admin and editor roles only
DROP POLICY "Auth insert imoveis" ON imoveis;
DROP POLICY "Auth update imoveis" ON imoveis;

CREATE POLICY "Auth insert imoveis" ON imoveis FOR INSERT
  TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'editor'::app_role));

CREATE POLICY "Auth update imoveis" ON imoveis FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'editor'::app_role));
