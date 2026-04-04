import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function AiLogs() {
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedLog, setSelectedLog] = useState<any>(null);

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['ai-logs', statusFilter],
    queryFn: async () => {
      let q = supabase.from('ai_search_logs').select('*').order('created_at', { ascending: false }).limit(100);
      if (statusFilter !== 'all') q = q.eq('status', statusFilter);
      const { data } = await q;
      return data || [];
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Logs da Busca IA</h1>
          <p className="text-muted-foreground text-sm">Histórico de buscas realizadas via IA</p>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="success">Sucesso</SelectItem>
            <SelectItem value="error">Erro</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Query</TableHead>
              <TableHead>Provedor</TableHead>
              <TableHead>Resultados</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Tempo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Carregando...</TableCell></TableRow>
            ) : logs.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Nenhum log encontrado</TableCell></TableRow>
            ) : logs.map((log: any) => (
              <TableRow key={log.id} className="cursor-pointer" onClick={() => setSelectedLog(log)}>
                <TableCell className="text-sm">{new Date(log.created_at).toLocaleString('pt-BR')}</TableCell>
                <TableCell className="max-w-[200px] truncate text-sm">{log.query}</TableCell>
                <TableCell className="text-sm">{log.model || '—'}</TableCell>
                <TableCell className="text-sm">{log.results_count}</TableCell>
                <TableCell>
                  <Badge variant={log.status === 'success' ? 'default' : 'destructive'}>{log.status}</Badge>
                </TableCell>
                <TableCell className="text-sm">{log.response_time_ms}ms</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes do Log</DialogTitle>
            <DialogDescription>Informações completas da busca IA</DialogDescription>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-4 text-sm">
              <div><strong>Query:</strong> <span className="text-muted-foreground">{selectedLog.query}</span></div>
              <div><strong>Provedor / Modelo:</strong> <span className="text-muted-foreground">{selectedLog.provider} / {selectedLog.model}</span></div>
              <div><strong>Status:</strong> <Badge variant={selectedLog.status === 'success' ? 'default' : 'destructive'}>{selectedLog.status}</Badge></div>
              <div><strong>Resultados:</strong> <span className="text-muted-foreground">{selectedLog.results_count}</span></div>
              <div><strong>Tempo de resposta:</strong> <span className="text-muted-foreground">{selectedLog.response_time_ms}ms</span></div>
              <div><strong>Tokens usados:</strong> <span className="text-muted-foreground">{selectedLog.tokens_used || '—'}</span></div>
              <div><strong>Custo estimado:</strong> <span className="text-muted-foreground">{selectedLog.estimated_cost ? `$${selectedLog.estimated_cost}` : '—'}</span></div>
              <div>
                <strong>Filtros interpretados:</strong>
                <pre className="bg-muted p-3 rounded mt-1 text-xs overflow-x-auto">{JSON.stringify(selectedLog.filters_extracted, null, 2)}</pre>
              </div>
              <div>
                <strong>IDs retornados:</strong>
                <pre className="bg-muted p-3 rounded mt-1 text-xs overflow-x-auto">{JSON.stringify(selectedLog.result_ids, null, 2)}</pre>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
