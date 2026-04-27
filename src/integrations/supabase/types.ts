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
          tenant_id: string
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
          tenant_id: string
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
          tenant_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_permissions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
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
          tenant_id: string
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
          tenant_id: string
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
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_config_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
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
          tenant_id: string
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
          tenant_id: string
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
          tenant_id?: string
          tokens_used?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_search_logs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
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
          tenant_id: string
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
          tenant_id: string
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
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "api_keys_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
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
          tenant_id: string | null
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
          tenant_id?: string | null
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
          tenant_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "clientes_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
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
          tenant_id: string
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
          tenant_id: string
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
          tenant_id?: string
          termos_uso?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "config_site_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
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
          tenant_id: string | null
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
          tenant_id?: string | null
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
          tenant_id?: string | null
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
          {
            foreignKeyName: "financeiro_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      IMOBILIARIA_ANDRE_legacy: {
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
          agencia_nome: string | null
          agente_email: string | null
          agente_nome: string | null
          agente_telefone: string | null
          amenidades: string[] | null
          amenidades_outras: string | null
          area_m2: number | null
          area_terreno_m2: number | null
          bairro: string | null
          banheiros: number | null
          capa_url: string | null
          cidade: string | null
          codigo_imovel: string
          created_at: string
          created_by: string | null
          descricao: string | null
          destaque: boolean | null
          endereco: string | null
          estado: string | null
          finalidade: Database["public"]["Enums"]["finalidade_imovel"]
          formatos_gerados: Json | null
          gerado_at: string | null
          guion_escenas: Json | null
          id: string
          imagens: string[] | null
          mapa_url: string | null
          notas: string | null
          pisos: number | null
          preco: number
          publicado: boolean | null
          quartos: number | null
          status_geracao: Database["public"]["Enums"]["listapro_status"] | null
          status_geracao_erro: string | null
          suites: number | null
          tenant_id: string
          tipo: Database["public"]["Enums"]["tipo_imovel"]
          titulo: string
          updated_at: string
          vagas: number | null
          video_tipo: string | null
          video_url: string | null
          voiceover_contexto: string | null
          voiceover_tom: string | null
          voiceover_voz: string | null
        }
        Insert: {
          agencia_nome?: string | null
          agente_email?: string | null
          agente_nome?: string | null
          agente_telefone?: string | null
          amenidades?: string[] | null
          amenidades_outras?: string | null
          area_m2?: number | null
          area_terreno_m2?: number | null
          bairro?: string | null
          banheiros?: number | null
          capa_url?: string | null
          cidade?: string | null
          codigo_imovel: string
          created_at?: string
          created_by?: string | null
          descricao?: string | null
          destaque?: boolean | null
          endereco?: string | null
          estado?: string | null
          finalidade?: Database["public"]["Enums"]["finalidade_imovel"]
          formatos_gerados?: Json | null
          gerado_at?: string | null
          guion_escenas?: Json | null
          id?: string
          imagens?: string[] | null
          mapa_url?: string | null
          notas?: string | null
          pisos?: number | null
          preco?: number
          publicado?: boolean | null
          quartos?: number | null
          status_geracao?: Database["public"]["Enums"]["listapro_status"] | null
          status_geracao_erro?: string | null
          suites?: number | null
          tenant_id: string
          tipo?: Database["public"]["Enums"]["tipo_imovel"]
          titulo: string
          updated_at?: string
          vagas?: number | null
          video_tipo?: string | null
          video_url?: string | null
          voiceover_contexto?: string | null
          voiceover_tom?: string | null
          voiceover_voz?: string | null
        }
        Update: {
          agencia_nome?: string | null
          agente_email?: string | null
          agente_nome?: string | null
          agente_telefone?: string | null
          amenidades?: string[] | null
          amenidades_outras?: string | null
          area_m2?: number | null
          area_terreno_m2?: number | null
          bairro?: string | null
          banheiros?: number | null
          capa_url?: string | null
          cidade?: string | null
          codigo_imovel?: string
          created_at?: string
          created_by?: string | null
          descricao?: string | null
          destaque?: boolean | null
          endereco?: string | null
          estado?: string | null
          finalidade?: Database["public"]["Enums"]["finalidade_imovel"]
          formatos_gerados?: Json | null
          gerado_at?: string | null
          guion_escenas?: Json | null
          id?: string
          imagens?: string[] | null
          mapa_url?: string | null
          notas?: string | null
          pisos?: number | null
          preco?: number
          publicado?: boolean | null
          quartos?: number | null
          status_geracao?: Database["public"]["Enums"]["listapro_status"] | null
          status_geracao_erro?: string | null
          suites?: number | null
          tenant_id?: string
          tipo?: Database["public"]["Enums"]["tipo_imovel"]
          titulo?: string
          updated_at?: string
          vagas?: number | null
          video_tipo?: string | null
          video_url?: string | null
          voiceover_contexto?: string | null
          voiceover_tom?: string | null
          voiceover_voz?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "imoveis_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      imovel_views: {
        Row: {
          created_at: string
          id: string
          imovel_id: string
          tenant_id: string
          viewer_hash: string
        }
        Insert: {
          created_at?: string
          id?: string
          imovel_id: string
          tenant_id: string
          viewer_hash: string
        }
        Update: {
          created_at?: string
          id?: string
          imovel_id?: string
          tenant_id?: string
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
          {
            foreignKeyName: "imovel_views_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          agendamento_id: string | null
          bairro_desejado: string | null
          chatwoot_account_id: string | null
          chatwoot_conversation_id: string | null
          chatwoot_inbox_id: string | null
          chatwoot_lead_id: string | null
          created_at: string
          data_visita: string | null
          finalidade: string | null
          follow_up_1: string | null
          follow_up_2: string | null
          follow_up_3: string | null
          id: string
          identificador_lead: string | null
          inicio_atendimento: string | null
          marcou_no_grupo: string | null
          nome: string | null
          resumo_conversa: string | null
          tenant_id: string
          timestamp_ultima_msg: string | null
          tipo_imovel: string | null
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          agendamento_id?: string | null
          bairro_desejado?: string | null
          chatwoot_account_id?: string | null
          chatwoot_conversation_id?: string | null
          chatwoot_inbox_id?: string | null
          chatwoot_lead_id?: string | null
          created_at?: string
          data_visita?: string | null
          finalidade?: string | null
          follow_up_1?: string | null
          follow_up_2?: string | null
          follow_up_3?: string | null
          id?: string
          identificador_lead?: string | null
          inicio_atendimento?: string | null
          marcou_no_grupo?: string | null
          nome?: string | null
          resumo_conversa?: string | null
          tenant_id: string
          timestamp_ultima_msg?: string | null
          tipo_imovel?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          agendamento_id?: string | null
          bairro_desejado?: string | null
          chatwoot_account_id?: string | null
          chatwoot_conversation_id?: string | null
          chatwoot_inbox_id?: string | null
          chatwoot_lead_id?: string | null
          created_at?: string
          data_visita?: string | null
          finalidade?: string | null
          follow_up_1?: string | null
          follow_up_2?: string | null
          follow_up_3?: string | null
          id?: string
          identificador_lead?: string | null
          inicio_atendimento?: string | null
          marcou_no_grupo?: string | null
          nome?: string | null
          resumo_conversa?: string | null
          tenant_id?: string
          timestamp_ultima_msg?: string | null
          tipo_imovel?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      listapro_config: {
        Row: {
          ativo: boolean | null
          branding: Json | null
          created_at: string | null
          gemini_key: string | null
          id: string
          imobiliaria_id: string
          tenant_id: string
          webhook_secret: string
          webhook_url: string
        }
        Insert: {
          ativo?: boolean | null
          branding?: Json | null
          created_at?: string | null
          gemini_key?: string | null
          id?: string
          imobiliaria_id: string
          tenant_id: string
          webhook_secret: string
          webhook_url: string
        }
        Update: {
          ativo?: boolean | null
          branding?: Json | null
          created_at?: string | null
          gemini_key?: string | null
          id?: string
          imobiliaria_id?: string
          tenant_id?: string
          webhook_secret?: string
          webhook_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "listapro_config_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      listapro_jobs: {
        Row: {
          callback_url: string | null
          created_at: string | null
          erro: string | null
          id: string
          imovel_id: string | null
          payload: Json | null
          resultado: Json | null
          status: string | null
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          callback_url?: string | null
          created_at?: string | null
          erro?: string | null
          id?: string
          imovel_id?: string | null
          payload?: Json | null
          resultado?: Json | null
          status?: string | null
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          callback_url?: string | null
          created_at?: string | null
          erro?: string | null
          id?: string
          imovel_id?: string | null
          payload?: Json | null
          resultado?: Json | null
          status?: string | null
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "listapro_jobs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
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
      messaging_conversations: {
        Row: {
          ai_active: boolean
          assigned_to: string | null
          chatwoot_conversation_id: string | null
          created_at: string
          id: string
          last_message_at: string | null
          lead_id: string | null
          phone: string
          status: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          ai_active?: boolean
          assigned_to?: string | null
          chatwoot_conversation_id?: string | null
          created_at?: string
          id?: string
          last_message_at?: string | null
          lead_id?: string | null
          phone: string
          status?: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          ai_active?: boolean
          assigned_to?: string | null
          chatwoot_conversation_id?: string | null
          created_at?: string
          id?: string
          last_message_at?: string | null
          lead_id?: string | null
          phone?: string
          status?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "messaging_conversations_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messaging_conversations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      n8n_chat_histories: {
        Row: {
          id: number
          message: Json
          session_id: string
          tenant_id: string
        }
        Insert: {
          id?: number
          message: Json
          session_id: string
          tenant_id: string
        }
        Update: {
          id?: number
          message?: Json
          session_id?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "n8n_chat_histories_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
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
          tenant_id: string | null
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
          tenant_id?: string | null
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
          tenant_id?: string | null
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
          {
            foreignKeyName: "negocios_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      plans: {
        Row: {
          ativo: boolean
          created_at: string
          descricao: string | null
          features: Json
          id: string
          max_imoveis: number
          max_usuarios: number
          nome: string
          ordem: number
          preco_cents: number
          slug: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          descricao?: string | null
          features?: Json
          id?: string
          max_imoveis?: number
          max_usuarios?: number
          nome: string
          ordem?: number
          preco_cents: number
          slug: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          descricao?: string | null
          features?: Json
          id?: string
          max_imoveis?: number
          max_usuarios?: number
          nome?: string
          ordem?: number
          preco_cents?: number
          slug?: string
          updated_at?: string
        }
        Relationships: []
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
      subscriptions: {
        Row: {
          asaas_customer_id: string | null
          asaas_subscription_id: string | null
          canceled_at: string | null
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          last_event: string | null
          last_event_at: string | null
          plan_id: string
          status: string
          tenant_id: string
          trial_ends_at: string | null
          updated_at: string
        }
        Insert: {
          asaas_customer_id?: string | null
          asaas_subscription_id?: string | null
          canceled_at?: string | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          last_event?: string | null
          last_event_at?: string | null
          plan_id: string
          status?: string
          tenant_id: string
          trial_ends_at?: string | null
          updated_at?: string
        }
        Update: {
          asaas_customer_id?: string | null
          asaas_subscription_id?: string | null
          canceled_at?: string | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          last_event?: string | null
          last_event_at?: string | null
          plan_id?: string
          status?: string
          tenant_id?: string
          trial_ends_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_members: {
        Row: {
          created_at: string
          id: string
          is_default: boolean
          role: string
          tenant_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_default?: boolean
          role: string
          tenant_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_default?: boolean
          role?: string
          tenant_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_members_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants: {
        Row: {
          active: boolean
          asaas_customer_id: string | null
          brand_kit: Json
          chatwoot_account_id: string | null
          cidade: string | null
          created_at: string
          estado: string | null
          id: string
          nome: string
          plan: string
          plan_id: string | null
          slug: string
          subscription_status: string
          trial_ends_at: string | null
          uazapi_instance_id: string | null
          updated_at: string
          whatsapp_number: string | null
        }
        Insert: {
          active?: boolean
          asaas_customer_id?: string | null
          brand_kit?: Json
          chatwoot_account_id?: string | null
          cidade?: string | null
          created_at?: string
          estado?: string | null
          id?: string
          nome: string
          plan?: string
          plan_id?: string | null
          slug: string
          subscription_status?: string
          trial_ends_at?: string | null
          uazapi_instance_id?: string | null
          updated_at?: string
          whatsapp_number?: string | null
        }
        Update: {
          active?: boolean
          asaas_customer_id?: string | null
          brand_kit?: Json
          chatwoot_account_id?: string | null
          cidade?: string | null
          created_at?: string
          estado?: string | null
          id?: string
          nome?: string
          plan?: string
          plan_id?: string | null
          slug?: string
          subscription_status?: string
          trial_ends_at?: string | null
          uazapi_instance_id?: string | null
          updated_at?: string
          whatsapp_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tenants_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
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
          identificador_lead: string | null
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
          identificador_lead?: string | null
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
          identificador_lead?: string | null
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
    }
    Functions: {
      current_tenant_id: { Args: never; Returns: string }
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
      is_member_of: { Args: { p_tenant: string }; Returns: boolean }
      is_portal_user: { Args: { _user_id: string }; Returns: boolean }
      is_slug_available: { Args: { p_slug: string }; Returns: boolean }
      provision_tenant: {
        Args: {
          p_asaas_customer_id: string
          p_asaas_subscription_id: string
          p_cidade: string
          p_current_period_end: string
          p_estado: string
          p_logo_url: string
          p_nome: string
          p_plan_slug: string
          p_primary_color: string
          p_slug: string
          p_user_id: string
          p_whatsapp_number: string
        }
        Returns: {
          tenant_id: string
          tenant_slug: string
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "editor" | "viewer" | "owner" | "manager" | "agent"
      finalidade_imovel: "venda" | "aluguel" | "temporada"
      financeiro_status: "pendente" | "pago" | "atrasado"
      financeiro_tipo: "receita" | "despesa"
      listapro_status: "rascunho" | "gerando" | "pronto" | "erro"
      negocio_status: "prospeccao" | "negociacao" | "fechado" | "cancelado"
      portal_module: "imoveis" | "crm" | "financeiro" | "dashboard"
      tipo_imovel:
        | "apartamento"
        | "casa"
        | "chacara"
        | "sitio"
        | "terreno"
        | "comercial"
        | "cobertura"
        | "studio"
        | "sala_comercial"
        | "loja"
        | "galpao"
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
      finalidade_imovel: ["venda", "aluguel", "temporada"],
      financeiro_status: ["pendente", "pago", "atrasado"],
      financeiro_tipo: ["receita", "despesa"],
      listapro_status: ["rascunho", "gerando", "pronto", "erro"],
      negocio_status: ["prospeccao", "negociacao", "fechado", "cancelado"],
      portal_module: ["imoveis", "crm", "financeiro", "dashboard"],
      tipo_imovel: [
        "apartamento",
        "casa",
        "chacara",
        "sitio",
        "terreno",
        "comercial",
        "cobertura",
        "studio",
        "sala_comercial",
        "loja",
        "galpao",
      ],
    },
  },
} as const
