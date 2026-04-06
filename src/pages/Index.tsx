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
import { Badge } from '@/components/ui/badge';

export default function HomePage() {
  const { data: initialImoveis, isLoading: isInitialLoading } = usePublicImoveis();
  const { data: config } = useSiteConfig();
  const [searchResults, setSearchResults] = useState<Imovel[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [aiMeta, setAiMeta] = useState<{ filtros_extraidos?: any; observacoes?: string } | null>(null);

  const handleSearch = useCallback(async (filters: Filters) => {
    setIsSearching(true);
    setAiMeta(null);
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

  const handleAiSearch = useCallback(async (query: string) => {
    setIsSearching(true);
    setAiMeta(null);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/public-search`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ query }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || 'Erro na busca com IA');
        return;
      }

      setSearchResults((data.items || []) as Imovel[]);
      setAiMeta(data.meta || null);

      if (data.meta?.observacoes) {
        toast.info(data.meta.observacoes);
      }
    } catch (e) {
      toast.error('Erro ao conectar com a busca IA');
      console.error('AI search error:', e);
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
        <PropertyFilters onSearch={handleSearch} onAiSearch={handleAiSearch} isSearching={isSearching} />
      </section>

      {aiMeta?.filtros_extraidos && Object.keys(aiMeta.filtros_extraidos).length > 0 && (
        <section className="container mx-auto px-4 pt-6">
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Filtros interpretados pela IA:</span>
            {Object.entries(aiMeta.filtros_extraidos).map(([key, value]) => (
              <Badge key={key} variant="secondary" className="capitalize">
                {key.replace(/_/g, ' ')}: {String(value)}
              </Badge>
            ))}
          </div>
        </section>
      )}

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
          <div className="text-center py-16 max-w-md mx-auto">
            <p className="text-muted-foreground text-lg font-body mb-2">
              Nenhum imóvel encontrado com os filtros selecionados.
            </p>
            <p className="text-muted-foreground/70 text-sm font-body mb-6">
              Mas não se preocupe! Podemos ajudar você a encontrar o imóvel ideal.
            </p>
            {config?.whatsapp ? (
              <a
                href={`https://wa.me/${config.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent('Olá! Busquei no site mas não encontrei o imóvel que procuro. Podem me ajudar?')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#1da851] text-white font-medium px-6 py-3 rounded-lg transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 00.612.638l4.694-1.347A11.955 11.955 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.37 0-4.567-.7-6.412-1.9l-.45-.297-3.09.887.928-3.013-.324-.483A9.935 9.935 0 012 12C2 6.486 6.486 2 12 2s10 4.486 10 10-4.486 10-10 10z"/></svg>
                Falar com um corretor
              </a>
            ) : (
              <p className="text-sm text-muted-foreground/60">
                Entre em contato conosco para encontrar o imóvel perfeito para você.
              </p>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
