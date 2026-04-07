import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Search, Pencil, Trash2 } from 'lucide-react';
import { formatCurrency, TIPO_LABELS, FINALIDADE_LABELS } from '@/lib/types';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

export default function PortalProperties() {
  const [search, setSearch] = useState('');
  const queryClient = useQueryClient();
  const { role, user } = useAuth();

  const { data: imoveis, isLoading } = useQuery({
    queryKey: ['portal-imoveis', search],
    queryFn: async () => {
      let query = supabase.from('imoveis').select('*').order('created_at', { ascending: false });
      if (search) {
        query = query.or(`titulo.ilike.%${search}%,codigo_imovel.ilike.%${search}%,cidade.ilike.%${search}%`);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('imoveis').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portal-imoveis'] });
      toast.success('Imóvel removido com sucesso');
    },
    onError: () => toast.error('Erro ao remover imóvel'),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold text-foreground">Imóveis</h1>
        <Button asChild>
          <Link to="/admin/imoveis/novo">
            <Plus className="h-4 w-4 mr-2" /> Novo Imóvel
          </Link>
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por título, código ou cidade..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Título</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Finalidade</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">Carregando...</TableCell></TableRow>
              ) : imoveis?.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">Nenhum imóvel encontrado</TableCell></TableRow>
              ) : (
                imoveis?.map(imovel => (
                  <TableRow key={imovel.id}>
                    <TableCell className="font-mono text-xs">{imovel.codigo_imovel}</TableCell>
                    <TableCell className="font-medium">{imovel.titulo}</TableCell>
                    <TableCell>{TIPO_LABELS[imovel.tipo as keyof typeof TIPO_LABELS]}</TableCell>
                    <TableCell>{FINALIDADE_LABELS[imovel.finalidade as keyof typeof FINALIDADE_LABELS]}</TableCell>
                    <TableCell>{formatCurrency(imovel.preco)}</TableCell>
                    <TableCell>
                      <Badge variant={imovel.publicado ? 'default' : 'secondary'}>
                        {imovel.publicado ? 'Publicado' : 'Rascunho'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="ghost" size="icon" asChild>
                        <Link to={`/admin/imoveis/${imovel.id}`}><Pencil className="h-4 w-4" /></Link>
                      </Button>
                      {(role === 'owner' || role === 'admin' || (imovel as any).created_by === user?.id) && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteMutation.mutate(imovel.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
