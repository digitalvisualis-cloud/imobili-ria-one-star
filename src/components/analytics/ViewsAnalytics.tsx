import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Eye, TrendingUp, Users, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line } from 'recharts';
import { format, subDays, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function ViewsAnalytics() {
  const { data: views = [] } = useQuery({
    queryKey: ['analytics-views-all'],
    queryFn: async () => {
      const { data } = await supabase.from('imovel_views').select('imovel_id, created_at, viewer_hash');
      return data || [];
    },
  });

  const { data: topImoveis = [] } = useQuery({
    queryKey: ['analytics-top-imoveis'],
    queryFn: async () => {
      const { data: viewsData } = await supabase.from('imovel_views').select('imovel_id');
      if (!viewsData) return [];

      const counts: Record<string, number> = {};
      viewsData.forEach(v => {
        counts[v.imovel_id] = (counts[v.imovel_id] || 0) + 1;
      });

      const topIds = Object.entries(counts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([id]) => id);

      if (topIds.length === 0) return [];

      const { data: imoveisData } = await supabase
        .from('imoveis')
        .select('id, titulo, codigo_imovel, capa_url, bairro, cidade')
        .in('id', topIds);

      return topIds.map(id => {
        const imovel = imoveisData?.find(i => i.id === id);
        return {
          id,
          codigo: imovel?.codigo_imovel || id.slice(0, 8),
          titulo: imovel?.titulo || 'Desconhecido',
          bairro: imovel?.bairro || '',
          cidade: imovel?.cidade || '',
          capa_url: imovel?.capa_url || '',
          views: counts[id],
        };
      });
    },
  });

  // Views por dia (últimos 14 dias)
  const viewsByDay = (() => {
    const days: { date: string; label: string; views: number; unique: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const day = startOfDay(subDays(new Date(), i));
      const dayStr = format(day, 'yyyy-MM-dd');
      const dayViews = views.filter(v => format(new Date(v.created_at), 'yyyy-MM-dd') === dayStr);
      const uniqueViewers = new Set(dayViews.map(v => v.viewer_hash)).size;
      days.push({
        date: dayStr,
        label: format(day, 'dd/MM', { locale: ptBR }),
        views: dayViews.length,
        unique: uniqueViewers,
      });
    }
    return days;
  })();

  const totalViews = views.length;
  const uniqueVisitors = new Set(views.map(v => v.viewer_hash)).size;
  const todayViews = views.filter(v => format(new Date(v.created_at), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')).length;

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total de Visualizações</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{totalViews}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Visitantes Únicos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{uniqueVisitors}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Visualizações Hoje</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{todayViews}</div>
          </CardContent>
        </Card>
      </div>

      {/* Views por dia */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <TrendingUp className="h-5 w-5" />
            Acessos nos últimos 14 dias
          </CardTitle>
        </CardHeader>
        <CardContent>
          {viewsByDay.some(d => d.views > 0) ? (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={viewsByDay}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="label" className="text-xs fill-muted-foreground" />
                <YAxis className="text-xs fill-muted-foreground" allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '0.5rem' }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Line type="monotone" dataKey="views" stroke="hsl(var(--primary))" strokeWidth={2} name="Views" dot={{ r: 3 }} />
                <Line type="monotone" dataKey="unique" stroke="hsl(var(--accent-foreground))" strokeWidth={2} name="Únicos" dot={{ r: 3 }} strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-muted-foreground text-center py-8">Nenhuma visualização registrada nos últimos 14 dias.</p>
          )}
        </CardContent>
      </Card>

      {/* Top 10 imóveis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <TrendingUp className="h-5 w-5" />
            Top 10 — Imóveis mais acessados
          </CardTitle>
        </CardHeader>
        <CardContent>
          {topImoveis.length > 0 ? (
            <div className="space-y-6">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topImoveis}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="codigo" className="text-xs fill-muted-foreground" />
                  <YAxis className="text-xs fill-muted-foreground" allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '0.5rem' }}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                    formatter={(value: number, _: string, props: any) => [value, props.payload.titulo]}
                  />
                  <Bar dataKey="views" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Imóvel</TableHead>
                    <TableHead>Código</TableHead>
                    <TableHead>Localização</TableHead>
                    <TableHead className="text-right">Views</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topImoveis.map((item, i) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Badge variant={i < 3 ? 'default' : 'secondary'}>{i + 1}º</Badge>
                      </TableCell>
                      <TableCell className="font-medium max-w-[200px] truncate">{item.titulo}</TableCell>
                      <TableCell className="font-mono text-sm text-muted-foreground">{item.codigo}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {[item.bairro, item.cidade].filter(Boolean).join(', ') || '—'}
                      </TableCell>
                      <TableCell className="text-right font-bold">{item.views}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">Nenhuma visualização registrada ainda.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
