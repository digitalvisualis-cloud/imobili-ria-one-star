import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.100.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function hashKey(key: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(key);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

function getSupabaseAdmin() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );
}

// ── Rate Limiting ──
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const aiRateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(key: string, maxPerMin: number, map: Map<string, { count: number; resetAt: number }>): boolean {
  const now = Date.now();
  const entry = map.get(key);
  if (!entry || now > entry.resetAt) {
    map.set(key, { count: 1, resetAt: now + 60000 });
    return true;
  }
  if (entry.count >= maxPerMin) return false;
  entry.count++;
  return true;
}

async function validateApiKey(authHeader: string | null) {
  if (!authHeader?.startsWith("Bearer ")) return null;
  const key = authHeader.replace("Bearer ", "");
  const keyHash = await hashKey(key);
  const sb = getSupabaseAdmin();
  const { data } = await sb
    .from("api_keys")
    .select("id, active")
    .eq("key_hash", keyHash)
    .eq("active", true)
    .single();
  if (!data) return null;
  await sb.from("api_keys").update({ last_used_at: new Date().toISOString() }).eq("id", data.id);
  return data.id;
}

// ── Log request ──
async function logRequest(sb: any, endpoint: string, method: string, statusCode: number, ip: string, apiKeyId: string | null, responseTimeMs: number) {
  try {
    await sb.from("api_request_logs").insert({
      endpoint,
      method,
      status_code: statusCode,
      ip_address: ip,
      api_key_id: apiKeyId,
      response_time_ms: responseTimeMs,
    });
  } catch (e) {
    console.error("Failed to log request:", e);
  }
}

// ── Sanitize string param ──
function sanitize(str: string): string {
  return str.replace(/[<>{}]/g, '').trim().substring(0, 500);
}

// ── Listar imóveis ──
async function listImoveis(url: URL, baseUrl?: string, whatsapp?: string | null) {
  const sb = getSupabaseAdmin();
  const params = url.searchParams;

  const limit = Math.min(parseInt(params.get("limit") || "7"), 20);
  const offset = Math.max(parseInt(params.get("offset") || "0"), 0);
  const sort = params.get("sort") || "destaque_desc,updated_at_desc";

  let query = sb.from("imoveis").select("*", { count: "exact" });

  const tipo = params.get("tipo");
  if (tipo) query = query.eq("tipo", sanitize(tipo));

  const finalidade = params.get("finalidade");
  if (finalidade) query = query.eq("finalidade", sanitize(finalidade));

  const cidade = params.get("cidade");
  if (cidade) query = query.ilike("cidade", `%${sanitize(cidade)}%`);

  const estado = params.get("estado");
  if (estado) query = query.ilike("estado", `%${sanitize(estado)}%`);

  const bairro = params.get("bairro");
  if (bairro) query = query.ilike("bairro", `%${sanitize(bairro)}%`);

  const precoMin = params.get("preco_min");
  if (precoMin) query = query.gte("preco", parseFloat(precoMin));

  const precoMax = params.get("preco_max");
  if (precoMax) query = query.lte("preco", parseFloat(precoMax));

  const quartosMin = params.get("quartos_min");
  if (quartosMin) query = query.gte("quartos", parseInt(quartosMin));

  const banheirosMin = params.get("banheiros_min");
  if (banheirosMin) query = query.gte("banheiros", parseInt(banheirosMin));

  const vagasMin = params.get("vagas_min");
  if (vagasMin) query = query.gte("vagas", parseInt(vagasMin));

  const areaMin = params.get("area_min");
  if (areaMin) query = query.gte("area_m2", parseFloat(areaMin));

  const destaque = params.get("destaque");
  if (destaque === "true") query = query.eq("destaque", true);
  if (destaque === "false") query = query.eq("destaque", false);

  const publicado = params.get("publicado");
  if (publicado === "true") query = query.eq("publicado", true);
  if (publicado === "false") query = query.eq("publicado", false);

  const q = params.get("q");
  if (q) query = query.or(`titulo.ilike.%${sanitize(q)}%,descricao.ilike.%${sanitize(q)}%`);

  const codigo = params.get("codigo");
  if (codigo) query = query.eq("codigo_imovel", sanitize(codigo));

  const sortParts = sort.split(",");
  for (const s of sortParts) {
    if (s === "preco_asc") query = query.order("preco", { ascending: true });
    else if (s === "preco_desc") query = query.order("preco", { ascending: false });
    else if (s === "updated_at_desc") query = query.order("updated_at", { ascending: false });
    else if (s === "destaque_desc") query = query.order("destaque", { ascending: false, nullsFirst: false });
  }

  query = query.range(offset, offset + limit - 1);

  const { data, count, error } = await query;
  if (error) return jsonResponse({ error: error.message }, 500);

  const enrichedItems = (data || []).map((i: any) => enrichImovel(i, baseUrl, whatsapp));

  return jsonResponse({
    meta: { limit, offset, total: count || 0, sort },
    items: enrichedItems,
  });
}

