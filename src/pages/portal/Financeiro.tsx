import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, TrendingUp, TrendingDown, Trash2 } from 'lucide-react';
import { formatCurrency } from '@/lib/types';
import { toast } from 'sonner';

const STATUS_LABELS: Record<string, string> = { pendente: 'Pendente', pago: 'Pago', atrasado: 'Atrasado' };
const STATUS_COLORS: Record<string, 'default' | 'secondary' | 'destructive'> = { pendente: 'secondary', pago: 'default', atrasado: 'destructive' };

export default function Financeiro() {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ tipo: 'receita', categoria: '', valor: '', data_vencimento: '', data_pagamento: '', status: 'pendente', descricao: '', negocio_id: '' });
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: registros, isLoading } = useQuery({
    queryKey: ['portal-financeiro'],
    queryFn: async () => {
      const { data, error } = await (supabase.from as any)('financeiro').select('*, negocios(clientes(nome), imoveis(codigo_imovel))').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: negocios } = useQuery({
    queryKey: ['portal-negocios-fin'],
    queryFn: async () => {
      const { data } = await (supabase.from as any)('negocios').select('id, valor, clientes(nome)');
      return data || [];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const { error } = await (supabase.from as any)('financeiro').insert({
        tipo: form.tipo,
        categoria: form.categoria || 'geral',
        valor: Number(form.valor) || 0,
        data_vencimento: form.data_vencimento || null,
        data_pagamento: form.data_pagamento || null,
        status: form.status,
        descricao: form.descricao || null,
        negocio_id: form.negocio_id || null,
        created_by: user?.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portal-financeiro'] });
      toast.success('Registro financeiro adicionado');
      setShowForm(false);
      setForm({ tipo: 'receita', categoria: '', valor: '', data_vencimento: '', data_pagamento: '', status: 'pendente', descricao: '', negocio_id: '' });
    },
    onError: () => toast.error('Erro ao salvar'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase.from as any)('financeiro').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portal-financeiro'] });
      toast.success('Registro removido');
    },
    onError: () => toast.error('Erro ao remover'),
  });

  const totalReceitas = registros?.filter((r: any) => r.tipo === 'receita').reduce((s: number, r: any) => s + Number(r.valor), 0) || 0;
  const totalDespesas = registros?.filter((r: any) => r.tipo === 'despesa').reduce((s: number, r: any) => s + Number(r.valor), 0) || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold text-foreground">Financeiro</h1>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" /> Novo Registro
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Receitas</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold text-green-600">{formatCurrency(totalReceitas)}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Despesas</CardTitle>
            <TrendingDown className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold text-destructive">{formatCurrency(totalDespesas)}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Saldo</CardTitle>
          </CardHeader>
          <CardContent><div className={`text-2xl font-bold ${totalReceitas - totalDespesas >= 0 ? 'text-green-600' : 'text-destructive'}`}>{formatCurrency(totalReceitas - totalDespesas)}</div></CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tipo</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Carregando...</TableCell></TableRow>
              ) : !registros?.length ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Nenhum registro</TableCell></TableRow>
              ) : (
                registros?.map((r: any) => (
                  <TableRow key={r.id}>
                    <TableCell>
                      <Badge variant={r.tipo === 'receita' ? 'default' : 'destructive'}>
                        {r.tipo === 'receita' ? 'Receita' : 'Despesa'}
                      </Badge>
                    </TableCell>
                    <TableCell className="capitalize">{r.categoria}</TableCell>
                    <TableCell>{r.descricao || '-'}</TableCell>
                    <TableCell className={r.tipo === 'receita' ? 'text-green-600' : 'text-destructive'}>
                      {formatCurrency(r.valor)}
                    </TableCell>
                    <TableCell>{r.data_vencimento || '-'}</TableCell>
                    <TableCell><Badge variant={STATUS_COLORS[r.status]}>{STATUS_LABELS[r.status]}</Badge></TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(r.id)} className="text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader><DialogTitle>Novo Registro Financeiro</DialogTitle></DialogHeader>
          <form onSubmit={e => { e.preventDefault(); saveMutation.mutate(); }} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipo *</Label>
                <Select value={form.tipo} onValueChange={v => setForm(f => ({ ...f, tipo: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="receita">Receita</SelectItem>
                    <SelectItem value="despesa">Despesa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Categoria</Label>
                <Input value={form.categoria} onChange={e => setForm(f => ({ ...f, categoria: e.target.value }))} placeholder="Ex: comissão, aluguel" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Valor (R$) *</Label>
                <Input type="number" value={form.valor} onChange={e => setForm(f => ({ ...f, valor: e.target.value }))} required />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pendente">Pendente</SelectItem>
                    <SelectItem value="pago">Pago</SelectItem>
                    <SelectItem value="atrasado">Atrasado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Vencimento</Label>
                <Input type="date" value={form.data_vencimento} onChange={e => setForm(f => ({ ...f, data_vencimento: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Pagamento</Label>
                <Input type="date" value={form.data_pagamento} onChange={e => setForm(f => ({ ...f, data_pagamento: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Negócio vinculado</Label>
              <Select value={form.negocio_id} onValueChange={v => setForm(f => ({ ...f, negocio_id: v }))}>
                <SelectTrigger><SelectValue placeholder="Nenhum (opcional)" /></SelectTrigger>
                <SelectContent>
                  {negocios?.map((n: any) => (
                    <SelectItem key={n.id} value={n.id}>{n.clientes?.nome} - {formatCurrency(n.valor)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea value={form.descricao} onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))} />
            </div>
            <Button type="submit" className="w-full" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? 'Salvando...' : 'Salvar'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
