import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, PUT, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

// Single-tenant identifier (mantém alinhado com a row criada pelo Claude no Supabase).
const DEFAULT_IMOBILIARIA_ID = "onestar";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  // Auth: verify caller is an admin via JWT
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return json({ error: "missing authorization" }, 401);
  }
  const userClient = createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: userData, error: userErr } = await userClient.auth.getUser();
  if (userErr || !userData?.user) return json({ error: "unauthorized" }, 401);

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE);
  const { data: roleRow } = await admin
    .from("user_roles")
    .select("role")
    .eq("user_id", userData.user.id)
    .in("role", ["admin", "owner"])
    .maybeSingle();
  if (!roleRow) return json({ error: "forbidden" }, 403);

  try {
    if (req.method === "GET") {
      const { data, error } = await admin
        .from("listapro_config")
        .select("id, ativo, branding, webhook_url, webhook_secret, gemini_key, imobiliaria_id, created_at")
        .eq("imobiliaria_id", DEFAULT_IMOBILIARIA_ID)
        .maybeSingle();
      if (error) throw error;
      return json({ config: data ?? null });
    }

    if (req.method === "PUT" || req.method === "POST") {
      const body = await req.json().catch(() => ({}));
      const payload = {
        imobiliaria_id: DEFAULT_IMOBILIARIA_ID,
        webhook_url: String(body.webhook_url ?? "").trim(),
        webhook_secret: String(body.webhook_secret ?? "").trim(),
        gemini_key: body.gemini_key ? String(body.gemini_key) : null,
        branding: body.branding ?? {},
        ativo: body.ativo !== false,
      };
      if (!payload.webhook_url || !payload.webhook_secret) {
        return json({ error: "webhook_url e webhook_secret são obrigatórios" }, 400);
      }

      const { data: existing } = await admin
        .from("listapro_config")
        .select("id")
        .eq("imobiliaria_id", DEFAULT_IMOBILIARIA_ID)
        .maybeSingle();

      let result;
      if (existing) {
        const { data, error } = await admin
          .from("listapro_config")
          .update(payload)
          .eq("id", existing.id)
          .select()
          .single();
        if (error) throw error;
        result = data;
      } else {
        const { data, error } = await admin
          .from("listapro_config")
          .insert(payload)
          .select()
          .single();
        if (error) throw error;
        result = data;
      }
      return json({ config: result });
    }

    return json({ error: "method not allowed" }, 405);
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
