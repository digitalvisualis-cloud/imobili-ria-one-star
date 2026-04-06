import { useState } from 'react';
import { PropertyFilters as Filters, TIPO_LABELS, FINALIDADE_LABELS } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X, Sparkles, SlidersHorizontal } from 'lucide-react';

interface Props {
  onSearch: (filters: Filters) => void;
  onAiSearch?: (query: string) => void;
  isSearching?: boolean;
}

export function PropertyFilters({ onSearch, onAiSearch, isSearching }: Props) {
  const [draft, setDraft] = useState<Filters>({});
  const [aiQuery, setAiQuery] = useState('');
  const [mode, setMode] = useState<'filters' | 'ai'>('filters');

  const update = (key: keyof Filters, value: any) => {
    setDraft(prev => ({ ...prev, [key]: value || undefined }));
  };

  const clear = () => {
    setDraft({});
    setAiQuery('');
  };

  const handleSearch = () => {
    onSearch(draft);
  };

  const handleAiSearch = () => {
    if (aiQuery.trim() && onAiSearch) {
      onAiSearch(aiQuery.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (mode === 'ai') handleAiSearch();
      else handleSearch();
    }
  };

  const hasFilters = Object.values(draft).some(v => v !== undefined && v !== '');

  return (
    <div className="bg-card rounded-lg border border-border p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-semibold">Buscar Imóveis</h2>
        <div className="flex items-center gap-2">
          <Button
            variant={mode === 'filters' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setMode('filters')}
          >
            <SlidersHorizontal className="h-4 w-4 mr-1" /> Filtros
          </Button>
          <Button
            variant={mode === 'ai' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setMode('ai')}
          >
            <Sparkles className="h-4 w-4 mr-1" /> Busca IA
          </Button>
          {(hasFilters || aiQuery) && (
            <Button variant="ghost" size="sm" onClick={clear} className="text-muted-foreground">
              <X className="h-4 w-4 mr-1" /> Limpar
            </Button>
          )}
        </div>
      </div>

      {mode === 'ai' ? (
        <div className="space-y-3">
          <div className="relative">
            <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
            <Input
              placeholder='Ex: "Quero uma casa com 3 quartos em Campinas até 500 mil"'
              value={aiQuery}
              onChange={(e) => setAiQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="pl-10 h-12 text-base"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Descreva o que procura em linguagem natural. A IA interpretará seus critérios automaticamente.
          </p>
          <div className="flex justify-end">
            <Button onClick={handleAiSearch} disabled={isSearching || !aiQuery.trim()} size="lg">
              <Sparkles className="h-4 w-4 mr-2" />
              {isSearching ? 'Buscando com IA...' : 'Buscar com IA'}
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
            <Select value={draft.tipo || ''} onValueChange={(v) => update('tipo', v)}>
              <SelectTrigger><SelectValue placeholder="Tipo" /></SelectTrigger>
              <SelectContent>
                {Object.entries(TIPO_LABELS).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={draft.finalidade || ''} onValueChange={(v) => update('finalidade', v)}>
              <SelectTrigger><SelectValue placeholder="Finalidade" /></SelectTrigger>
              <SelectContent>
                {Object.entries(FINALIDADE_LABELS).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              placeholder="Bairro ou Cidade"
              value={draft.bairro || draft.cidade || ''}
              onChange={(e) => {
                update('bairro', e.target.value);
                update('cidade', e.target.value);
              }}
              onKeyDown={handleKeyDown}
            />

            <Input
              placeholder="Preço mín."
              type="number"
              value={draft.preco_min || ''}
              onChange={(e) => update('preco_min', e.target.value ? Number(e.target.value) : undefined)}
              onKeyDown={handleKeyDown}
            />

            <Input
              placeholder="Preço máx."
              type="number"
              value={draft.preco_max || ''}
              onChange={(e) => update('preco_max', e.target.value ? Number(e.target.value) : undefined)}
              onKeyDown={handleKeyDown}
            />

            <Select value={draft.quartos?.toString() || ''} onValueChange={(v) => update('quartos', v ? Number(v) : undefined)}>
              <SelectTrigger><SelectValue placeholder="Quartos" /></SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5].map(n => (
                  <SelectItem key={n} value={n.toString()}>{n}+ quartos</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSearch} disabled={isSearching} size="lg">
              <Search className="h-4 w-4 mr-2" />
              {isSearching ? 'Buscando...' : 'Buscar'}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
