import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Users, DollarSign } from 'lucide-react';
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

  const { data: clientes } = useQuery({
    queryKey: ['portal-clientes-count'],
    queryFn: async () => {
      const { count } = await (supabase.from as any)('clientes').select('*', { count: 'exact', head: true });
      return count || 0;
    },
  });

  const { data: negocios } = useQuery({
    queryKey: ['portal-negocios'],
    queryFn: async () => {
      const { data } = await (supabase.from as any)('negocios').select('valor, status, comissao_valor');
      return data || [];
    },
  });

  const totalReceita = negocios?.filter((n: any) => n.status === 'fechado').reduce((sum: number, n: any) => sum + Number(n.valor), 0) || 0;
  const totalComissoes = negocios?.filter((n: any) => n.status === 'fechado').reduce((sum: number, n: any) => sum + Number(n.comissao_valor), 0) || 0;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-display font-bold text-foreground">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
            <CardTitle className="text-sm font-medium text-muted-foreground">Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{clientes ?? 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Comissões</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{formatCurrency(totalComissoes)}</div>
            <p className="text-xs text-muted-foreground">Receita total: {formatCurrency(totalReceita)}</p>
          </CardContent>
        </Card>
      </div>

      <ViewsAnalytics />
    </div>
  );
}
