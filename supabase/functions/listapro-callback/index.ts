import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-listapro-secret",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const DEFAULT_IMOBILIARIA_ID = "default";

// Public callback endpoint — secured by X-ListaPro-Secret header matching the stored secret.
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "method not allowed" }, 405);

  const url = new URL(req.url);
  const job_id = url.searchParams.get("job_id");
  if (!job_id) return json({ error: "missing job_id" }, 400);

  const secretHeader = req.headers.get("x-listapro-secret") ?? "";
  const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

  const { data: cfg } = await admin
    .from("listapro_config")
    .select("webhook_secret")
    .eq("imobiliaria_id", DEFAULT_IMOBILIARIA_ID)
    .maybeSingle();
  if (!cfg) return json({ error: "config not found" }, 404);
  if (secretHeader !== cfg.webhook_secret) return json({ error: "invalid secret" }, 401);

  let body: any = {};
  try { body = await req.json(); } catch { /* noop */ }

  // body: { status: 'done'|'error'|'partial', resultado?: {...}, erro?: string }
  const status = String(body.status ?? "done");
  const update: any = { status, updated_at: new Date().toISOString() };
  if (body.resultado !== undefined) update.resultado = body.resultado;
  if (body.erro) update.erro = String(body.erro).slice(0, 1000);

  const { error } = await admin.from("listapro_jobs").update(update).eq("id", job_id);
  if (error) return json({ error: error.message }, 500);

  return json({ ok: true });
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