function enrichImovel(item: any, baseUrl?: string, whatsapp?: string | null) {
  const urlPublica = baseUrl ? `${baseUrl}/imovel/${item.codigo_imovel}` : `/imovel/${item.codigo_imovel}`;
  const result: any = { ...item, url_publica: urlPublica };
  if (whatsapp) {
    const phone = whatsapp.replace(/\D/g, "");
    const msg = encodeURIComponent(`Olá! Tenho interesse no imóvel ${item.codigo_imovel}. Veja mais em: ${urlPublica}`);
    result.whatsapp_link = `https://wa.me/${phone}?text=${msg}`;
  }
  return result;
}

async function getImoveisById(id: string, baseUrl?: string, whatsapp?: string | null) {
  const sb = getSupabaseAdmin();
  const { data, error } = await sb.from("imoveis").select("*").eq("id", id).single();
  if (error || !data) return jsonResponse({ error: "Imóvel não encontrado" }, 404);
  return jsonResponse(enrichImovel(data, baseUrl, whatsapp));
}

async function getImoveisByCodigo(codigo: string, baseUrl?: string, whatsapp?: string | null) {
  const sb = getSupabaseAdmin();
  const { data, error } = await sb.from("imoveis").select("*").eq("codigo_imovel", codigo).single();
  if (error || !data) return jsonResponse({ error: "Imóvel não encontrado com este código" }, 404);
  return jsonResponse(enrichImovel(data, baseUrl, whatsapp));
}

