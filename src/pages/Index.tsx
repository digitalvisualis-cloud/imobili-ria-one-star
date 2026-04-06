import { useState, useCallback } from 'react';
import { usePublicImoveis } from '@/hooks/use-imoveis';
import { useSiteConfig } from '@/hooks/use-site-config';
import { PropertyCard } from '@/components/public/PropertyCard';
import { PropertyFilters } from '@/components/public/PropertyFilters';
import { PropertyFilters as Filters, Imovel } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function HomePage() {
  const { data: initialImoveis, isLoading: isInitialLoading } = usePublicImoveis();
  const { data: config } = useSiteConfig();
  const [searchResults, setSearchResults] = useState<Imovel[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = useCallback(async (filters: Filters) => {
    setIsSearching(true);
    try {
      let query = (supabase.from as any)('imoveis')
        .select('*')
        .eq('publicado', true)
        .order('destaque', { ascending: false })
        .order('updated_at', { ascending: false });

      if (filters.tipo) query = query.eq('tipo', filters.tipo);
      if (filters.finalidade) query = query.eq('finalidade', filters.finalidade);
      if (filters.cidade) query = query.ilike('cidade', `%${filters.cidade}%`);
      if (filters.bairro) query = query.ilike('bairro', `%${filters.bairro}%`);
      if (filters.preco_min) query = query.gte('preco', filters.preco_min);
      if (filters.preco_max) query = query.lte('preco', filters.preco_max);
      if (filters.quartos) query = query.gte('quartos', filters.quartos);

      const { data, error } = await query;

      if (error) {
        toast.error('Erro ao buscar imóveis');
        console.error('Search error:', error);
        return;
      }

      setSearchResults((data || []) as Imovel[]);
    } catch (e) {
      toast.error('Erro ao buscar imóveis');
      console.error('Search error:', e);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const imoveis = searchResults ?? initialImoveis;
  const isLoading = searchResults === null ? isInitialLoading : isSearching;

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-secondary py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="font-display text-4xl md:text-6xl font-bold text-secondary-foreground mb-4"
          >
            Encontre o imóvel dos seus <span className="text-primary">sonhos</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-secondary-foreground/70 font-body text-lg max-w-2xl mx-auto"
          >
            Confiança, transparência e excelência em cada negociação.
          </motion.p>
        </div>
      </section>

      {/* Filters + Listings */}
      <section className="container mx-auto px-4 -mt-8 relative z-10">
        <PropertyFilters onSearch={handleSearch} isSearching={isSearching} />
      </section>

      <section className="container mx-auto px-4 py-12">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-[400px] rounded-lg" />
            ))}
          </div>
        ) : imoveis && imoveis.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {imoveis.map((imovel, i) => (
              <motion.div
                key={imovel.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
              >
                <PropertyCard imovel={imovel} />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg font-body">
              Nenhum imóvel encontrado com os filtros selecionados.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
