import { useState, useEffect } from 'react';
import { useSiteConfig, useUpdateSiteConfig } from '@/hooks/use-site-config';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RichTextEditor } from '@/components/admin/RichTextEditor';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Save, ExternalLink } from 'lucide-react';

export default function SiteConfigPage() {
  const { data: config, isLoading } = useSiteConfig();
  const updateConfig = useUpdateSiteConfig();

  const [form, setForm] = useState({
    nome_imobiliaria: '',
    logo_url: '',
    favicon_url: '',
    endereco_texto: '',
    whatsapp: '',
    email: '',
    google_maps_url: '',
    politica_privacidade: '',
    termos_uso: '',
    politica_cookies: '',
  });

  useEffect(() => {
    if (config) {
      setForm({
        nome_imobiliaria: config.nome_imobiliaria || '',
        logo_url: config.logo_url || '',
        favicon_url: config.favicon_url || '',
        endereco_texto: config.endereco_texto || '',
        whatsapp: config.whatsapp || '',
        email: config.email || '',
        google_maps_url: config.google_maps_url || '',
        politica_privacidade: config.politica_privacidade || '',
        termos_uso: config.termos_uso || '',
        politica_cookies: config.politica_cookies || '',
      });
    }
  }, [config]);

  const handleSave = async () => {
    try {
      await updateConfig.mutateAsync(form);
      toast.success('Configurações salvas com sucesso!');
    } catch {
      toast.error('Erro ao salvar configurações');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-4xl">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold">Configurações do Site</h1>
        <div className="flex gap-2">
          <a href="/" target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm">
              <ExternalLink className="h-4 w-4 mr-2" /> Ver site
            </Button>
          </a>
          <Button onClick={handleSave} disabled={updateConfig.isPending} size="sm">
            <Save className="h-4 w-4 mr-2" />
            {updateConfig.isPending ? 'Salvando...' : 'Salvar alterações'}
          </Button>
        </div>
      </div>

      {/* Identity */}
      <Card>
        <CardHeader><CardTitle className="font-display">Identidade da Imobiliária</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Nome da imobiliária</Label>
            <Input value={form.nome_imobiliaria} onChange={e => setForm(p => ({ ...p, nome_imobiliaria: e.target.value }))} />
          </div>
          <div>
            <Label>URL do Logo</Label>
            <Input value={form.logo_url} onChange={e => setForm(p => ({ ...p, logo_url: e.target.value }))} placeholder="https://..." />
            <p className="text-xs text-muted-foreground mt-1">Se vazio, será usado o logo padrão do sistema.</p>
          </div>
          <div>
            <Label>URL do Favicon</Label>
            <Input value={form.favicon_url} onChange={e => setForm(p => ({ ...p, favicon_url: e.target.value }))} placeholder="https://..." />
          </div>
        </CardContent>
      </Card>

      {/* Contact */}
      <Card>
        <CardHeader><CardTitle className="font-display">Contato e Endereço</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Endereço completo</Label>
            <Textarea value={form.endereco_texto} onChange={e => setForm(p => ({ ...p, endereco_texto: e.target.value }))} rows={3} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>WhatsApp</Label>
              <Input value={form.whatsapp} onChange={e => setForm(p => ({ ...p, whatsapp: e.target.value }))} placeholder="5511999999999" />
            </div>
            <div>
              <Label>E-mail</Label>
              <Input value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} type="email" />
            </div>
          </div>
          <div>
            <Label>Link do Google Maps (opcional)</Label>
            <Input value={form.google_maps_url} onChange={e => setForm(p => ({ ...p, google_maps_url: e.target.value }))} placeholder="https://maps.google.com/..." />
          </div>
        </CardContent>
      </Card>

      {/* Legal Pages */}
      <Card>
        <CardHeader><CardTitle className="font-display">Páginas Legais</CardTitle></CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label className="mb-2 block">Política de Privacidade</Label>
            <RichTextEditor content={form.politica_privacidade} onChange={v => setForm(p => ({ ...p, politica_privacidade: v }))} />
          </div>
          <div>
            <Label className="mb-2 block">Termos de Uso</Label>
            <RichTextEditor content={form.termos_uso} onChange={v => setForm(p => ({ ...p, termos_uso: v }))} />
          </div>
          <div>
            <Label className="mb-2 block">Política de Cookies</Label>
            <RichTextEditor content={form.politica_cookies} onChange={v => setForm(p => ({ ...p, politica_cookies: v }))} />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={updateConfig.isPending}>
          <Save className="h-4 w-4 mr-2" />
          {updateConfig.isPending ? 'Salvando...' : 'Salvar alterações'}
        </Button>
      </div>
    </div>
  );
}
