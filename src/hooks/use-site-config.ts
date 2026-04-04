import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { ConfigSite } from '@/lib/types';

export function useSiteConfig() {
  return useQuery({
    queryKey: ['config_site'],
    queryFn: async (): Promise<ConfigSite> => {
      const { data, error } = await (supabase.from as any)('config_site')
        .select('*')
        .limit(1)
        .single();
      if (error) throw error;
      return data as unknown as ConfigSite;
    },
  });
}

export function useUpdateSiteConfig() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (updates: Partial<ConfigSite>) => {
      const { data: existing } = await (supabase.from as any)('config_site')
        .select('id')
        .limit(1)
        .single();
      if (!existing) throw new Error('Config not found');
      const { error } = await (supabase.from as any)('config_site')
        .update(updates as any)
        .eq('id', existing.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['config_site'] });
    },
  });
}
