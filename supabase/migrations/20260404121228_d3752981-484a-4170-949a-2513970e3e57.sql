-- Remove the overly permissive public policy
DROP POLICY IF EXISTS "POLITICA_PRIVACIDADE" ON "IMOBILIARIA_ANDRE";

-- Create restricted policies for authenticated users only
CREATE POLICY "leads_select" ON "IMOBILIARIA_ANDRE"
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "leads_insert" ON "IMOBILIARIA_ANDRE"
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "leads_update" ON "IMOBILIARIA_ANDRE"
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "leads_delete" ON "IMOBILIARIA_ANDRE"
  FOR DELETE TO authenticated USING (true);