import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.100.1";

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const extras = [
    { codigo_imovel:'IMV-CAS007', titulo:'Casa Colonial Reformada', descricao:'Casarão colonial totalmente reformado mantendo charme original. 4 quartos, jardim e edícula.', tipo:'casa', finalidade:'venda', preco:980000, quartos:4, banheiros:3, vagas:2, area_m2:280, bairro:'Centro Histórico', cidade:'Itu', estado:'SP', capa_url:'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800', imagens:['https://images.unsplash.com/photo-1600573472592-401b489a3cdc?w=800'], destaque:false, publicado:true },
    { codigo_imovel:'IMV-APT009', titulo:'Flat Executivo Mobiliado', descricao:'Flat completo em região nobre com serviço de hotelaria, academia e piscina.', tipo:'apartamento', finalidade:'aluguel', preco:4200, quartos:1, banheiros:1, vagas:1, area_m2:45, bairro:'Jardins', cidade:'São Paulo', estado:'SP', capa_url:'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800', imagens:['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800'], destaque:false, publicado:true },
  ];

  const { error } = await supabase.from("imoveis").insert(extras);
  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 400 });
  return new Response(JSON.stringify({ success: true, count: extras.length }));
});
