

# Configurar Supabase Externo

O usuario forneceu a **anon public key** do Supabase. Junto com a URL ja identificada anteriormente, temos tudo para conectar o projeto.

## Credenciais

- **URL**: `https://mlyeqkkcqfsivqhuoedm.supabase.co`
- **Anon Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1seWVxa2tjcWZzaXZxaHVvZWRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ2MjIyMjUsImV4cCI6MjA5MDE5ODIyNX0.GhtGdzlDeDC93RT3RP_78elndxule7Hz0XV0J_HiH20`

## Alteracao

Atualizar `src/integrations/supabase/client.ts` para usar as credenciais diretamente (sao chaves publicas, seguras para o codigo):

```typescript
const SUPABASE_URL = "https://mlyeqkkcqfsivqhuoedm.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";
```

## Proximo passo apos implementacao

O usuario precisara executar as **5 migrations SQL** no SQL Editor do Supabase para criar as tabelas, buckets e policies necessarias.

