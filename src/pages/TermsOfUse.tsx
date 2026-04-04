import { useSiteConfig } from '@/hooks/use-site-config';
import { Skeleton } from '@/components/ui/skeleton';

export default function TermsOfUse() {
  const { data: config, isLoading } = useSiteConfig();

  if (isLoading) return <div className="container mx-auto px-4 py-12"><Skeleton className="h-96" /></div>;

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <h1 className="font-display text-4xl font-bold mb-8">Termos de Uso</h1>
      {config?.termos_uso ? (
        <div className="prose prose-sm max-w-none dark:prose-invert font-body" dangerouslySetInnerHTML={{ __html: config.termos_uso }} />
      ) : (
        <p className="text-muted-foreground">Conteúdo em breve.</p>
      )}
    </div>
  );
}
