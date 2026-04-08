import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Users, DollarSign, CalendarDays, MessageSquare } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/types';
import ViewsAnalytics from '@/components/analytics/ViewsAnalytics';

export default function Dashboard() {
  const { data: imoveis } = useQuery({
    queryKey: ['portal-imoveis-count'],
    queryFn: async () => {
      const { count } = await supabase.from('imoveis').select('*', { count: 'exact', head: true });
      return count || 0;
    },
  });

  const { data: leadsCount } = useQuery({
    queryKey: ['portal-leads-month'],
    queryFn: async () => {
      const now = new Date();
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const { count } = await (supabase.from as any)('IMOBILIARIA_ANDRE').select('*', { count: 'exact', head: true }).gte('Inicio do atendimento', firstDay);
      return count || 0;
    },
  });

  const { data: financeiro } = useQuery({
    queryKey: ['portal-financeiro-saldo'],
    queryFn: async () => {
      const now = new Date();
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const { data } = await (supabase.from as any)('financeiro').select('tipo, valor').gte('created_at', firstDay);
      if (!data) return { receitas: 0, despesas: 0 };
      const receitas = data.filter((r: any) => r.tipo === 'receita').reduce((s: number, r: any) => s + Number(r.valor), 0);
      const despesas = data.filter((r: any) => r.tipo === 'despesa').reduce((s: number, r: any) => s + Number(r.valor), 0);
      return { receitas, despesas };
    },
  });

  const saldoMes = financeiro ? financeiro.receitas - financeiro.despesas : null;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-display font-bold text-foreground">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Imóveis</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{imoveis ?? 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Leads este mês</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{leadsCount ?? 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Visitas este mês</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">—</div>
            <Badge variant="secondary" className="text-[10px] mt-1">Em breve</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Saldo do mês</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${saldoMes !== null && saldoMes < 0 ? 'text-destructive' : 'text-foreground'}`}>
              {saldoMes !== null ? formatCurrency(saldoMes) : '—'}
            </div>
          </CardContent>
        </Card>
      </div>

      <ViewsAnalytics />
    </div>
  );
}
