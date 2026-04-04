import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Copy } from 'lucide-react';

function CopyBlock({ code }: { code: string }) {
  return (
    <div className="relative">
      <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto font-mono whitespace-pre-wrap">{code}</pre>
      <Button
        variant="ghost" size="sm"
        className="absolute top-2 right-2"
        onClick={() => { navigator.clipboard.writeText(code); toast.success('Copiado!'); }}
      >
        <Copy className="h-3 w-3" />
      </Button>
    </div>
  );
}

function ParamTable({ params }: { params: { name: string; type: string; desc: string }[] }) {
  return (
    <div className="border rounded-lg overflow-hidden text-sm">
      <table className="w-full">
        <thead className="bg-muted">
          <tr>
            <th className="px-4 py-2 text-left font-medium">Parâmetro</th>
            <th className="px-4 py-2 text-left font-medium">Tipo</th>
            <th className="px-4 py-2 text-left font-medium">Descrição</th>
          </tr>
        </thead>
        <tbody>
          {params.map(p => (
            <tr key={p.name} className="border-t">
              <td className="px-4 py-2 font-mono text-xs">{p.name}</td>
              <td className="px-4 py-2">{p.type}</td>
              <td className="px-4 py-2 text-muted-foreground">{p.desc}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const BASE_URL_DISPLAY = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/api-v1`;

export default function ApiDocs() {
  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Documentação da API</h1>
        <p className="text-muted-foreground text-sm">Referência completa da API REST de imóveis</p>
      </div>

      {/* Base URL */}
      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-foreground">Base URL</h2>
        <CopyBlock code={BASE_URL_DISPLAY} />
      </section>

      {/* Auth */}
      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-foreground">Autenticação</h2>
        <p className="text-sm text-muted-foreground">Toda requisição exige o header <code className="bg-muted px-1 rounded">Authorization</code>:</p>
        <CopyBlock code={`Authorization: Bearer SUA_API_KEY`} />
        <p className="text-sm text-muted-foreground">Gere sua chave na página "Chaves de API" do painel. Se a chave estiver ausente ou inválida, a API retorna <code className="bg-muted px-1 rounded">401</code>.</p>
      </section>

      {/* GET /v1/imoveis */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">GET /v1/imoveis</h2>
        <p className="text-sm text-muted-foreground">Lista imóveis com filtros, paginação e ordenação.</p>
        <ParamTable params={[
          { name: 'tipo', type: 'string', desc: 'apartamento, casa, chacara, sitio, terreno, comercial' },
          { name: 'finalidade', type: 'string', desc: 'venda, aluguel' },
          { name: 'cidade', type: 'string', desc: 'Filtro por cidade (parcial)' },
          { name: 'estado', type: 'string', desc: 'Filtro por estado (parcial)' },
          { name: 'bairro', type: 'string', desc: 'Filtro por bairro (parcial)' },
          { name: 'preco_min', type: 'number', desc: 'Preço mínimo' },
          { name: 'preco_max', type: 'number', desc: 'Preço máximo' },
          { name: 'quartos_min', type: 'integer', desc: 'Mínimo de quartos' },
          { name: 'banheiros_min', type: 'integer', desc: 'Mínimo de banheiros' },
          { name: 'vagas_min', type: 'integer', desc: 'Mínimo de vagas' },
          { name: 'area_min', type: 'number', desc: 'Área mínima (m²)' },
          { name: 'destaque', type: 'boolean', desc: 'true/false' },
          { name: 'publicado', type: 'boolean', desc: 'true/false' },
          { name: 'q', type: 'string', desc: 'Busca em título e descrição' },
          { name: 'codigo', type: 'string', desc: 'Código do imóvel' },
          { name: 'limit', type: 'integer', desc: 'Limite de resultados (default 7, max 20)' },
          { name: 'offset', type: 'integer', desc: 'Offset para paginação (default 0)' },
          { name: 'sort', type: 'string', desc: 'Ordenação: preco_asc, preco_desc, updated_at_desc, destaque_desc' },
        ]} />
        <h3 className="text-sm font-semibold text-foreground mt-4">Exemplo cURL</h3>
        <CopyBlock code={`curl -H "Authorization: Bearer SUA_API_KEY" \\
  "${BASE_URL_DISPLAY}/v1/imoveis?finalidade=venda&cidade=São Paulo&limit=5"`} />

        <h3 className="text-sm font-semibold text-foreground mt-4">Exemplo N8N (HTTP Request)</h3>
        <CopyBlock code={`Método: GET
URL: ${BASE_URL_DISPLAY}/v1/imoveis?finalidade=venda&limit=10
Headers:
  Authorization: Bearer {{$credentials.apiKey}}`} />
      </section>

      {/* GET /v1/imoveis/:id */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">GET /v1/imoveis/:id</h2>
        <p className="text-sm text-muted-foreground">Retorna dados completos de um imóvel pelo UUID.</p>
        <CopyBlock code={`curl -H "Authorization: Bearer SUA_API_KEY" \\
  "${BASE_URL_DISPLAY}/v1/imoveis/UUID_DO_IMOVEL"`} />
      </section>

      {/* GET /v1/imoveis/codigo/:codigo */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">GET /v1/imoveis/codigo/:codigo</h2>
        <p className="text-sm text-muted-foreground">Retorna dados completos pelo código do imóvel. Ideal para integração com WhatsApp.</p>
        <CopyBlock code={`curl -H "Authorization: Bearer SUA_API_KEY" \\
  "${BASE_URL_DISPLAY}/v1/imoveis/codigo/APT-001"`} />
      </section>

      {/* POST /v1/busca-ia */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">POST /v1/busca-ia</h2>
        <p className="text-sm text-muted-foreground">Busca inteligente com IA. Interpreta texto livre e retorna imóveis filtrados.</p>
        <ParamTable params={[
          { name: 'query', type: 'string', desc: 'Texto livre do usuário (obrigatório)' },
          { name: 'limit', type: 'integer', desc: 'Limite de resultados (default 7, max 20)' },
          { name: 'modo', type: 'string', desc: '"enxuto" (default) ou "detalhado"' },
        ]} />
        <h3 className="text-sm font-semibold text-foreground mt-4">Exemplo cURL</h3>
        <CopyBlock code={`curl -X POST -H "Authorization: Bearer SUA_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"query":"apartamento de 2 quartos em São Paulo até 500 mil","limit":5}' \\
  "${BASE_URL_DISPLAY}/v1/busca-ia"`} />

        <h3 className="text-sm font-semibold text-foreground mt-4">Exemplo N8N (HTTP Request)</h3>
        <CopyBlock code={`Método: POST
URL: ${BASE_URL_DISPLAY}/v1/busca-ia
Headers:
  Authorization: Bearer {{$credentials.apiKey}}
  Content-Type: application/json
Body (JSON):
{
  "query": "casa para alugar com 3 quartos em Florianópolis",
  "limit": 10,
  "modo": "detalhado"
}`} />
      </section>

      {/* Response format */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">Formato de resposta</h2>
        <p className="text-sm text-muted-foreground">Todos os endpoints de listagem retornam o mesmo formato:</p>
        <CopyBlock code={`{
  "meta": {
    "limit": 7,
    "offset": 0,
    "total": 30,
    "sort": "destaque_desc,updated_at_desc",
    "interpretacao": {  // apenas no POST /v1/busca-ia
      "filtros_extraidos": { "tipo": "apartamento", "cidade": "São Paulo" },
      "observacoes": "Busca realizada com sucesso"
    }
  },
  "items": [
    {
      "id": "uuid",
      "titulo": "...",
      "codigo_imovel": "APT-001",
      "url_publica": "/imovel/APT-001",
      ...
    }
  ]
}`} />
      </section>
    </div>
  );
}
