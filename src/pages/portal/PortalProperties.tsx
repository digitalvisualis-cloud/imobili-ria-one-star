import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency, TIPO_LABELS, FINALIDADE_LABELS } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Plus, Search, Copy, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function PortalProperties() {
  const [search, setSearch] = useState('');
  const [filterPublicado, setFilterPublicado] = useState<boolean | null>(null);
  const [filterDestaque, setFilterDestaque] = useState<boolean | null>(null);
  const [filterTipo, setFilterTipo] = useState('');
  const [filterFinalidade, setFilterFinalidade] = useState('');
  const queryClient = useQueryClient();
  const { role, user } = useAuth();

  const { data: imoveis, isLoading } = useQuery({
    queryKey: ['portal-imoveis', search, filterPublicado, filterDestaque, filterTipo, filterFinalidade],
    queryFn: async () => {
      let query = supabase.from('imoveis').select('*').order('created_at', { ascending: false });
      if (search) {
        query = query.or(`titulo.ilike.%${search}%,codigo_imovel.ilike.%${search}%,cidade.ilike.%${search}%,bairro.ilike.%${search}%`);
      }
      if (filterPublicado !== null) query = query.eq('publicado', filterPublicado);
      if (filterDestaque !== null) query = query.eq('destaque', filterDestaque);
      if (filterTipo && filterTipo !== 'all') query = query.eq('tipo', filterTipo as any);
      if (filterFinalidade && filterFinalidade !== 'all') query = query.eq('finalidade', filterFinalidade as any);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (params: { id: string; publicado?: boolean; destaque?: boolean }) => {
      const { id, ...rest } = params;
      const { error } = await supabase.from('imoveis').update(rest).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['portal-imoveis'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('imoveis').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portal-imoveis'] });
      toast.success('Imóvel excluído com sucesso!');
    },
    onError: () => toast.error('Erro ao excluir imóvel'),
  });

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Código copiado!');
  };

  const togglePublicado = async (id: string, current: boolean) => {
    await updateMutation.mutateAsync({ id, publicado: !current });
    toast.success(!current ? 'Imóvel publicado' : 'Imóvel despublicado');
  };

  const toggleDestaque = async (id: string, current: boolean) => {
    await updateMutation.mutateAsync({ id, destaque: !current });
    toast.success(!current ? 'Destaque ativado' : 'Destaque removido');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold">Imóveis</h1>
        <Link to="/painel/imoveis/novo">
          <Button>
            <Plus className="h-4 w-4 mr-2" /> Adicionar imóvel
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por título, bairro, cidade ou código..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterTipo} onValueChange={setFilterTipo}>
          <SelectTrigger className="w-[150px]"><SelectValue placeholder="Tipo" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {Object.entries(TIPO_LABELS).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterFinalidade} onValueChange={setFilterFinalidade}>
          <SelectTrigger className="w-[150px]"><SelectValue placeholder="Finalidade" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {Object.entries(FINALIDADE_LABELS).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-lg" />)}
        </div>
      ) : imoveis && imoveis.length > 0 ? (
        <div className="space-y-3">
          {imoveis.map(imovel => (
            <div key={imovel.id} className="flex items-center gap-4 p-4 rounded-lg border border-border bg-card hover:shadow-sm transition-shadow">
              <div className="shrink-0 w-16 h-12 rounded-md overflow-hidden bg-muted">
                <img src={imovel.capa_url || '/placeholder.svg'} alt="" className="w-full h-full object-cover" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-sm truncate">{imovel.titulo}</h3>
                  <Badge variant="outline" className="text-xs shrink-0">{TIPO_LABELS[imovel.tipo as keyof typeof TIPO_LABELS]}</Badge>
                  <Badge variant="outline" className="text-xs shrink-0">{FINALIDADE_LABELS[imovel.finalidade as keyof typeof FINALIDADE_LABELS]}</Badge>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span>{[imovel.bairro, imovel.cidade].filter(Boolean).join(', ')}</span>
                  <span className="font-semibold text-primary">{formatCurrency(imovel.preco)}</span>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => copyCode(imovel.codigo_imovel)}
                  className="flex items-center gap-1 px-2 py-1 rounded text-xs bg-muted hover:bg-muted/80 font-mono"
                >
                  {imovel.codigo_imovel}
                  <Copy className="h-3 w-3" />
                </button>
              </div>

              <div className="flex items-center gap-4 shrink-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-muted-foreground">Pub.</span>
                  <Switch checked={imovel.publicado ?? false} onCheckedChange={() => togglePublicado(imovel.id, imovel.publicado ?? false)} />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-muted-foreground">Dest.</span>
                  <Switch checked={imovel.destaque ?? false} onCheckedChange={() => toggleDestaque(imovel.id, imovel.destaque ?? false)} />
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <Link to={`/painel/imoveis/${imovel.id}`}>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Pencil className="h-4 w-4" />
                  </Button>
                </Link>
                {(role === 'owner' || role === 'admin' || (imovel as any).created_by === user?.id) && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Excluir imóvel</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza que deseja excluir "{imovel.titulo}"? Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          onClick={() => deleteMutation.mutate(imovel.id)}
                        >
                          Excluir
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-muted-foreground mb-4">Nenhum imóvel encontrado.</p>
          <Link to="/painel/imoveis/novo">
            <Button><Plus className="h-4 w-4 mr-2" /> Adicionar primeiro imóvel</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
