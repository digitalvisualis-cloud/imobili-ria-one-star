import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Imovel, PropertyFilters } from '@/lib/types';

export function usePublicImoveis(filters?: PropertyFilters) {
  return useQuery({
    queryKey: ['imoveis', 'public', filters],
    queryFn: async (): Promise<Imovel[]> => {
      let query = (supabase.from as any)('imoveis')
        .select('*')
        .eq('publicado', true)
        .order('destaque', { ascending: false })
        .order('updated_at', { ascending: false });

      if (filters?.tipo) query = query.eq('tipo', filters.tipo);
      if (filters?.finalidade) query = query.eq('finalidade', filters.finalidade);
      if (filters?.cidade) query = query.ilike('cidade', `%${filters.cidade}%`);
      if (filters?.bairro) query = query.ilike('bairro', `%${filters.bairro}%`);
      if (filters?.preco_min) query = query.gte('preco', filters.preco_min);
      if (filters?.preco_max) query = query.lte('preco', filters.preco_max);
      if (filters?.quartos) query = query.gte('quartos', filters.quartos);
      if (filters?.vagas) query = query.gte('vagas', filters.vagas);

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as unknown as Imovel[];
    },
  });
}

export function useAllImoveis(search?: string, filterPublicado?: boolean | null, filterDestaque?: boolean | null, filterTipo?: string, filterFinalidade?: string) {
  return useQuery({
    queryKey: ['imoveis', 'admin', search, filterPublicado, filterDestaque, filterTipo, filterFinalidade],
    queryFn: async (): Promise<Imovel[]> => {
      let query = (supabase.from as any)('imoveis')
        .select('*')
        .order('destaque', { ascending: false })
        .order('updated_at', { ascending: false });

      if (search) {
        query = query.or(`titulo.ilike.%${search}%,bairro.ilike.%${search}%,cidade.ilike.%${search}%,codigo_imovel.ilike.%${search}%`);
      }
      if (filterPublicado !== null && filterPublicado !== undefined) query = query.eq('publicado', filterPublicado);
      if (filterDestaque !== null && filterDestaque !== undefined) query = query.eq('destaque', filterDestaque);
      if (filterTipo) query = query.eq('tipo', filterTipo as any);
      if (filterFinalidade) query = query.eq('finalidade', filterFinalidade as any);

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as unknown as Imovel[];
    },
  });
}

export function useImovel(id: string) {
  return useQuery({
    queryKey: ['imovel', id],
    queryFn: async (): Promise<Imovel | null> => {
      const { data, error } = await (supabase.from as any)('imoveis')
        .select('*')
        .eq('id', id)
        .single();
      if (error) return null;
      return data as unknown as Imovel;
    },
    enabled: !!id,
  });
}

export function useImovelByCodigo(codigo: string) {
  return useQuery({
    queryKey: ['imovel', 'codigo', codigo],
    queryFn: async (): Promise<Imovel | null> => {
      const { data, error } = await supabase
        .from('imoveis')
        .select('*')
        .eq('codigo_imovel', codigo)
        .eq('publicado', true)
        .single();
      if (error) return null;
      return data as unknown as Imovel;
    },
    enabled: !!codigo,
  });
}

export function useCreateImovel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (imovel: Partial<Imovel>) => {
      const { error } = await supabase.from('imoveis').insert(imovel as any);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['imoveis'] });
    },
  });
}

export function useUpdateImovel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Imovel> & { id: string }) => {
      const { error } = await supabase.from('imoveis').update(updates as any).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['imoveis'] });
      queryClient.invalidateQueries({ queryKey: ['imovel'] });
    },
  });
}

export function useDeleteImovel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('imoveis').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['imoveis'] });
    },
  });
}
