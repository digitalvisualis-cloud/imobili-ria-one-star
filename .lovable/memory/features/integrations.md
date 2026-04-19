---
name: Portal & WhatsApp Integrations
description: Integration tokens for ZAP/OLX/VivaReal, WhatsApp number, and ListaPro/n8n+Claude pipeline
type: feature
---

## Tokens de portal (ZAP/OLX/VivaReal) e WhatsApp
- Salvos em `localStorage` via página `/admin/integracoes` (UI placeholder, ainda não consumidos por edge function).

## ListaPro (geração de assets via n8n + Claude)
- Tabelas (criadas pelo Claude no Supabase, **não modificar via Lovable**):
  - `listapro_config` — uma linha por imobiliária (`imobiliaria_id` text, default `"default"`). Campos: `webhook_url`, `webhook_secret`, `gemini_key`, `branding` (jsonb), `ativo`. RLS `service_only`.
  - `listapro_jobs` — `imovel_id` (text), `payload` jsonb, `resultado` jsonb, `status` ('pending'|'running'|'done'|'error'|'partial'), `erro`, `callback_url`. RLS `service_only`.
- Edge functions Lovable (acesso via service role):
  - `listapro-config` — GET/PUT (admin/owner only). Lê e grava configuração.
  - `listapro-trigger` — POST (qualquer portal user). Cria job, dispara webhook n8n com `X-ListaPro-Secret`.
  - `listapro-callback` — POST público, autenticado por `X-ListaPro-Secret`. n8n usa para devolver assets (PDF, post, story, copy rápido; reels depois — pode reusar mesmo job_id).
  - `listapro-job-status` — GET autenticado. Polling do status.
- Componente reutilizável `src/components/listapro/ListaProTrigger.tsx` com botões "Pacote completo" e "Avançado" (selecionar assets).
  - Usado em `PropertyForm` (admin, modo edição) e em `pages/portal/ListaPro.tsx` (com dados manuais).
- Padrão de resultado esperado em `resultado` jsonb: `{ pdf_url, post_url, story_url, reels_url, copy: { instagram, descricao } }`.
