import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { Plus, Copy, Key, Ban } from 'lucide-react';

async function hashKey(key: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(key);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export default function ApiKeys() {
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [generatedKey, setGeneratedKey] = useState('');

  const { data: keys = [], isLoading } = useQuery({
    queryKey: ['api-keys'],
    queryFn: async () => {
      const { data } = await (supabase.from as any)('api_keys').select('*').order('created_at', { ascending: false });
      return data || [];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (name: string) => {
      const rawKey = crypto.randomUUID() + '-' + crypto.randomUUID();
      const keyHash = await hashKey(rawKey);
      const keyPreview = rawKey.slice(-8);
      await supabase.from('api_keys').insert({ name, key_hash: keyHash, key_preview: keyPreview });
      return rawKey;
    },
    onSuccess: (rawKey) => {
      setGeneratedKey(rawKey);
      queryClient.invalidateQueries({ queryKey: ['api-keys'] });
      toast.success('Chave gerada com sucesso!');
    },
  });

  const revokeMutation = useMutation({
    mutationFn: async (id: string) => {
      await supabase.from('api_keys').update({ active: false }).eq('id', id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-keys'] });
      toast.success('Chave revogada');
    },
  });

  const handleCreate = () => {
    createMutation.mutate(newKeyName || 'Chave sem nome');
  };

  const copyKey = () => {
    navigator.clipboard.writeText(generatedKey);
    toast.success('Chave copiada!');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Chaves de API</h1>
          <p className="text-muted-foreground text-sm">Gerencie as chaves de acesso à API privada</p>
        </div>
        <Button onClick={() => { setShowCreate(true); setGeneratedKey(''); setNewKeyName(''); }}>
          <Plus className="h-4 w-4 mr-2" /> Gerar nova chave
        </Button>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Chave</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Criada em</TableHead>
              <TableHead>Último uso</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Carregando...</TableCell></TableRow>
            ) : keys.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Nenhuma chave criada</TableCell></TableRow>
            ) : keys.map((k: any) => (
              <TableRow key={k.id}>
                <TableCell className="font-medium">{k.name}</TableCell>
                <TableCell className="font-mono text-sm">****{k.key_preview}</TableCell>
                <TableCell>
                  <Badge variant={k.active ? 'default' : 'destructive'}>
                    {k.active ? 'Ativa' : 'Revogada'}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(k.created_at).toLocaleDateString('pt-BR')}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {k.last_used_at ? new Date(k.last_used_at).toLocaleDateString('pt-BR') : '—'}
                </TableCell>
                <TableCell>
                  {k.active && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm"><Ban className="h-4 w-4 text-destructive" /></Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Revogar chave?</AlertDialogTitle>
                          <AlertDialogDescription>Esta ação não pode ser desfeita. A chave deixará de funcionar imediatamente.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => revokeMutation.mutate(k.id)}>Revogar</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Create Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{generatedKey ? 'Chave gerada!' : 'Gerar nova chave de API'}</DialogTitle>
            <DialogDescription>
              {generatedKey ? 'Copie a chave abaixo. Ela não será exibida novamente.' : 'Dê um nome para identificar esta chave.'}
            </DialogDescription>
          </DialogHeader>

          {!generatedKey ? (
            <>
              <Input placeholder="Nome da chave (ex: N8N Produção)" value={newKeyName} onChange={e => setNewKeyName(e.target.value)} />
              <DialogFooter>
                <Button onClick={handleCreate} disabled={createMutation.isPending}>
                  <Key className="h-4 w-4 mr-2" /> Gerar chave
                </Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <div className="bg-muted p-3 rounded-md font-mono text-xs break-all select-all">{generatedKey}</div>
              <DialogFooter>
                <Button onClick={copyKey}><Copy className="h-4 w-4 mr-2" /> Copiar chave</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
