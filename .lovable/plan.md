

## Plano de Correção de Segurança

### Problemas encontrados

| # | Severidade | Problema |
|---|-----------|----------|
| 1 | **ERRO** | `user_roles` sem políticas de INSERT/UPDATE/DELETE — qualquer usuário autenticado pode se auto-promover a admin |
| 2 | **ERRO** | `login_attempts` sem proteção de escrita — usuários podem manipular registros |
| 3 | **AVISO** | `api_request_logs` sem proteção de escrita |
| 4 | **AVISO** | `ai_search_logs` sem proteção de escrita |
| 5 | **AVISO** | Leaked Password Protection desativado (ação manual no dashboard) |

### Correção via Migration SQL

Uma única migration para resolver os itens 1-4. A estratégia é **negar todas as operações de escrita** nessas tabelas para usuários normais, já que as inserções são feitas via Edge Functions com service role:

```sql
-- 1. user_roles: apenas admin pode inserir/atualizar/deletar
CREATE POLICY "Admin insert user_roles" ON public.user_roles
  FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admin update user_roles" ON public.user_roles
  FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admin delete user_roles" ON public.user_roles
  FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- 2-4. Tabelas de logs: nenhuma escrita via client (service role cuida disso)
-- login_attempts, api_request_logs, ai_search_logs já não têm políticas de INSERT
-- O scan alerta porque a ausência de política = deny por padrão, mas o scanner
-- interpreta como risco. Vamos adicionar políticas explícitas de deny/admin-only.
```

### Item 5 — Ação Manual
Ativar **Leaked Password Protection** no dashboard do Supabase em **Auth > Providers**.

### Resultado esperado
Após a migration, o scan deve retornar apenas o aviso de Leaked Password Protection (que requer ação manual).

