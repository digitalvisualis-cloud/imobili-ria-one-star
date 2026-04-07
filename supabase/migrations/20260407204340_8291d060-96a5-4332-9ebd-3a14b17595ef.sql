
-- Tabela agent_permissions
CREATE TABLE public.agent_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  module portal_module NOT NULL,
  can_read boolean NOT NULL DEFAULT false,
  can_write boolean NOT NULL DEFAULT false,
  can_delete boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, module)
);
ALTER TABLE public.agent_permissions ENABLE ROW LEVEL SECURITY;

-- Tabela clientes (CRM)
CREATE TABLE public.clientes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  email text,
  telefone text,
  cpf_cnpj text,
  observacoes text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;

-- Tabela negocios
CREATE TABLE public.negocios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id uuid NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
  imovel_id uuid REFERENCES public.imoveis(id) ON DELETE SET NULL,
  valor numeric NOT NULL DEFAULT 0,
  comissao_percentual numeric DEFAULT 0,
  comissao_valor numeric DEFAULT 0,
  status negocio_status NOT NULL DEFAULT 'prospeccao',
  data_fechamento date,
  observacoes text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.negocios ENABLE ROW LEVEL SECURITY;

-- Tabela financeiro
CREATE TABLE public.financeiro (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  negocio_id uuid REFERENCES public.negocios(id) ON DELETE SET NULL,
  tipo financeiro_tipo NOT NULL,
  categoria text NOT NULL DEFAULT 'geral',
  valor numeric NOT NULL DEFAULT 0,
  data_vencimento date,
  data_pagamento date,
  status financeiro_status NOT NULL DEFAULT 'pendente',
  descricao text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.financeiro ENABLE ROW LEVEL SECURITY;

-- Triggers de updated_at
CREATE TRIGGER set_updated_at_agent_permissions BEFORE UPDATE ON public.agent_permissions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER set_updated_at_clientes BEFORE UPDATE ON public.clientes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER set_updated_at_negocios BEFORE UPDATE ON public.negocios FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER set_updated_at_financeiro BEFORE UPDATE ON public.financeiro FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Função has_module_access
CREATE OR REPLACE FUNCTION public.has_module_access(_user_id uuid, _module portal_module, _action text DEFAULT 'read')
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role IN ('admin', 'owner'))
    OR
    EXISTS (
      SELECT 1 FROM public.agent_permissions ap
      WHERE ap.user_id = _user_id
        AND ap.module = _module
        AND (
          (_action = 'read' AND ap.can_read = true) OR
          (_action = 'write' AND ap.can_write = true) OR
          (_action = 'delete' AND ap.can_delete = true)
        )
    )
$$;

-- Função is_portal_user
CREATE OR REPLACE FUNCTION public.is_portal_user(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role IN ('admin', 'owner', 'manager', 'agent')
  )
$$;

-- RLS: agent_permissions
CREATE POLICY "owner_admin_select_permissions" ON public.agent_permissions
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'owner') OR user_id = auth.uid());

CREATE POLICY "owner_admin_insert_permissions" ON public.agent_permissions
  FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'owner'));

CREATE POLICY "owner_admin_update_permissions" ON public.agent_permissions
  FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'owner'));

CREATE POLICY "owner_admin_delete_permissions" ON public.agent_permissions
  FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'owner'));

-- RLS: clientes
CREATE POLICY "portal_select_clientes" ON public.clientes
  FOR SELECT TO authenticated
  USING (has_module_access(auth.uid(), 'crm', 'read'));

CREATE POLICY "portal_insert_clientes" ON public.clientes
  FOR INSERT TO authenticated
  WITH CHECK (has_module_access(auth.uid(), 'crm', 'write'));

CREATE POLICY "portal_update_clientes" ON public.clientes
  FOR UPDATE TO authenticated
  USING (has_module_access(auth.uid(), 'crm', 'write'));

CREATE POLICY "portal_delete_clientes" ON public.clientes
  FOR DELETE TO authenticated
  USING (has_module_access(auth.uid(), 'crm', 'delete'));

-- RLS: negocios
CREATE POLICY "portal_select_negocios" ON public.negocios
  FOR SELECT TO authenticated
  USING (has_module_access(auth.uid(), 'crm', 'read'));

CREATE POLICY "portal_insert_negocios" ON public.negocios
  FOR INSERT TO authenticated
  WITH CHECK (has_module_access(auth.uid(), 'crm', 'write'));

CREATE POLICY "portal_update_negocios" ON public.negocios
  FOR UPDATE TO authenticated
  USING (has_module_access(auth.uid(), 'crm', 'write'));

CREATE POLICY "portal_delete_negocios" ON public.negocios
  FOR DELETE TO authenticated
  USING (has_module_access(auth.uid(), 'crm', 'delete'));

-- RLS: financeiro
CREATE POLICY "portal_select_financeiro" ON public.financeiro
  FOR SELECT TO authenticated
  USING (has_module_access(auth.uid(), 'financeiro', 'read'));

CREATE POLICY "portal_insert_financeiro" ON public.financeiro
  FOR INSERT TO authenticated
  WITH CHECK (has_module_access(auth.uid(), 'financeiro', 'write'));

CREATE POLICY "portal_update_financeiro" ON public.financeiro
  FOR UPDATE TO authenticated
  USING (has_module_access(auth.uid(), 'financeiro', 'write'));

CREATE POLICY "portal_delete_financeiro" ON public.financeiro
  FOR DELETE TO authenticated
  USING (has_module_access(auth.uid(), 'financeiro', 'delete'));

-- Atualizar RLS de imoveis para novas roles
DROP POLICY IF EXISTS "Admin delete imoveis" ON public.imoveis;
CREATE POLICY "Portal delete imoveis" ON public.imoveis
  FOR DELETE TO authenticated
  USING (
    has_role(auth.uid(), 'admin') OR
    has_role(auth.uid(), 'owner') OR
    (created_by = auth.uid() AND has_module_access(auth.uid(), 'imoveis', 'delete'))
  );

DROP POLICY IF EXISTS "Auth insert imoveis" ON public.imoveis;
CREATE POLICY "Portal insert imoveis" ON public.imoveis
  FOR INSERT TO authenticated
  WITH CHECK (
    has_role(auth.uid(), 'admin') OR
    has_role(auth.uid(), 'editor') OR
    has_module_access(auth.uid(), 'imoveis', 'write')
  );

DROP POLICY IF EXISTS "Auth update imoveis" ON public.imoveis;
CREATE POLICY "Portal update imoveis" ON public.imoveis
  FOR UPDATE TO authenticated
  USING (
    has_role(auth.uid(), 'admin') OR
    has_role(auth.uid(), 'editor') OR
    has_module_access(auth.uid(), 'imoveis', 'write')
  );
