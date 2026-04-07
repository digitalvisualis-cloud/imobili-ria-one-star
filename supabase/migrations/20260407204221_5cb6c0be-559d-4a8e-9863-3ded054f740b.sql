
-- Expandir enum app_role (precisa ser commitado antes de usar)
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'owner';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'manager';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'agent';

-- Criar enums auxiliares
CREATE TYPE public.portal_module AS ENUM ('imoveis', 'crm', 'financeiro', 'dashboard');
CREATE TYPE public.negocio_status AS ENUM ('prospeccao', 'negociacao', 'fechado', 'cancelado');
CREATE TYPE public.financeiro_tipo AS ENUM ('receita', 'despesa');
CREATE TYPE public.financeiro_status AS ENUM ('pendente', 'pago', 'atrasado');

-- Adicionar created_by em imoveis
ALTER TABLE public.imoveis ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL;
