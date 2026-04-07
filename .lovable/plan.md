

# Portal do Cliente (Imobiliária) - Plano Revisado

## Entendimento do Modelo

- **Admin (`/admin`)** = Você, que vende e mantém a plataforma (infraestrutura, API, IA, logs)
- **Cliente (`/painel`)** = O dono da imobiliária/corretor que compra o sistema
- O cliente pode criar funcionários com permissões granulares dentro do portal dele

## Nova Estrutura de Roles

O sistema atual tem `admin | editor | viewer`. Precisamos expandir:

| Role | Acesso | Quem é |
|------|--------|--------|
| `admin` | `/admin` - tudo técnico + `/painel` | Você (dono da plataforma) |
| `owner` | `/painel` - tudo (imóveis, CRM, financeiro, dashboard, gestão de equipe) | Dono da imobiliária |
| `manager` | `/painel` - módulos atribuídos pelo owner (CRM, financeiro, etc.) | Gerente/funcionário de confiança |
| `agent` | `/painel` - cadastro de imóveis (pode apagar os que ele criou), ver leads | Corretor/funcionário |

## Banco de Dados - Novas Tabelas e Alterações

### 1. Expandir o enum `app_role`
Adicionar `owner`, `manager`, `agent` ao enum existente.

### 2. Tabela `agent_permissions`
Permite ao owner definir quais módulos cada funcionário acessa:
- `user_id`, `module` (imoveis, crm, financeiro, dashboard), `can_read`, `can_write`, `can_delete`

### 3. Tabela `clientes` (CRM)
Cadastro de clientes que fecharam ou estão em negociação:
- nome, email, telefone, cpf_cnpj, observacoes, created_by, timestamps

### 4. Tabela `negocios`
Vincula cliente + imóvel + valores:
- cliente_id, imovel_id, valor, comissao_percentual, comissao_valor, status (prospeccao, negociacao, fechado, cancelado), data_fechamento, created_by

### 5. Tabela `financeiro`
Fluxo de caixa:
- negocio_id (opcional), tipo (receita/despesa), categoria, valor, data_vencimento, data_pagamento, status (pendente, pago, atrasado), descricao, created_by

### 6. Adicionar `created_by` na tabela `imoveis`
Para que o agente só possa apagar imóveis que ele mesmo cadastrou.

### RLS
- `imoveis`: agente pode deletar WHERE `created_by = auth.uid()`
- Novas tabelas: owner vê tudo; manager/agent vêem conforme `agent_permissions`
- Função `has_module_access(user_id, module, action)` para checar permissões granulares

## Frontend - Arquitetura

### Layout `/painel`
- Sidebar própria com navegação: Dashboard, Imóveis, CRM, Financeiro, Equipe (só owner)
- Rota protegida: roles `owner | manager | agent`
- Componente `ClientLayout.tsx` separado do `AdminLayout.tsx`

### Páginas do Portal

1. **Dashboard** (`/painel`) - Imóveis mais acessados, cliques, leads recentes, resumo financeiro
2. **Imóveis** (`/painel/imoveis`) - Listagem, cadastro, edição (reusa componentes existentes)
3. **CRM** (`/painel/crm`) - Lista de clientes, cadastro, histórico de negócios
4. **Financeiro** (`/painel/financeiro`) - Receitas, despesas, comissões, filtros por período
5. **Equipe** (`/painel/equipe`) - Só owner: adicionar funcionários, atribuir permissões por módulo

### Fluxo de Acesso
- Login único: após autenticação, redireciona para `/admin` se admin, `/painel` se owner/manager/agent
- Owner acessa tudo no `/painel` incluindo gestão de equipe
- Manager/Agent vêem apenas módulos permitidos

## Ordem de Implementação

1. Migração do banco (enum, tabelas, RLS, `created_by` em imoveis)
2. Função SQL `has_module_access` + atualizar `AuthContext` com novas roles
3. Layout do portal (`ClientLayout`) + rotas protegidas
4. Dashboard com analytics (usa `imovel_views` existente)
5. Módulo de Imóveis no portal (adapta componentes existentes)
6. Módulo CRM (clientes + negócios)
7. Módulo Financeiro
8. Gestão de Equipe (owner atribui permissões)

