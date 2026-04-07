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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Pencil, Trash2, Handshake } from 'lucide-react';
import { formatCurrency } from '@/lib/types';
import { toast } from 'sonner';

const STATUS_LABELS: Record<string, string> = {
  prospeccao: 'Prospecção',
  negociacao: 'Negociação',
  fechado: 'Fechado',
  cancelado: 'Cancelado',
};

const STATUS_COLORS: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  prospeccao: 'outline',
  negociacao: 'secondary',
  fechado: 'default',
  cancelado: 'destructive',
};

export default function CRM() {
  const [search, setSearch] = useState('');
  const [showClientForm, setShowClientForm] = useState(false);
  const [showDealForm, setShowDealForm] = useState(false);
  const [editingClient, setEditingClient] = useState<any>(null);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const [clientForm, setClientForm] = useState({ nome: '', email: '', telefone: '', cpf_cnpj: '', observacoes: '' });
  const [dealForm, setDealForm] = useState({ imovel_id: '', valor: '', comissao_percentual: '', status: 'prospeccao', observacoes: '' });

  const { data: clientes, isLoading } = useQuery({
    queryKey: ['portal-clientes', search],
    queryFn: async () => {
      let query = (supabase.from as any)('clientes').select('*').order('created_at', { ascending: false });
      if (search) query = query.or(`nome.ilike.%${search}%,email.ilike.%${search}%,telefone.ilike.%${search}%`);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const { data: negocios } = useQuery({
    queryKey: ['portal-negocios-list'],
    queryFn: async () => {
      const { data, error } = await (supabase.from as any)('negocios').select('*, clientes(nome), imoveis(titulo, codigo_imovel)').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: imoveis } = useQuery({
    queryKey: ['portal-imoveis-select'],
    queryFn: async () => {
      const { data } = await supabase.from('imoveis').select('id, titulo, codigo_imovel');
      return data || [];
    },
  });

  const saveClientMutation = useMutation({
    mutationFn: async (data: any) => {
      if (editingClient) {
        const { error } = await (supabase.from as any)('clientes').update(data).eq('id', editingClient.id);
        if (error) throw error;
      } else {
        const { error } = await (supabase.from as any)('clientes').insert({ ...data, created_by: user?.id });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portal-clientes'] });
      toast.success(editingClient ? 'Cliente atualizado' : 'Cliente cadastrado');
      setShowClientForm(false);
      setEditingClient(null);
      setClientForm({ nome: '', email: '', telefone: '', cpf_cnpj: '', observacoes: '' });
    },
    onError: () => toast.error('Erro ao salvar cliente'),
  });

  const deleteClientMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase.from as any)('clientes').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portal-clientes'] });
      toast.success('Cliente removido');
    },
    onError: () => toast.error('Erro ao remover cliente'),
  });

  const saveDealMutation = useMutation({
    mutationFn: async () => {
      const valor = Number(dealForm.valor) || 0;
      const comissao_percentual = Number(dealForm.comissao_percentual) || 0;
      const comissao_valor = valor * (comissao_percentual / 100);
      const { error } = await (supabase.from as any)('negocios').insert({
        cliente_id: selectedClientId,
        imovel_id: dealForm.imovel_id || null,
        valor,
        comissao_percentual,
        comissao_valor,
        status: dealForm.status,
        observacoes: dealForm.observacoes || null,
        created_by: user?.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portal-negocios'] });
      toast.success('Negócio registrado');
      setShowDealForm(false);
      setDealForm({ imovel_id: '', valor: '', comissao_percentual: '', status: 'prospeccao', observacoes: '' });
    },
    onError: () => toast.error('Erro ao salvar negócio'),
  });

  const openEditClient = (client: any) => {
    setEditingClient(client);
    setClientForm({ nome: client.nome, email: client.email || '', telefone: client.telefone || '', cpf_cnpj: client.cpf_cnpj || '', observacoes: client.observacoes || '' });
    setShowClientForm(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold text-foreground">CRM - Clientes & Negócios</h1>
        <Button onClick={() => { setEditingClient(null); setClientForm({ nome: '', email: '', telefone: '', cpf_cnpj: '', observacoes: '' }); setShowClientForm(true); }}>
          <Plus className="h-4 w-4 mr-2" /> Novo Cliente
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Buscar clientes..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
      </div>

      {/* Clients Table */}
      <Card>
        <CardHeader><CardTitle>Clientes</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>CPF/CNPJ</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Carregando...</TableCell></TableRow>
              ) : clientes?.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Nenhum cliente cadastrado</TableCell></TableRow>
              ) : (
                clientes?.map((c: any) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.nome}</TableCell>
                    <TableCell>{c.email || '-'}</TableCell>
                    <TableCell>{c.telefone || '-'}</TableCell>
                    <TableCell>{c.cpf_cnpj || '-'}</TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button variant="ghost" size="icon" onClick={() => { setSelectedClientId(c.id); setShowDealForm(true); }}>
                        <Handshake className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => openEditClient(c)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => deleteClientMutation.mutate(c.id)} className="text-destructive hover:text-destructive">
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

      {/* Deals Table */}
      <Card>
        <CardHeader><CardTitle>Negócios</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Imóvel</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Comissão</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!negocios?.length ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Nenhum negócio registrado</TableCell></TableRow>
              ) : (
                negocios?.map((n: any) => (
                  <TableRow key={n.id}>
                    <TableCell className="font-medium">{n.clientes?.nome || '-'}</TableCell>
                    <TableCell>{n.imoveis ? `${n.imoveis.codigo_imovel} - ${n.imoveis.titulo}` : '-'}</TableCell>
                    <TableCell>{formatCurrency(n.valor)}</TableCell>
                    <TableCell>{formatCurrency(n.comissao_valor)} ({n.comissao_percentual}%)</TableCell>
                    <TableCell><Badge variant={STATUS_COLORS[n.status]}>{STATUS_LABELS[n.status]}</Badge></TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Client Form Dialog */}
      <Dialog open={showClientForm} onOpenChange={setShowClientForm}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingClient ? 'Editar Cliente' : 'Novo Cliente'}</DialogTitle></DialogHeader>
          <form onSubmit={e => { e.preventDefault(); saveClientMutation.mutate(clientForm); }} className="space-y-4">
            <div className="space-y-2">
              <Label>Nome *</Label>
              <Input value={clientForm.nome} onChange={e => setClientForm(f => ({ ...f, nome: e.target.value }))} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>E-mail</Label>
                <Input type="email" value={clientForm.email} onChange={e => setClientForm(f => ({ ...f, email: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Telefone</Label>
                <Input value={clientForm.telefone} onChange={e => setClientForm(f => ({ ...f, telefone: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>CPF/CNPJ</Label>
              <Input value={clientForm.cpf_cnpj} onChange={e => setClientForm(f => ({ ...f, cpf_cnpj: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Observações</Label>
              <Textarea value={clientForm.observacoes} onChange={e => setClientForm(f => ({ ...f, observacoes: e.target.value }))} />
            </div>
            <Button type="submit" className="w-full" disabled={saveClientMutation.isPending}>
              {saveClientMutation.isPending ? 'Salvando...' : 'Salvar'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Deal Form Dialog */}
      <Dialog open={showDealForm} onOpenChange={setShowDealForm}>
        <DialogContent>
          <DialogHeader><DialogTitle>Novo Negócio</DialogTitle></DialogHeader>
          <form onSubmit={e => { e.preventDefault(); saveDealMutation.mutate(); }} className="space-y-4">
            <div className="space-y-2">
              <Label>Imóvel</Label>
              <Select value={dealForm.imovel_id} onValueChange={v => setDealForm(f => ({ ...f, imovel_id: v }))}>
                <SelectTrigger><SelectValue placeholder="Selecione (opcional)" /></SelectTrigger>
                <SelectContent>
                  {imoveis?.map(i => (
                    <SelectItem key={i.id} value={i.id}>{i.codigo_imovel} - {i.titulo}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Valor (R$) *</Label>
                <Input type="number" value={dealForm.valor} onChange={e => setDealForm(f => ({ ...f, valor: e.target.value }))} required />
              </div>
              <div className="space-y-2">
                <Label>Comissão (%)</Label>
                <Input type="number" step="0.1" value={dealForm.comissao_percentual} onChange={e => setDealForm(f => ({ ...f, comissao_percentual: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={dealForm.status} onValueChange={v => setDealForm(f => ({ ...f, status: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="prospeccao">Prospecção</SelectItem>
                  <SelectItem value="negociacao">Negociação</SelectItem>
                  <SelectItem value="fechado">Fechado</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Observações</Label>
              <Textarea value={dealForm.observacoes} onChange={e => setDealForm(f => ({ ...f, observacoes: e.target.value }))} />
            </div>
            <Button type="submit" className="w-full" disabled={saveDealMutation.isPending}>
              {saveDealMutation.isPending ? 'Salvando...' : 'Registrar Negócio'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
