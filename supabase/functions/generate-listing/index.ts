const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface ListingPayload {
  tipo: string;
  operacao: string;
  endereco: string;
  cidade: string;
  estado: string;
  preco: number;
  quartos: number;
  banheiros: number;
  metros_construidos: number;
  metros_terreno: number;
  vagas: number;
  amenidades: string[];
  destaque_agente: string;
  agente_nome: string;
  agente_telefone: string;
  agente_email: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY no configurada" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = (await req.json()) as ListingPayload;

    // Basic validation
    if (!data?.tipo || !data?.operacao || !data?.cidade) {
      return new Response(JSON.stringify({ error: "Campos obrigatórios faltando" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const formatBRL = (n: number) =>
      new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(n || 0);

    const userPrompt = `Gere conteúdo profissional para um imóvel no mercado imobiliário brasileiro.

DADOS:
- Tipo: ${data.tipo}
- Finalidade: ${data.operacao}
- Endereço: ${data.endereco}
- Cidade/Estado: ${data.cidade}, ${data.estado}
- Preço: ${formatBRL(data.preco)}
- Quartos: ${data.quartos}
- Banheiros: ${data.banheiros}
- Área construída: ${data.metros_construidos} m²
- Área do terreno: ${data.metros_terreno} m²
- Vagas de garagem: ${data.vagas}
- Diferenciais (amenidades): ${(data.amenidades || []).join(", ") || "nenhuma especificada"}
- Destaques do corretor: ${data.destaque_agente || "—"}
- Corretor: ${data.agente_nome} | Tel: ${data.agente_telefone} | ${data.agente_email}

Retorne EXATAMENTE no formato JSON (sem markdown, sem texto extra):
{
  "descricao": "descrição profissional longa em português do Brasil estilo portal imobiliário (3-4 parágrafos), persuasiva, destacando localização, características e estilo de vida",
  "instagram": "copy curto e atrativo para Instagram em português do Brasil, com emojis no início das linhas, chamada para ação, e ao final 12-15 hashtags relevantes do mercado imobiliário brasileiro (#imovelavenda #casaavenda #imobiliaria #corretordeimoveis etc.)"
}`;

    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content:
              "Você é um copywriter especialista em mercado imobiliário brasileiro. Escreve sempre em português do Brasil, com tom profissional, acolhedor e persuasivo. Sempre retorna JSON válido.",
          },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "publish_listing",
              description: "Retorna a descrição longa e o copy de Instagram em português do Brasil",
              parameters: {
                type: "object",
                properties: {
                  descricao: { type: "string", description: "Descrição profissional longa em PT-BR (3-4 parágrafos)" },
                  instagram: { type: "string", description: "Copy curto para Instagram em PT-BR com emojis e hashtags BR" },
                },
                required: ["descricao", "instagram"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "publish_listing" } },
      }),
    });

    if (!aiResp.ok) {
      if (aiResp.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de uso excedido. Tente novamente mais tarde." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResp.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos de IA esgotados. Adicione créditos no seu workspace Lovable." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      const t = await aiResp.text();
      console.error("AI gateway error:", aiResp.status, t);
      return new Response(JSON.stringify({ error: "Erro no gateway de IA" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiJson = await aiResp.json();
    const toolCall = aiJson?.choices?.[0]?.message?.tool_calls?.[0];
    const argsStr = toolCall?.function?.arguments;
    let parsed: { descricao: string; instagram: string } | null = null;
    if (argsStr) {
      try {
        parsed = JSON.parse(argsStr);
      } catch (e) {
        console.error("Failed to parse tool args:", e, argsStr);
      }
    }

    if (!parsed) {
      // Fallback: try plain content
      const content = aiJson?.choices?.[0]?.message?.content;
      if (content) {
        try {
          parsed = JSON.parse(content);
        } catch {
          parsed = { descricao: content, instagram: "" };
        }
      }
    }

    if (!parsed) {
      return new Response(JSON.stringify({ error: "Resposta de IA vazia" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-listing error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
