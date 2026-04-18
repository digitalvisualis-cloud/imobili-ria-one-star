

O usuário quer criar uma ferramenta nova chamada **"ListaPro"** para gerar conteúdo profissional de imóveis com IA. Mas há um problema importante de compatibilidade que preciso esclarecer antes de planejar.

## ⚠️ Incompatibilidade Técnica

O usuário pediu **Python + FastAPI rodando em VPS Hostinger**. Isso **não é possível no Lovable**:

- Lovable só suporta **React + Vite + TypeScript** no frontend
- Backend é via **Edge Functions Deno (TypeScript)** no Supabase, não Python
- Deploy é no Lovable (.lovable.app) ou domínio customizado, **não em VPS Hostinger**

Além disso, o projeto atual já é uma **plataforma imobiliária completa** (Imobiliária One Star) com cadastro de imóveis, CRM, leads ChatWoot, analytics, etc. Faz sentido **integrar o ListaPro como um novo módulo dentro desta plataforma** ao invés de criar projeto separado.

## Proposta de Adaptação

Construir o **ListaPro como uma nova página dentro do `/painel`** (portal do dono), aproveitando:
- Sistema de upload de imagens já pronto (`ImageUpload.tsx`)
- Lovable AI Gateway (Gemini/GPT-5) — **sem precisar de chave OpenAI do usuário**
- Tabela `imoveis` existente (opcional: salvar a listagem gerada)
- Auth e RBAC já configurados

## O que será construído

**1. Nova página `/painel/listapro`**
- Formulário com todos os campos pedidos (tipo, operação, endereço, preço, quartos, banheiros, m², amenidades em checkboxes, descrição do agente, dados do agente)
- Upload de fotos (capa + extras) usando componente existente
- Botão "Gerar conteúdo com IA"

**2. Edge Function `generate-listing`**
- Recebe dados do formulário
- Chama Lovable AI (`google/gemini-3-flash-preview` por padrão)
- Retorna 2 textos:
  - Descrição profissional longa (estilo portal imobiliário)
  - Copy para Instagram (curto, com emojis e hashtags MX: #VentaCasa #InmuebleMéxico etc.)

**3. Página de resultados (mesma rota, abaixo do form)**
- Card com descrição gerada + botão "Copiar"
- Card com copy Instagram + botão "Copiar"
- Botão "Gerar novamente" e "Salvar como imóvel" (cria registro em `imoveis`)

**4. Item no menu lateral do portal**
- Adicionar "ListaPro" no `ClientLayout.tsx` com ícone de varinha mágica (`Wand2`)

## Detalhes técnicos

- **Idioma do conteúdo gerado**: Espanhol (México) — moeda MXN, hashtags do mercado mexicano
- **Modelo IA**: `google/gemini-3-flash-preview` (rápido e barato, já incluído no Lovable AI)
- **Sem OpenAI direto**: usamos Lovable AI Gateway — `LOVABLE_API_KEY` já está configurada
- **Tratamento de erros**: 429 (rate limit) e 402 (créditos) com toasts amigáveis
- **Não altera nada existente**: apenas adiciona arquivos novos + 2 linhas no `App.tsx` e `ClientLayout.tsx`

## Arquivos a criar/editar

```text
CRIAR:
  src/pages/portal/ListaPro.tsx          (formulário + resultados)
  supabase/functions/generate-listing/
    └── index.ts                         (chamada à IA)

EDITAR (mínimo):
  src/App.tsx                            (rota /painel/listapro)
  src/components/portal/ClientLayout.tsx (item de menu)
  supabase/config.toml                   (registrar a function)
```

## Pergunta importante antes de implementar

Como há conflito entre o pedido (Python/Hostinger) e o stack do Lovable, preciso confirmar como prosseguir.

