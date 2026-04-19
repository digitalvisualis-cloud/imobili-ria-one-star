import { Check, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  /** Todas as fotos disponíveis (do imóvel cadastrado) */
  available: string[];
  /** Fotos atualmente selecionadas para envio */
  selected: string[];
  onChange: (selected: string[]) => void;
}

/**
 * Grid de fotos com toggle por clique. A primeira selecionada
 * é destacada como "capa".
 */
export function ImageSelector({ available, selected, onChange }: Props) {
  if (!available.length) {
    return (
      <div className="rounded-md border border-dashed border-border p-6 text-center text-sm text-muted-foreground flex flex-col items-center gap-2">
        <ImageIcon className="h-6 w-6 opacity-50" />
        Esse imóvel não tem fotos cadastradas.
      </div>
    );
  }

  const toggle = (url: string) => {
    onChange(
      selected.includes(url)
        ? selected.filter(x => x !== url)
        : [...selected, url]
    );
  };

  const allSelected = selected.length === available.length;
  const toggleAll = () => onChange(allSelected ? [] : [...available]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {selected.length} de {available.length} foto(s) selecionada(s)
          {selected.length > 0 && <> · capa: <span className="font-medium text-foreground">1ª selecionada</span></>}
        </p>
        <button
          type="button"
          onClick={toggleAll}
          className="text-xs font-medium text-primary hover:underline"
        >
          {allSelected ? 'Desmarcar todas' : 'Selecionar todas'}
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {available.map((url, idx) => {
          const isSelected = selected.includes(url);
          const orderIdx = selected.indexOf(url);
          return (
            <button
              key={url + idx}
              type="button"
              onClick={() => toggle(url)}
              className={cn(
                'relative group aspect-square rounded-md overflow-hidden border-2 transition-all',
                isSelected
                  ? 'border-primary ring-2 ring-primary/30'
                  : 'border-border hover:border-muted-foreground/50 opacity-60 hover:opacity-100'
              )}
            >
              <img src={url} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover" />
              {isSelected && (
                <div className="absolute top-1.5 left-1.5 h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shadow">
                  {orderIdx === 0 ? <Check className="h-3.5 w-3.5" /> : orderIdx + 1}
                </div>
              )}
              {isSelected && orderIdx === 0 && (
                <div className="absolute bottom-0 inset-x-0 bg-primary text-primary-foreground text-[10px] font-semibold py-0.5 text-center uppercase tracking-wide">
                  Capa
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
