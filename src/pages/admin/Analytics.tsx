import ViewsAnalytics from '@/components/analytics/ViewsAnalytics';

export default function AdminAnalytics() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Analytics de Acessos</h1>
        <p className="text-muted-foreground text-sm">Performance de visualizações do site e imóveis</p>
      </div>
      <ViewsAnalytics />
    </div>
  );
}