// ── Busca IA ──
async function buscaIA(body: any, reqOrigin?: string) {
  const startTime = Date.now();
  const sb = getSupabaseAdmin();
  const query = body.query;
  const limit = Math.min(parseInt(body.limit || "7"), 20);
  const modo = body.modo || "enxuto";

  if (!query || typeof query !== "string") {
    return jsonResponse({ error: "Campo 'query' é obrigatório" }, 400);
  }

  const { data: aiConfig } = await sb.from("ai_config").select("*").limit(1).single();
  const provider = aiConfig?.provider || "openai";
  const model = aiConfig?.model || "gpt-4o-mini";
  const maxTokens = aiConfig?.max_tokens || 1024;
  const userApiKey = aiConfig?.api_key_encrypted;

  if (!userApiKey) {
    return jsonResponse({ error: "Chave de API não configurada. Acesse Configurações de IA no painel admin e informe sua chave." }, 400);
  }

  const aiMessages = [
    {
      role: "system",
      content: `Você é um assistente que extrai filtros de busca de imóveis a partir de texto livre em português.
Tipos válidos: apartamento, casa, chacara, sitio, terreno, comercial.
Finalidades válidas: venda, aluguel.
Se o usuário mencionar um código de imóvel (ex: IMV-000017), extraia como codigo_imovel.
Extraia apenas filtros que o usuário mencionou explicitamente. Não invente filtros.
Se a frase for vaga, indique nas observações o que faltou.`,
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
            codigo_imovel: { type: "string", description: "Código do imóvel mencionado pelo usuário (ex: IMV-000017)" },
            palavras_chave: { type: "array", items: { type: "string" } },
            observacoes: { type: "string", description: "Observações sobre a interpretação ou filtros que faltaram" },
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
      aiHeaders = {
        Authorization: `Bearer ${userApiKey}`,
        "Content-Type": "application/json",
      };
      aiBody = JSON.stringify({
        model,
        messages: aiMessages,
        tools: aiTools,
        tool_choice: { type: "function", function: { name: "extract_filters" } },
        max_tokens: maxTokens,
      });
    } else {
      aiUrl = `https://generativelanguage.googleapis.com/v1beta/openai/chat/completions`;
      aiHeaders = {
        Authorization: `Bearer ${userApiKey}`,
        "Content-Type": "application/json",
      };
      const geminiModel = model.replace("google/", "");
      aiBody = JSON.stringify({
        model: geminiModel,
        messages: aiMessages,
        tools: aiTools,
        tool_choice: { type: "function", function: { name: "extract_filters" } },
        max_tokens: maxTokens,
      });
    }

    // 30s timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    const aiResponse = await fetch(aiUrl, {
      method: "POST",
      headers: aiHeaders,
      body: aiBody,
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error("AI API error:", aiResponse.status, errText);

      const responseTimeMs = Date.now() - startTime;
      await sb.from("ai_search_logs").insert({
        query, provider, model, filters_extracted: {}, results_count: 0,
        status: "error", response_time_ms: responseTimeMs, result_ids: [],
      });

      if (aiResponse.status === 429) {
        return jsonResponse({ error: "Limite de requisições de IA excedido. Tente novamente em instantes." }, 429);
      }
      if (aiResponse.status === 401) {
        return jsonResponse({ error: "Chave de API inválida. Verifique nas configurações de IA." }, 401);
      }
      return jsonResponse({ error: "Erro ao processar busca com IA" }, 500);
    }

    const aiData = await aiResponse.json();
    tokensUsed = aiData.usage?.total_tokens || 0;

    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall?.function?.arguments) {
      filtersExtracted = JSON.parse(toolCall.function.arguments);
      observacoes = filtersExtracted.observacoes || "";
      delete filtersExtracted.observacoes;
      delete filtersExtracted.palavras_chave;
    }
  } catch (e) {
    console.error("AI call error:", e);
    const responseTimeMs = Date.now() - startTime;
    await sb.from("ai_search_logs").insert({
      query, provider, model, filters_extracted: {}, results_count: 0,
      status: "error", response_time_ms: responseTimeMs, result_ids: [],
    });
    if ((e as Error).name === "AbortError") {
      return jsonResponse({ error: "Timeout na chamada de IA. Tente novamente." }, 504);
    }
    return jsonResponse({ error: "Erro interno na busca IA" }, 500);
  }

  const selectCols = modo === "enxuto"
    ? "id, titulo, codigo_imovel, tipo, finalidade, preco, quartos, banheiros, vagas, area_m2, bairro, cidade, estado, capa_url, destaque, publicado, created_at, updated_at"
    : "*";

  let dbQuery = sb.from("imoveis").select(selectCols, { count: "exact" });

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
  if (filtersExtracted.codigo_imovel) dbQuery = dbQuery.eq("codigo_imovel", filtersExtracted.codigo_imovel);

  dbQuery = dbQuery.eq("publicado", true);
  dbQuery = dbQuery.order("destaque", { ascending: false, nullsFirst: false });
  dbQuery = dbQuery.order("updated_at", { ascending: false });
  dbQuery = dbQuery.range(0, limit - 1);

  const { data: items, count, error: dbError } = await dbQuery;
  const responseTimeMs = Date.now() - startTime;

  const resultIds = (items || []).map((i: any) => i.codigo_imovel);

  const estimatedCost = tokensUsed > 0 ? parseFloat((tokensUsed * 0.000001).toFixed(6)) : null;

  await sb.from("ai_search_logs").insert({
    query, provider, model, filters_extracted: filtersExtracted,
    results_count: items?.length || 0,
    status: dbError ? "error" : "success",
    response_time_ms: responseTimeMs,
    tokens_used: tokensUsed || null,
    estimated_cost: estimatedCost,
    result_ids: resultIds,
  });

  if (dbError) return jsonResponse({ error: dbError.message }, 500);

  // Fetch config_site for WhatsApp
  const { data: configSite } = await sb.from("config_site").select("whatsapp").limit(1).single();
  const whatsapp = configSite?.whatsapp || null;

  const enrichedItems = (items || []).map((i: any) => enrichImovel(i, reqOrigin, whatsapp));

  return jsonResponse({
    meta: {
      limit,
      offset: 0,
      total: count || 0,
      sort: "destaque_desc,updated_at_desc",
      interpretacao: {
        filtros_extraidos: filtersExtracted,
        observacoes: observacoes || "Busca realizada com sucesso",
      },
    },
    items: enrichedItems,
  });
}

