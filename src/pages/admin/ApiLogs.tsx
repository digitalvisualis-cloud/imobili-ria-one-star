import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

export default function ApiLogs() {
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedLog, setSelectedLog] = useState<any>(null);

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['api-request-logs', statusFilter],
    queryFn: async () => {
      let q = supabase.from('api_request_logs').select('*, api_keys(name, key_preview)').order('created_at', { ascending: false }).limit(200);
      if (statusFilter !== 'all') {
        const code = parseInt(statusFilter);
        if (code === 200) q = q.gte('status_code', 200).lt('status_code', 300);
        else if (code === 400) q = q.gte('status_code', 400).lt('status_code', 500);
        else if (code === 500) q = q.gte('status_code', 500);
      }
      const { data } = await q;
      return data || [];
    },
  });

  const statusBadge = (code: number) => {
    if (code >= 200 && code < 300) return <Badge variant="default">{code}</Badge>;
    if (code >= 400 && code < 500) return <Badge variant="secondary">{code}</Badge>;
    return <Badge variant="destructive">{code}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Logs da API</h1>
          <p className="text-muted-foreground text-sm">Histórico de requisições à API REST</p>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="200">2xx (Sucesso)</SelectItem>
            <SelectItem value="400">4xx (Erro cliente)</SelectItem>
            <SelectItem value="500">5xx (Erro servidor)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Método</TableHead>
              <TableHead>Endpoint</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>IP</TableHead>
              <TableHead>API Key</TableHead>
              <TableHead>Tempo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Carregando...</TableCell></TableRow>
            ) : logs.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Nenhum log encontrado</TableCell></TableRow>
            ) : logs.map((log: any) => (
              <TableRow key={log.id} className="cursor-pointer" onClick={() => setSelectedLog(log)}>
                <TableCell className="text-sm">{new Date(log.created_at).toLocaleString('pt-BR')}</TableCell>
                <TableCell className="text-sm font-mono">{log.method}</TableCell>
                <TableCell className="text-sm font-mono max-w-[200px] truncate">{log.endpoint}</TableCell>
                <TableCell>{log.status_code ? statusBadge(log.status_code) : '—'}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{log.ip_address || '—'}</TableCell>
                <TableCell className="text-sm">
                  {log.api_keys ? `${log.api_keys.name} (****${log.api_keys.key_preview})` : '—'}
                </TableCell>
                <TableCell className="text-sm">{log.response_time_ms ? `${log.response_time_ms}ms` : '—'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalhes da requisição</DialogTitle>
            <DialogDescription>Informações completas da chamada à API</DialogDescription>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-3 text-sm">
              <div><strong>Data:</strong> <span className="text-muted-foreground">{new Date(selectedLog.created_at).toLocaleString('pt-BR')}</span></div>
              <div><strong>Método:</strong> <span className="text-muted-foreground">{selectedLog.method}</span></div>
              <div><strong>Endpoint:</strong> <span className="text-muted-foreground font-mono">{selectedLog.endpoint}</span></div>
              <div><strong>Status:</strong> {selectedLog.status_code ? statusBadge(selectedLog.status_code) : '—'}</div>
              <div><strong>IP:</strong> <span className="text-muted-foreground">{selectedLog.ip_address || '—'}</span></div>
              <div><strong>API Key:</strong> <span className="text-muted-foreground">{selectedLog.api_keys ? `${selectedLog.api_keys.name} (****${selectedLog.api_keys.key_preview})` : '—'}</span></div>
              <div><strong>Tempo de resposta:</strong> <span className="text-muted-foreground">{selectedLog.response_time_ms ? `${selectedLog.response_time_ms}ms` : '—'}</span></div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
