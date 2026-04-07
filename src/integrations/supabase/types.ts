export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      agent_permissions: {
        Row: {
          can_delete: boolean
          can_read: boolean
          can_write: boolean
          created_at: string
          id: string
          module: Database["public"]["Enums"]["portal_module"]
          updated_at: string
          user_id: string
        }
        Insert: {
          can_delete?: boolean
          can_read?: boolean
          can_write?: boolean
          created_at?: string
          id?: string
          module: Database["public"]["Enums"]["portal_module"]
          updated_at?: string
          user_id: string
        }
        Update: {
          can_delete?: boolean
          can_read?: boolean
          can_write?: boolean
          created_at?: string
          id?: string
          module?: Database["public"]["Enums"]["portal_module"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_config: {
        Row: {
          api_key_encrypted: string | null
          created_at: string
          default_mode: string
          id: string
          max_tokens: number | null
          model: string
          provider: string
          updated_at: string
        }
        Insert: {
          api_key_encrypted?: string | null
          created_at?: string
          default_mode?: string
          id?: string
          max_tokens?: number | null
          model?: string
          provider?: string
          updated_at?: string
        }
        Update: {
          api_key_encrypted?: string | null
          created_at?: string
          default_mode?: string
          id?: string
          max_tokens?: number | null
          model?: string
          provider?: string
          updated_at?: string
        }
        Relationships: []
      }
      ai_search_logs: {
        Row: {
          created_at: string
          estimated_cost: number | null
          filters_extracted: Json | null
          id: string
          model: string | null
          provider: string | null
          query: string
          response_time_ms: number | null
          result_ids: string[] | null
          results_count: number | null
          status: string
          tokens_used: number | null
        }
        Insert: {
          created_at?: string
          estimated_cost?: number | null
          filters_extracted?: Json | null
          id?: string
          model?: string | null
          provider?: string | null
          query: string
          response_time_ms?: number | null
          result_ids?: string[] | null
          results_count?: number | null
          status?: string
          tokens_used?: number | null
        }
        Update: {
          created_at?: string
          estimated_cost?: number | null
          filters_extracted?: Json | null
          id?: string
          model?: string | null
          provider?: string | null
          query?: string
          response_time_ms?: number | null
          result_ids?: string[] | null
          results_count?: number | null
          status?: string
          tokens_used?: number | null
        }
        Relationships: []
      }
      api_keys: {
        Row: {
          active: boolean
          created_at: string
          created_by_user_id: string | null
          id: string
          key_hash: string
          key_preview: string
          last_used_at: string | null
          name: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          created_by_user_id?: string | null
          id?: string
          key_hash: string
          key_preview: string
          last_used_at?: string | null
          name?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          created_by_user_id?: string | null
          id?: string
          key_hash?: string
          key_preview?: string
          last_used_at?: string | null
          name?: string
        }
        Relationships: []
      }
      api_request_logs: {
        Row: {
          api_key_id: string | null
          created_at: string | null
          endpoint: string
          id: string
          ip_address: string | null
          method: string
          response_time_ms: number | null
          status_code: number | null
        }
        Insert: {
          api_key_id?: string | null
          created_at?: string | null
          endpoint: string
          id?: string
          ip_address?: string | null
          method: string
          response_time_ms?: number | null
          status_code?: number | null
        }
        Update: {
          api_key_id?: string | null
          created_at?: string | null
          endpoint?: string
          id?: string
          ip_address?: string | null
          method?: string
          response_time_ms?: number | null
          status_code?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "api_request_logs_api_key_id_fkey"
            columns: ["api_key_id"]
            isOneToOne: false
            referencedRelation: "api_keys"
            referencedColumns: ["id"]
          },
        ]
      }
      clientes: {
        Row: {
          cpf_cnpj: string | null
          created_at: string
          created_by: string | null
          email: string | null
          id: string
          nome: string
          observacoes: string | null
          telefone: string | null
          updated_at: string
        }
        Insert: {
          cpf_cnpj?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          id?: string
          nome: string
          observacoes?: string | null
          telefone?: string | null
          updated_at?: string
        }
        Update: {
          cpf_cnpj?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          id?: string
          nome?: string
          observacoes?: string | null
          telefone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      config_site: {
        Row: {
          created_at: string
          email: string | null
          endereco_texto: string | null
          favicon_url: string | null
          google_maps_url: string | null
          id: string
          logo_url: string | null
          nome_imobiliaria: string
          politica_cookies: string | null
          politica_privacidade: string | null
          termos_uso: string | null
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          endereco_texto?: string | null
          favicon_url?: string | null
          google_maps_url?: string | null
          id?: string
          logo_url?: string | null
          nome_imobiliaria?: string
          politica_cookies?: string | null
          politica_privacidade?: string | null
          termos_uso?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          endereco_texto?: string | null
          favicon_url?: string | null
          google_maps_url?: string | null
          id?: string
          logo_url?: string | null
          nome_imobiliaria?: string
          politica_cookies?: string | null
          politica_privacidade?: string | null
          termos_uso?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: []
      }
      financeiro: {
        Row: {
          categoria: string
          created_at: string
          created_by: string | null
          data_pagamento: string | null
          data_vencimento: string | null
          descricao: string | null
          id: string
          negocio_id: string | null
          status: Database["public"]["Enums"]["financeiro_status"]
          tipo: Database["public"]["Enums"]["financeiro_tipo"]
          updated_at: string
          valor: number
        }
        Insert: {
          categoria?: string
          created_at?: string
          created_by?: string | null
          data_pagamento?: string | null
          data_vencimento?: string | null
          descricao?: string | null
          id?: string
          negocio_id?: string | null
          status?: Database["public"]["Enums"]["financeiro_status"]
          tipo: Database["public"]["Enums"]["financeiro_tipo"]
          updated_at?: string
          valor?: number
        }
        Update: {
          categoria?: string
          created_at?: string
          created_by?: string | null
          data_pagamento?: string | null
          data_vencimento?: string | null
          descricao?: string | null
          id?: string
          negocio_id?: string | null
          status?: Database["public"]["Enums"]["financeiro_status"]
          tipo?: Database["public"]["Enums"]["financeiro_tipo"]
          updated_at?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "financeiro_negocio_id_fkey"
            columns: ["negocio_id"]
            isOneToOne: false
            referencedRelation: "negocios"
            referencedColumns: ["id"]
          },
        ]
      }
      IMOBILIARIA_ANDRE: {
        Row: {
          "Bairro desejado": string | null
          "Data da visita": string | null
          Finalidade: string | null
          "Follow UP 1": string | null
          "Follow UP 2": string | null
          "Follow UP 3": string | null
          id_agendamento: string | null
          "IDConta ChatWoot": string | null
          "IDConversa ChatWoot": string | null
          identificador_lead: string
          "IDLead ChatWoot": string | null
          "InboxID ChatWoot": string | null
          "Inicio do atendimento": string | null
          "Marcou no Grupo": string | null
          Nome: string | null
          "Resumo da conversa": string | null
          "Timestamp ultima msg": string | null
          "Tipo de imovel": string | null
          Whatsapp: string | null
        }
        Insert: {
          "Bairro desejado"?: string | null
          "Data da visita"?: string | null
          Finalidade?: string | null
          "Follow UP 1"?: string | null
          "Follow UP 2"?: string | null
          "Follow UP 3"?: string | null
          id_agendamento?: string | null
          "IDConta ChatWoot"?: string | null
          "IDConversa ChatWoot"?: string | null
          identificador_lead?: string
          "IDLead ChatWoot"?: string | null
          "InboxID ChatWoot"?: string | null
          "Inicio do atendimento"?: string | null
          "Marcou no Grupo"?: string | null
          Nome?: string | null
          "Resumo da conversa"?: string | null
          "Timestamp ultima msg"?: string | null
          "Tipo de imovel"?: string | null
          Whatsapp?: string | null
        }
        Update: {
          "Bairro desejado"?: string | null
          "Data da visita"?: string | null
          Finalidade?: string | null
          "Follow UP 1"?: string | null
          "Follow UP 2"?: string | null
          "Follow UP 3"?: string | null
          id_agendamento?: string | null
          "IDConta ChatWoot"?: string | null
          "IDConversa ChatWoot"?: string | null
          identificador_lead?: string
          "IDLead ChatWoot"?: string | null
          "InboxID ChatWoot"?: string | null
          "Inicio do atendimento"?: string | null
          "Marcou no Grupo"?: string | null
          Nome?: string | null
          "Resumo da conversa"?: string | null
          "Timestamp ultima msg"?: string | null
          "Tipo de imovel"?: string | null
          Whatsapp?: string | null
        }
        Relationships: []
      }
      imoveis: {
        Row: {
          area_m2: number | null
          bairro: string | null
          banheiros: number | null
          capa_url: string | null
          cidade: string | null
          codigo_imovel: string
          created_at: string
          created_by: string | null
          descricao: string | null
          destaque: boolean | null
          estado: string | null
          finalidade: Database["public"]["Enums"]["finalidade_imovel"]
          id: string
          imagens: string[] | null
          mapa_url: string | null
          preco: number
          publicado: boolean | null
          quartos: number | null
          tipo: Database["public"]["Enums"]["tipo_imovel"]
          titulo: string
          updated_at: string
          vagas: number | null
          video_url: string | null
        }
        Insert: {
          area_m2?: number | null
          bairro?: string | null
          banheiros?: number | null
          capa_url?: string | null
          cidade?: string | null
          codigo_imovel: string
          created_at?: string
          created_by?: string | null
          descricao?: string | null
          destaque?: boolean | null
          estado?: string | null
          finalidade?: Database["public"]["Enums"]["finalidade_imovel"]
          id?: string
          imagens?: string[] | null
          mapa_url?: string | null
          preco?: number
          publicado?: boolean | null
          quartos?: number | null
          tipo?: Database["public"]["Enums"]["tipo_imovel"]
          titulo: string
          updated_at?: string
          vagas?: number | null
          video_url?: string | null
        }
        Update: {
          area_m2?: number | null
          bairro?: string | null
          banheiros?: number | null
          capa_url?: string | null
          cidade?: string | null
          codigo_imovel?: string
          created_at?: string
          created_by?: string | null
          descricao?: string | null
          destaque?: boolean | null
          estado?: string | null
          finalidade?: Database["public"]["Enums"]["finalidade_imovel"]
          id?: string
          imagens?: string[] | null
          mapa_url?: string | null
          preco?: number
          publicado?: boolean | null
          quartos?: number | null
          tipo?: Database["public"]["Enums"]["tipo_imovel"]
          titulo?: string
          updated_at?: string
          vagas?: number | null
          video_url?: string | null
        }
        Relationships: []
      }
      imovel_views: {
        Row: {
          created_at: string
          id: string
          imovel_id: string
          viewer_hash: string
        }
        Insert: {
          created_at?: string
          id?: string
          imovel_id: string
          viewer_hash: string
        }
        Update: {
          created_at?: string
          id?: string
          imovel_id?: string
          viewer_hash?: string
        }
        Relationships: [
          {
            foreignKeyName: "imovel_views_imovel_id_fkey"
            columns: ["imovel_id"]
            isOneToOne: false
            referencedRelation: "imoveis"
            referencedColumns: ["id"]
          },
        ]
      }
      login_attempts: {
        Row: {
          attempt_count: number | null
          blocked_until: string | null
          created_at: string | null
          email: string | null
          first_attempt_at: string | null
          id: string
          ip_address: string
        }
        Insert: {
          attempt_count?: number | null
          blocked_until?: string | null
          created_at?: string | null
          email?: string | null
          first_attempt_at?: string | null
          id?: string
          ip_address: string
        }
        Update: {
          attempt_count?: number | null
          blocked_until?: string | null
          created_at?: string | null
          email?: string | null
          first_attempt_at?: string | null
          id?: string
          ip_address?: string
        }
        Relationships: []
      }
      n8n_chat_histories: {
        Row: {
          id: number
          message: Json
          session_id: string
        }
        Insert: {
          id?: number
          message: Json
          session_id: string
        }
        Update: {
          id?: number
          message?: Json
          session_id?: string
        }
        Relationships: []
      }
      negocios: {
        Row: {
          cliente_id: string
          comissao_percentual: number | null
          comissao_valor: number | null
          created_at: string
          created_by: string | null
          data_fechamento: string | null
          id: string
          imovel_id: string | null
          observacoes: string | null
          status: Database["public"]["Enums"]["negocio_status"]
          updated_at: string
          valor: number
        }
        Insert: {
          cliente_id: string
          comissao_percentual?: number | null
          comissao_valor?: number | null
          created_at?: string
          created_by?: string | null
          data_fechamento?: string | null
          id?: string
          imovel_id?: string | null
          observacoes?: string | null
          status?: Database["public"]["Enums"]["negocio_status"]
          updated_at?: string
          valor?: number
        }
        Update: {
          cliente_id?: string
          comissao_percentual?: number | null
          comissao_valor?: number | null
          created_at?: string
          created_by?: string | null
          data_fechamento?: string | null
          id?: string
          imovel_id?: string | null
          observacoes?: string | null
          status?: Database["public"]["Enums"]["negocio_status"]
          updated_at?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "negocios_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "negocios_imovel_id_fkey"
            columns: ["imovel_id"]
            isOneToOne: false
            referencedRelation: "imoveis"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          must_change_password: boolean | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          must_change_password?: boolean | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          must_change_password?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_any_role: { Args: { _user_id: string }; Returns: boolean }
      has_module_access: {
        Args: {
          _action?: string
          _module: Database["public"]["Enums"]["portal_module"]
          _user_id: string
        }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_portal_user: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "editor" | "viewer" | "owner" | "manager" | "agent"
      finalidade_imovel: "venda" | "aluguel"
      financeiro_status: "pendente" | "pago" | "atrasado"
      financeiro_tipo: "receita" | "despesa"
      negocio_status: "prospeccao" | "negociacao" | "fechado" | "cancelado"
      portal_module: "imoveis" | "crm" | "financeiro" | "dashboard"
      tipo_imovel:
        | "apartamento"
        | "casa"
        | "chacara"
        | "sitio"
        | "terreno"
        | "comercial"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "editor", "viewer", "owner", "manager", "agent"],
      finalidade_imovel: ["venda", "aluguel"],
      financeiro_status: ["pendente", "pago", "atrasado"],
      financeiro_tipo: ["receita", "despesa"],
      negocio_status: ["prospeccao", "negociacao", "fechado", "cancelado"],
      portal_module: ["imoveis", "crm", "financeiro", "dashboard"],
      tipo_imovel: [
        "apartamento",
        "casa",
        "chacara",
        "sitio",
        "terreno",
        "comercial",
      ],
    },
  },
} as const
