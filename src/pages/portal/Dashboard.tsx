import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Eye, Users, DollarSign, TrendingUp } from 'lucide-react';
import { formatCurrency } from '@/lib/types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function Dashboard() {
  const { data: imoveis } = useQuery({
    queryKey: ['portal-imoveis-count'],
    queryFn: async () => {
      const { count } = await supabase.from('imoveis').select('*', { count: 'exact', head: true });
      return count || 0;
    },
  });

  const { data: views } = useQuery({
    queryKey: ['portal-views'],
    queryFn: async () => {
      const { data } = await supabase.from('imovel_views').select('imovel_id, created_at');
      return data || [];
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

  const { data: topImoveis } = useQuery({
    queryKey: ['portal-top-imoveis'],
    queryFn: async () => {
      const { data: viewsData } = await supabase.from('imovel_views').select('imovel_id');
      if (!viewsData) return [];

      const counts: Record<string, number> = {};
      viewsData.forEach(v => {
        counts[v.imovel_id] = (counts[v.imovel_id] || 0) + 1;
      });

      const topIds = Object.entries(counts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([id]) => id);

      if (topIds.length === 0) return [];

      const { data: imoveisData } = await supabase
        .from('imoveis')
        .select('id, titulo, codigo_imovel')
        .in('id', topIds);

      return topIds.map(id => {
        const imovel = imoveisData?.find(i => i.id === id);
        return {
          name: imovel?.codigo_imovel || id.slice(0, 8),
          titulo: imovel?.titulo || 'Desconhecido',
          views: counts[id],
        };
      });
    },
  });

  const totalReceita = negocios?.filter((n: any) => n.status === 'fechado').reduce((sum: number, n: any) => sum + Number(n.valor), 0) || 0;
  const totalComissoes = negocios?.filter((n: any) => n.status === 'fechado').reduce((sum: number, n: any) => sum + Number(n.comissao_valor), 0) || 0;

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
            <CardTitle className="text-sm font-medium text-muted-foreground">Visualizações</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{views?.length ?? 0}</div>
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

      {/* Top imóveis chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <TrendingUp className="h-5 w-5" />
            Imóveis mais visualizados
          </CardTitle>
        </CardHeader>
        <CardContent>
          {topImoveis && topImoveis.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topImoveis}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="name" className="text-xs fill-muted-foreground" />
                <YAxis className="text-xs fill-muted-foreground" />
                <Tooltip
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '0.5rem' }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                  formatter={(value: number, name: string, props: any) => [value, props.payload.titulo]}
                />
                <Bar dataKey="views" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-muted-foreground text-center py-8">Nenhuma visualização registrada ainda.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
