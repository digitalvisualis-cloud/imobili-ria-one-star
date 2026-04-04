import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.100.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function getSupabaseAdmin() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );
}

function sanitize(str: string): string {
  return str.replace(/[<>{}]/g, "").trim().substring(0, 500);
}

// Rate limit: 20 req/min per IP
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60000 });
    return true;
  }
  if (entry.count >= 20) return false;
  entry.count++;
  return true;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Método não permitido" }, 405);
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!checkRateLimit(ip)) {
    return jsonResponse({ error: "Limite de buscas excedido. Tente novamente em 1 minuto." }, 429);
  }

  const startTime = Date.now();
  const sb = getSupabaseAdmin();

  let body: any;
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: "JSON inválido" }, 400);
  }

  const query: string | undefined = body.query;
  const filters: any = body.filters || {};

  // If there's a natural language query, use AI to extract filters
  if (query && typeof query === "string" && query.trim().length > 0) {
    const { data: aiConfig } = await sb.from("ai_config").select("*").limit(1).single();
    const provider = aiConfig?.provider || "openai";
    const model = aiConfig?.model || "gpt-4o-mini";
    const maxTokens = aiConfig?.max_tokens || 1024;
    const userApiKey = aiConfig?.api_key_encrypted;

    if (!userApiKey) {
      return jsonResponse({ error: "Busca por IA não configurada. Entre em contato com o administrador." }, 400);
    }

    const aiMessages = [
      {
        role: "system",
        content: `Você é um assistente que extrai filtros de busca de imóveis a partir de texto livre em português.
Tipos válidos: apartamento, casa, chacara, sitio, terreno, comercial.
Finalidades válidas: venda, aluguel.
Extraia apenas filtros que o usuário mencionou explicitamente. Não invente filtros.`,
      },
      { role: "user", content: sanitize(query) },
    ];

    const aiTools = [
      {
        type: "function",
        function: {
          name: "extract_filters",
          description: "Extrai filtros estruturados de busca de imóvel a partir de texto livre",
          parameters: {
            type: "object",
            properties: {
              tipo: { type: "string", enum: ["apartamento", "casa", "chacara", "sitio", "terreno", "comercial"] },
              finalidade: { type: "string", enum: ["venda", "aluguel"] },
              cidade: { type: "string" },
              estado: { type: "string" },
              bairro: { type: "string" },
              preco_min: { type: "number" },
              preco_max: { type: "number" },
              quartos_min: { type: "integer" },
              banheiros_min: { type: "integer" },
              vagas_min: { type: "integer" },
              area_min: { type: "number" },
              observacoes: { type: "string" },
            },
            additionalProperties: false,
          },
        },
      },
    ];

    let filtersExtracted: any = {};
    let tokensUsed = 0;
    let observacoes = "";

    try {
      let aiUrl: string;
      let aiHeaders: Record<string, string>;
      let aiBody: string;

      if (provider === "openai") {
        aiUrl = "https://api.openai.com/v1/chat/completions";
        aiHeaders = { Authorization: `Bearer ${userApiKey}`, "Content-Type": "application/json" };
        aiBody = JSON.stringify({
          model, messages: aiMessages, tools: aiTools,
          tool_choice: { type: "function", function: { name: "extract_filters" } },
          max_tokens: maxTokens,
        });
      } else {
        aiUrl = "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";
        aiHeaders = { Authorization: `Bearer ${userApiKey}`, "Content-Type": "application/json" };
        const geminiModel = model.replace("google/", "");
        aiBody = JSON.stringify({
          model: geminiModel, messages: aiMessages, tools: aiTools,
          tool_choice: { type: "function", function: { name: "extract_filters" } },
          max_tokens: maxTokens,
        });
      }

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30000);
      const aiResponse = await fetch(aiUrl, { method: "POST", headers: aiHeaders, body: aiBody, signal: controller.signal });
      clearTimeout(timeout);

      if (!aiResponse.ok) {
        const errText = await aiResponse.text();
        console.error("AI API error:", aiResponse.status, errText);
        const responseTimeMs = Date.now() - startTime;
        await sb.from("ai_search_logs").insert({
          query, provider, model, filters_extracted: {}, results_count: 0,
          status: "error", response_time_ms: responseTimeMs, result_ids: [],
        });
        return jsonResponse({ error: "Erro ao processar busca com IA" }, 500);
      }

      const aiData = await aiResponse.json();
      tokensUsed = aiData.usage?.total_tokens || 0;

      const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
      if (toolCall?.function?.arguments) {
        filtersExtracted = JSON.parse(toolCall.function.arguments);
        observacoes = filtersExtracted.observacoes || "";
        delete filtersExtracted.observacoes;
      }
    } catch (e) {
      console.error("AI call error:", e);
      const responseTimeMs = Date.now() - startTime;
      await sb.from("ai_search_logs").insert({
        query, provider, model, filters_extracted: {}, results_count: 0,
        status: "error", response_time_ms: responseTimeMs, result_ids: [],
      });
      return jsonResponse({ error: "Erro interno na busca IA" }, 500);
    }

    // Query DB with extracted filters
    let dbQuery = sb.from("imoveis").select("*", { count: "exact" }).eq("publicado", true);

    if (filtersExtracted.tipo) dbQuery = dbQuery.eq("tipo", filtersExtracted.tipo);
    if (filtersExtracted.finalidade) dbQuery = dbQuery.eq("finalidade", filtersExtracted.finalidade);
    if (filtersExtracted.cidade) dbQuery = dbQuery.ilike("cidade", `%${filtersExtracted.cidade}%`);
    if (filtersExtracted.estado) dbQuery = dbQuery.ilike("estado", `%${filtersExtracted.estado}%`);
    if (filtersExtracted.bairro) dbQuery = dbQuery.ilike("bairro", `%${filtersExtracted.bairro}%`);
    if (filtersExtracted.preco_min) dbQuery = dbQuery.gte("preco", filtersExtracted.preco_min);
    if (filtersExtracted.preco_max) dbQuery = dbQuery.lte("preco", filtersExtracted.preco_max);
    if (filtersExtracted.quartos_min) dbQuery = dbQuery.gte("quartos", filtersExtracted.quartos_min);
    if (filtersExtracted.banheiros_min) dbQuery = dbQuery.gte("banheiros", filtersExtracted.banheiros_min);
    if (filtersExtracted.vagas_min) dbQuery = dbQuery.gte("vagas", filtersExtracted.vagas_min);
    if (filtersExtracted.area_min) dbQuery = dbQuery.gte("area_m2", filtersExtracted.area_min);

    dbQuery = dbQuery.order("destaque", { ascending: false, nullsFirst: false });
    dbQuery = dbQuery.order("updated_at", { ascending: false });
    dbQuery = dbQuery.range(0, 19);

    const { data: items, count, error: dbError } = await dbQuery;
    const responseTimeMs = Date.now() - startTime;
    const estimatedCost = tokensUsed > 0 ? parseFloat((tokensUsed * 0.000001).toFixed(6)) : null;

    await sb.from("ai_search_logs").insert({
      query, provider, model, filters_extracted: filtersExtracted,
      results_count: items?.length || 0, status: dbError ? "error" : "success",
      response_time_ms: responseTimeMs, tokens_used: tokensUsed || null,
      estimated_cost: estimatedCost, result_ids: (items || []).map((i: any) => i.codigo_imovel),
    });

    if (dbError) return jsonResponse({ error: dbError.message }, 500);

    return jsonResponse({
      items: items || [],
      meta: { total: count || 0, filtros_extraidos: filtersExtracted, observacoes },
    });
  }

  // No AI query — direct DB filter
  let dbQuery = sb.from("imoveis").select("*", { count: "exact" }).eq("publicado", true);

  if (filters.tipo) dbQuery = dbQuery.eq("tipo", filters.tipo);
  if (filters.finalidade) dbQuery = dbQuery.eq("finalidade", filters.finalidade);
  if (filters.cidade) dbQuery = dbQuery.ilike("cidade", `%${sanitize(filters.cidade)}%`);
  if (filters.bairro) dbQuery = dbQuery.ilike("bairro", `%${sanitize(filters.bairro)}%`);
  if (filters.preco_min) dbQuery = dbQuery.gte("preco", Number(filters.preco_min));
  if (filters.preco_max) dbQuery = dbQuery.lte("preco", Number(filters.preco_max));
  if (filters.quartos) dbQuery = dbQuery.gte("quartos", Number(filters.quartos));

  dbQuery = dbQuery.order("destaque", { ascending: false, nullsFirst: false });
  dbQuery = dbQuery.order("updated_at", { ascending: false });
  dbQuery = dbQuery.range(0, 19);

  const { data: items, count, error: dbError } = await dbQuery;
  if (dbError) return jsonResponse({ error: dbError.message }, 500);

  return jsonResponse({ items: items || [], meta: { total: count || 0 } });
});
