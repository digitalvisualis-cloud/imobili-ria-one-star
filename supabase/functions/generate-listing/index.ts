const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface ListingPayload {
  tipo: string;
  operacion: string;
  direccion: string;
  ciudad: string;
  estado: string;
  precio: number;
  recamaras: number;
  banos: number;
  metros_construidos: number;
  metros_terreno: number;
  estacionamientos: number;
  amenidades: string[];
  destaque_agente: string;
  agente_nombre: string;
  agente_telefono: string;
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
    if (!data?.tipo || !data?.operacion || !data?.ciudad) {
      return new Response(JSON.stringify({ error: "Campos obligatorios faltantes" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const formatMXN = (n: number) =>
      new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 }).format(n || 0);

    const userPrompt = `Genera contenido profesional para una propiedad inmobiliaria en México.

DATOS:
- Tipo: ${data.tipo}
- Operación: ${data.operacion}
- Dirección: ${data.direccion}
- Ciudad/Estado: ${data.ciudad}, ${data.estado}
- Precio: ${formatMXN(data.precio)} MXN
- Recámaras: ${data.recamaras}
- Baños: ${data.banos}
- Metros construidos: ${data.metros_construidos} m²
- Metros de terreno: ${data.metros_terreno} m²
- Estacionamientos: ${data.estacionamientos}
- Amenidades: ${(data.amenidades || []).join(", ") || "ninguna especificada"}
- Notas del agente: ${data.destaque_agente || "—"}
- Agente: ${data.agente_nombre} | Tel: ${data.agente_telefono} | ${data.agente_email}

Devuelve EXACTAMENTE este formato JSON (sin markdown, sin texto extra):
{
  "descripcion": "descripción profesional larga estilo portal inmobiliario (3-4 párrafos), persuasiva, destacando ubicación, características y estilo de vida",
  "instagram": "copy corto y atractivo para Instagram con emojis al inicio de líneas, llamada a la acción, y al final 12-15 hashtags relevantes del mercado inmobiliario mexicano (#VentaCasa #InmuebleMéxico #BienesRaícesMX etc.)"
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
              "Eres un copywriter experto en bienes raíces en México. Escribes en español mexicano, con tono profesional, cálido y persuasivo. Siempre devuelves JSON válido.",
          },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "publish_listing",
              description: "Devuelve la descripción larga y el copy de Instagram",
              parameters: {
                type: "object",
                properties: {
                  descripcion: { type: "string", description: "Descripción profesional larga (3-4 párrafos)" },
                  instagram: { type: "string", description: "Copy corto para Instagram con emojis y hashtags MX" },
                },
                required: ["descripcion", "instagram"],
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
        return new Response(JSON.stringify({ error: "Límite de uso excedido. Inténtalo más tarde." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResp.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos de IA agotados. Agrega fondos en tu workspace de Lovable." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      const t = await aiResp.text();
      console.error("AI gateway error:", aiResp.status, t);
      return new Response(JSON.stringify({ error: "Error en el gateway de IA" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiJson = await aiResp.json();
    const toolCall = aiJson?.choices?.[0]?.message?.tool_calls?.[0];
    const argsStr = toolCall?.function?.arguments;
    let parsed: { descripcion: string; instagram: string } | null = null;
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
          parsed = { descripcion: content, instagram: "" };
        }
      }
    }

    if (!parsed) {
      return new Response(JSON.stringify({ error: "Respuesta de IA vacía" }), {
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
      JSON.stringify({ error: e instanceof Error ? e.message : "Error desconocido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
