

# Plano: Imobiliaria One Star

## Resumo do Projeto

O repositorio `imobiliaria-modelo` e um sistema imobiliario completo com:
- Site publico (listagem, detalhes de imoveis, filtros, WhatsApp)
- Painel admin (CRUD de imoveis, configuracao do site, usuarios, API keys, IA)
- Supabase externo (auth, database, storage, edge functions)
- Tema dark/light com fontes Cormorant Garamond + Inter

## O que sera feito

### Etapa 1 - Copiar toda a base de codigo do repositorio

Criar/substituir todos os arquivos do projeto atual com o codigo do repositorio, incluindo:

- **~30 arquivos de src/** (pages, components, contexts, hooks, integrations, lib)
- **5 edge functions** em `supabase/functions/`
- **5 migrations SQL** em `supabase/migrations/`
- **Configs**: tailwind.config.ts, index.css, index.html, vite.config.ts, package.json
- **Assets**: logo.png, favicon.ico

Renomear todas as referencias de "Andre Monteiro Imoveis" para **"Imobiliaria One Star"** nos seguintes locais:
- `config_site` default na migration SQL
- Header fallback text
- Footer fallback text
- index.html title e meta tags

### Etapa 2 - Instalar dependencias adicionais

O projeto requer pacotes extras que nao estao no projeto atual:
- `@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/pm`, `@tiptap/extension-link`, `@tiptap/extension-text-align`, `@tiptap/extension-underline` (editor rich text)
- `framer-motion` (animacoes)
- `next-themes` (tema dark/light)
- `@tailwindcss/typography` (dev)

### Etapa 3 - Configurar Supabase externo

O projeto usa variaveis de ambiente `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY`. Como voce usara Supabase externo, sera necessario:

1. **Criar um projeto no Supabase** (supabase.com)
2. **Executar as migrations** no SQL Editor do Supabase (5 arquivos SQL na ordem cronologica)
3. **Criar os storage buckets** `imoveis` e `site-assets` (as migrations ja fazem isso)
4. **Deploy das edge functions** no Supabase CLI ou Dashboard
5. **Copiar as credenciais**:
   - `Project URL` → variavel `VITE_SUPABASE_URL`
   - `Anon public key` → variavel `VITE_SUPABASE_PUBLISHABLE_KEY`
6. **Criar o primeiro admin** invocando a edge function `seed-admin`

As chaves publicas do Supabase serao armazenadas diretamente no codigo (sao publishable keys, nao sao secretas).

## Detalhes tecnicos

- Stack: React 18 + Vite 5 + Tailwind CSS 3 + TypeScript 5 + Supabase
- Auth: Supabase Auth com roles (admin/editor/viewer) em tabela separada `user_roles`
- RLS: Policies com funcao `has_role()` security definer
- Edge Functions: admin-users, api-v1, public-search, seed-admin, track-view
- Tema: CSS variables com dark mode via classe `.dark`

