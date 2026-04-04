import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Lead } from '@/lib/types';

export function useLeads(search?: string) {
  return useQuery({
    queryKey: ['leads', search],
    queryFn: async (): Promise<Lead[]> => {
      let query = (supabase.from as any)('IMOBILIARIA_ANDRE')
        .select('*')
        .order('Inicio do atendimento', { ascending: false });

      if (search) {
        query = query.or(
          `Nome.ilike.%${search}%,Whatsapp.ilike.%${search}%,Bairro desejado.ilike.%${search}%`
        );
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as Lead[];
    },
  });
}
