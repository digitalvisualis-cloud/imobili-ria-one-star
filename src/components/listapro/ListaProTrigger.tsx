import { useEffect, useState } from 'react';
import { Loader2, Sparkles, FileText, Image as ImageIcon, Film, Type, Settings2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

type AssetKey = 'pdf' | 'post' | 'story' | 'reels' | 'copy';

const ASSETS: { key: AssetKey; label: string; icon: any; slow?: boolean }[] = [
  { key: 'pdf', label: 'PDF da ficha', icon: FileText },
  { key: 'post', label: 'Post Instagram (1080×1080)', icon: ImageIcon },
  { key: 'story', label: 'Story (1080×1920)', icon: ImageIcon },
  { key: 'copy', label: 'Copy + hashtags', icon: Type },
  { key: 'reels', label: 'Reels vídeo (1080×1920)', icon: Film, slow: true },
];

interface Props {
  imovelId?: string | null;
  dadosManuais?: Record<string, any> | null;
  /** Ocultar quando o imóvel ainda não foi salvo */
  disabled?: boolean;
}

interface JobResult {
  pdf_url?: string;
  post_url?: string;
  story_url?: string;
  reels_url?: string;
  copy?: { instagram?: string; descricao?: string };
  [k: string]: any;
}

export function ListaProTrigger({ imovelId, dadosManuais, disabled }: Props) {
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [selected, setSelected] = useState<Record<AssetKey, boolean>>({
    pdf: true, post: true, story: true, copy: true, reels: false,
  });

  const [jobId, setJobId] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [resultado, setResultado] = useState<JobResult | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [running, setRunning] = useState(false);

  // Polling
  useEffect(() => {
    if (!jobId || status === 'done' || status === 'error') return;
    const interval = setInterval(async () => {
      try {
        const { data, error } = await supabase.functions.invoke('listapro-job-status', {
          method: 'GET' as any,
          body: undefined,
          // pass via query: invoke não suporta query, então usamos fetch direto
        } as any);
        // fallback: usar fetch direto
        if (error || !data) {
          const session = await supabase.auth.getSession();
          const token = session.data.session?.access_token;
          const url = `${(supabase as any).functionsUrl || 'https://mlyeqkkcqfsivqhuoedm.supabase.co/functions/v1'}/listapro-job-status?job_id=${jobId}`;
          const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
          const j = await res.json();
          if (j.job) {
            setStatus(j.job.status);
            if (j.job.resultado) setResultado(j.job.resultado);
            if (j.job.erro) setErro(j.job.erro);
            if (j.job.status === 'done' || j.job.status === 'error') setRunning(false);
          }
        }
      } catch { /* ignore */ }
    }, 3000);
    return () => clearInterval(interval);
  }, [jobId, status]);

  const trigger = async (mode: 'completo' | 'avancado') => {
    if (disabled) {
      toast.error('Salve o imóvel antes de gerar os assets');
      return;
    }
    setRunning(true);
    setStatus('queued');
    setResultado(null);
    setErro(null);
    setJobId(null);

    const assets = mode === 'completo'
      ? ['pdf', 'post', 'story', 'copy', 'reels']
      : (Object.keys(selected) as AssetKey[]).filter(k => selected[k]);

    try {
      const { data, error } = await supabase.functions.invoke('listapro-trigger', {
        body: {
          imovel_id: imovelId ?? null,
          dados: dadosManuais ?? null,
          pacote: mode,
          assets,
        },
      });
      if (error) throw error;
      const d = data as any;
      if (d?.error) throw new Error(d.error);
      setJobId(d.job_id);
      setStatus(d.status ?? 'running');
      toast.success('Geração iniciada');
      setAdvancedOpen(false);
    } catch (e: any) {
      setRunning(false);
      setStatus('error');
      setErro(e?.message || 'Erro');
      toast.error(e?.message || 'Erro ao iniciar geração');
    }
  };

  const reelsPending = jobId && status !== 'error' && !resultado?.reels_url;

  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="space-y-1">
            <h3 className="font-display text-lg font-semibold flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" /> Gerar com ListaPro
            </h3>
            <p className="text-sm text-muted-foreground">
              PDF, post, story, copy e Reels gerados pela skill do Claude via n8n.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => trigger('completo')} disabled={running || !!disabled}>
              {running ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
              Pacote completo
            </Button>
            <Button variant="outline" onClick={() => setAdvancedOpen(true)} disabled={running || !!disabled}>
              <Settings2 className="h-4 w-4 mr-2" />
              Avançado
            </Button>
          </div>
        </div>

        {/* Status */}
        {jobId && (
          <div className="space-y-3 pt-3 border-t border-border">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Status:</span>
              <Badge variant={status === 'done' ? 'default' : status === 'error' ? 'destructive' : 'secondary'}>
                {status}
              </Badge>
              {(status === 'running' || status === 'queued') && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
            </div>

            {erro && <p className="text-sm text-destructive">{erro}</p>}

            {resultado && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {resultado.pdf_url && <AssetButton url={resultado.pdf_url} label="PDF" />}
                {resultado.post_url && <AssetButton url={resultado.post_url} label="Post" />}
                {resultado.story_url && <AssetButton url={resultado.story_url} label="Story" />}
                {resultado.reels_url && <AssetButton url={resultado.reels_url} label="Reels" />}
                {resultado.copy?.instagram && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(resultado.copy!.instagram!);
                      toast.success('Copy copiada');
                    }}
                  >
                    <Type className="h-4 w-4 mr-2" /> Copiar legenda
                  </Button>
                )}
              </div>
            )}

            {reelsPending && status !== 'error' && (
              <p className="text-xs text-muted-foreground flex items-center gap-2">
                <Loader2 className="h-3 w-3 animate-spin" />
                Reels em renderização (~45s). Os outros assets já estão prontos.
              </p>
            )}
          </div>
        )}
      </CardContent>

      {/* Avançado */}
      <Dialog open={advancedOpen} onOpenChange={setAdvancedOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Selecionar assets</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            {ASSETS.map(a => (
              <label key={a.key} className="flex items-center justify-between gap-3 p-3 rounded-md hover:bg-accent cursor-pointer border border-border">
                <span className="flex items-center gap-2 text-sm">
                  <a.icon className="h-4 w-4 text-muted-foreground" />
                  {a.label}
                  {a.slow && <Badge variant="secondary" className="text-xs">~45s</Badge>}
                </span>
                <Checkbox
                  checked={selected[a.key]}
                  onCheckedChange={v => setSelected(p => ({ ...p, [a.key]: !!v }))}
                />
              </label>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAdvancedOpen(false)}>Cancelar</Button>
            <Button onClick={() => trigger('avancado')} disabled={running}>
              <Sparkles className="h-4 w-4 mr-2" /> Gerar selecionados
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

function AssetButton({ url, label }: { url: string; label: string }) {
  return (
    <Button variant="outline" size="sm" asChild>
      <a href={url} target="_blank" rel="noopener noreferrer" download>
        <Download className="h-4 w-4 mr-2" />
        {label}
      </a>
    </Button>
  );
}
