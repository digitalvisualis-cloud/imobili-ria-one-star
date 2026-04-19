import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

const DEFAULT_IMOBILIARIA_ID = "default";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "method not allowed" }, 405);

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return json({ error: "missing authorization" }, 401);

  const userClient = createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: userData, error: userErr } = await userClient.auth.getUser();
  if (userErr || !userData?.user) return json({ error: "unauthorized" }, 401);

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

  // Any portal user can trigger
  const { data: anyRole } = await admin
    .from("user_roles")
    .select("role")
    .eq("user_id", userData.user.id)
    .limit(1)
    .maybeSingle();
  if (!anyRole) return json({ error: "forbidden" }, 403);

  let body: any = {};
  try { body = await req.json(); } catch { /* noop */ }

  const imovel_id = body.imovel_id ? String(body.imovel_id) : null;
  const pacote = (body.pacote ?? "completo") as string; // 'completo' | 'avancado'
  const assets = Array.isArray(body.assets) ? body.assets : null; // ['pdf','post','story','reels','copy']
  const dados = body.dados ?? null; // dados manuais quando não há imovel_id

  // Load config
  const { data: config, error: cfgErr } = await admin
    .from("listapro_config")
    .select("webhook_url, webhook_secret, branding, ativo")
    .eq("imobiliaria_id", DEFAULT_IMOBILIARIA_ID)
    .maybeSingle();
  if (cfgErr) return json({ error: cfgErr.message }, 500);
  if (!config) return json({ error: "ListaPro não configurado. Vá em /admin/integracoes." }, 400);
  if (!config.ativo) return json({ error: "ListaPro está desativado" }, 400);

  // Optional: load imovel data
  let imovel: any = null;
  if (imovel_id) {
    const { data } = await admin.from("imoveis").select("*").eq("id", imovel_id).maybeSingle();
    imovel = data;
  }

  // Create job row
  const callbackBase = SUPABASE_URL.replace(".supabase.co", ".functions.supabase.co");
  const payload = {
    pacote,
    assets: assets ?? (pacote === "completo" ? ["pdf", "post", "story", "reels", "copy"] : []),
    imovel,
    dados,
    branding: config.branding ?? {},
    requested_by: userData.user.id,
  };

  const { data: job, error: jobErr } = await admin
    .from("listapro_jobs")
    .insert({
      imovel_id: imovel_id ?? null,
      payload,
      status: "pending",
    })
    .select()
    .single();
  if (jobErr) return json({ error: jobErr.message }, 500);

  const callback_url = `${SUPABASE_URL}/functions/v1/listapro-callback?job_id=${job.id}`;

  // Update with callback_url
  await admin.from("listapro_jobs").update({ callback_url }).eq("id", job.id);

  // Fire webhook to n8n
  try {
    const res = await fetch(config.webhook_url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-ListaPro-Secret": config.webhook_secret,
      },
      body: JSON.stringify({
        job_id: job.id,
        callback_url,
        ...payload,
      }),
    });
    if (!res.ok) {
      const txt = await res.text();
      await admin.from("listapro_jobs").update({
        status: "error",
        erro: `webhook ${res.status}: ${txt.slice(0, 500)}`,
      }).eq("id", job.id);
      return json({ error: `Webhook n8n falhou: ${res.status}` }, 502);
    }
    await admin.from("listapro_jobs").update({ status: "running" }).eq("id", job.id);
  } catch (e) {
    await admin.from("listapro_jobs").update({
      status: "error",
      erro: `webhook exception: ${(e as Error).message}`,
    }).eq("id", job.id);
    return json({ error: `Falha ao chamar webhook: ${(e as Error).message}` }, 502);
  }

  return json({ job_id: job.id, status: "running" });
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