// ── Router ──
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  const url = new URL(req.url);
  const path = url.pathname.replace(/\/api-v1/, "");
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("cf-connecting-ip") || "unknown";
  const reqOrigin = req.headers.get("origin") || req.headers.get("referer")?.replace(/\/$/, "") || "";
  const sb = getSupabaseAdmin();

  // Fetch config_site once per request for WhatsApp
  const { data: siteConfig } = await sb.from("config_site").select("whatsapp").limit(1).single();
  const whatsapp = siteConfig?.whatsapp || null;

  // Auth check
  const keyId = await validateApiKey(req.headers.get("Authorization"));
  if (!keyId) {
    const responseTime = Date.now() - startTime;
    await logRequest(sb, path, req.method, 401, ip, null, responseTime);
    return jsonResponse(
      { error: "Não autorizado. Forneça uma API Key válida no header Authorization: Bearer <API_KEY>" },
      401
    );
  }

  // Rate limit by IP (60/min)
  if (!checkRateLimit(`ip:${ip}`, 60, rateLimitMap)) {
    const responseTime = Date.now() - startTime;
    await logRequest(sb, path, req.method, 429, ip, keyId, responseTime);
    return jsonResponse({ error: "Limite de requisições excedido (IP). Tente novamente em 1 minuto." }, 429);
  }

  // Rate limit by API Key (120/min)
  if (!checkRateLimit(`key:${keyId}`, 120, rateLimitMap)) {
    const responseTime = Date.now() - startTime;
    await logRequest(sb, path, req.method, 429, ip, keyId, responseTime);
    return jsonResponse({ error: "Limite de requisições excedido (API Key). Tente novamente em 1 minuto." }, 429);
  }

  try {
    let response: Response;

    // POST /v1/busca-ia
    if (req.method === "POST" && path === "/v1/busca-ia") {
      // AI-specific rate limit (20/min per key)
      if (!checkRateLimit(`ai:${keyId}`, 20, aiRateLimitMap)) {
        const responseTime = Date.now() - startTime;
        await logRequest(sb, path, req.method, 429, ip, keyId, responseTime);
        return jsonResponse({ error: "Limite de buscas IA excedido (20/min). Tente novamente em instantes." }, 429);
      }
      const body = await req.json();
      response = await buscaIA(body, reqOrigin);
    }
    // GET /v1/imoveis/codigo/:codigo
    else {
      const codigoMatch = path.match(/^\/v1\/imoveis\/codigo\/(.+)$/);
      if (req.method === "GET" && codigoMatch) {
        response = await getImoveisByCodigo(decodeURIComponent(codigoMatch[1]), reqOrigin, whatsapp);
      }
      // GET /v1/imoveis/:id
      else {
        const idMatch = path.match(/^\/v1\/imoveis\/([0-9a-f-]{36})$/);
        if (req.method === "GET" && idMatch) {
          response = await getImoveisById(idMatch[1], reqOrigin, whatsapp);
        }
        // GET or POST /v1/imoveis
        else if ((req.method === "GET" || req.method === "POST") && (path === "/v1/imoveis" || path === "/v1/imoveis/")) {
          // For POST, merge body params into URL search params
          if (req.method === "POST") {
            try {
              const body = await req.json();
              for (const [key, value] of Object.entries(body)) {
                if (value !== null && value !== undefined) {
                  url.searchParams.set(key, String(value));
                }
              }
            } catch (_) { /* ignore parse errors, use query params only */ }
          }
          response = await listImoveis(url, reqOrigin, whatsapp);
        }
        else {
          response = jsonResponse({ error: "Endpoint não encontrado" }, 404);
        }
      }
    }

    // Log the request
    const responseTime = Date.now() - startTime;
    const status = response.status;
    await logRequest(sb, path, req.method, status, ip, keyId, responseTime);

    return response;
  } catch (e) {
    console.error("Request error:", e);
    const responseTime = Date.now() - startTime;
    await logRequest(sb, path, req.method, 500, ip, keyId, responseTime);
    return jsonResponse({ error: "Erro interno do servidor" }, 500);
  }
});
