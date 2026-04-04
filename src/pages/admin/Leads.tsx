import { useState } from 'react';
import { useLeads } from '@/hooks/use-leads';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, MessageSquare, Calendar, User, Phone } from 'lucide-react';
import { buildWhatsAppLink } from '@/lib/types';

export default function Leads() {
  const [search, setSearch] = useState('');
  const { data: leads, isLoading, error } = useLeads(search);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '—';
    try {
      return new Date(dateStr).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Leads</h1>
        <p className="text-muted-foreground text-sm">Gerenciamento de leads do ChatWoot</p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome, WhatsApp ou bairro..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {isLoading && <p className="text-muted-foreground">Carregando leads...</p>}
      {error && <p className="text-destructive">Erro ao carregar leads: {(error as Error).message}</p>}

      {leads && (
        <div className="rounded-lg border border-border overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>WhatsApp</TableHead>
                <TableHead>Tipo / Finalidade</TableHead>
                <TableHead>Bairro</TableHead>
                <TableHead>Visita</TableHead>
                <TableHead>Follow Ups</TableHead>
                <TableHead>Início</TableHead>
                <TableHead>Última msg</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leads.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                    Nenhum lead encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                leads.map((lead) => (
                  <TableRow key={lead.identificador_lead}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        {lead.Nome || '—'}
                      </div>
                    </TableCell>
                    <TableCell>
                      {lead.Whatsapp ? (
                        <a
                          href={buildWhatsAppLink(lead.Whatsapp, 'Olá!')}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-primary hover:underline"
                        >
                          <Phone className="h-3 w-3" />
                          {lead.Whatsapp}
                        </a>
                      ) : '—'}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        {lead['Tipo de imovel'] && (
                          <Badge variant="outline" className="w-fit text-xs">{lead['Tipo de imovel']}</Badge>
                        )}
                        {lead.Finalidade && (
                          <Badge variant="secondary" className="w-fit text-xs">{lead.Finalidade}</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{lead['Bairro desejado'] || '—'}</TableCell>
                    <TableCell>
                      {lead['Data da visita'] ? (
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          {lead['Data da visita']}
                        </div>
                      ) : '—'}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-0.5 text-xs">
                        {lead['Follow UP 1'] && <span>1: {lead['Follow UP 1']}</span>}
                        {lead['Follow UP 2'] && <span>2: {lead['Follow UP 2']}</span>}
                        {lead['Follow UP 3'] && <span>3: {lead['Follow UP 3']}</span>}
                        {!lead['Follow UP 1'] && !lead['Follow UP 2'] && !lead['Follow UP 3'] && '—'}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{formatDate(lead['Inicio do atendimento'])}</TableCell>
                    <TableCell className="text-sm">{formatDate(lead['Timestamp ultima msg'])}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {leads && (
        <p className="text-xs text-muted-foreground">
          {leads.length} lead{leads.length !== 1 ? 's' : ''} encontrado{leads.length !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  );
}
