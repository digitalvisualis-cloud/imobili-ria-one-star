import { useState, useEffect } from 'react';
import { Plug, ExternalLink, CalendarDays, MessageSquare, Sparkles, Loader2, Save } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const STORAGE_KEYS = {
  zap: 'portal_zap_token',
  olx: 'portal_olx_token',
  vivareal: 'portal_vivalreal_token',
  whatsapp: 'whatsapp_number',
};

interface PortalCardProps {
  name: string;
  storageKey: string;
  icon: string;
}

function PortalCard({ name, storageKey, icon }: PortalCardProps) {
  const [token, setToken] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      setToken(stored);
      setSaved(true);
    }
  }, [storageKey]);

  const handleSave = () => {
    if (token.trim()) {
      localStorage.setItem(storageKey, token.trim());
      setSaved(true);
      toast.success(`${name} salvo com sucesso`);
    } else {
      localStorage.removeItem(storageKey);
      setSaved(false);
      toast.info(`${name} removido`);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{icon} {name}</CardTitle>
        <Badge variant={saved ? 'default' : 'secondary'}>
          {saved ? 'Conectado' : 'Não configurado'}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <Label>ID / Token de integração</Label>
          <Input
            value={token}
            onChange={e => setToken(e.target.value)}
            placeholder={`Cole o token do ${name}`}
          />
        </div>
        <div className="flex items-center justify-between">
          <Button size="sm" onClick={handleSave}>Salvar</Button>
          <a href="#" className="text-xs text-primary hover:underline flex items-center gap-1">
            Como conectar <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </CardContent>
    </Card>
  );
}

interface ListaProConfig {
  id?: string;
  ativo: boolean;
  webhook_url: string;
  webhook_secret: string;
  branding: {
    primary_color?: string;
    secondary_color?: string;
    accent_color?: string;
    font_display?: string;
    font_body?: string;
    logo_url?: string;
    agente_nome?: string;
    agente_telefone?: string;
    agente_email?: string;
  };
}

const emptyListaProConfig: ListaProConfig = {
  ativo: true,
  webhook_url: '',
  webhook_secret: '',
  branding: {},
};

function ListaProSection() {
  const [config, setConfig] = useState<ListaProConfig>(emptyListaProConfig);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase.functions.invoke('listapro-config', {
          method: 'GET' as any,
        });
        if (error) throw error;
        if ((data as any)?.config) {
          const c = (data as any).config;
          setConfig({
            id: c.id,
            ativo: c.ativo ?? true,
            webhook_url: c.webhook_url ?? '',
            webhook_secret: c.webhook_secret ?? '',
            branding: c.branding ?? {},
          });
        }
      } catch (e: any) {
        // first load: no row yet → keep empty
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const setBranding = (k: keyof NonNullable<ListaProConfig['branding']>, v: string) => {
    setConfig(p => ({ ...p, branding: { ...p.branding, [k]: v } }));
  };

  const handleSave = async () => {
    if (!config.webhook_url.trim() || !config.webhook_secret.trim()) {
      toast.error('Webhook URL e secret são obrigatórios');
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase.functions.invoke('listapro-config', {
        method: 'PUT' as any,
        body: {
          ativo: config.ativo,
          webhook_url: config.webhook_url.trim(),
          webhook_secret: config.webhook_secret.trim(),
          branding: config.branding,
        },
      });
      if (error) throw error;
      toast.success('ListaPro configurado');
    } catch (e: any) {
      toast.error(e?.message || 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

  const isConfigured = !!config.id && !!config.webhook_url;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" /> ListaPro / n8n + Claude
          </CardTitle>
          <Badge variant={isConfigured && config.ativo ? 'default' : 'secondary'}>
            {loading ? 'Carregando...' : isConfigured && config.ativo ? 'Ativo' : 'Não configurado'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Carregando configuração...
          </div>
        ) : (
          <>
            {/* Webhook */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-foreground">Webhook do n8n</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Webhook URL *</Label>
                  <Input
                    value={config.webhook_url}
                    onChange={e => setConfig(p => ({ ...p, webhook_url: e.target.value }))}
                    placeholder="https://n8n.exemplo.com/webhook/listapro"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Secret compartilhado *</Label>
                  <Input
                    type="password"
                    value={config.webhook_secret}
                    onChange={e => setConfig(p => ({ ...p, webhook_secret: e.target.value }))}
                    placeholder="Token enviado em X-ListaPro-Secret"
                  />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Switch
                  checked={config.ativo}
                  onCheckedChange={v => setConfig(p => ({ ...p, ativo: v }))}
                />
                <Label className="text-sm">Integração ativa</Label>
              </div>
            </div>

            {/* Branding */}
            <div className="space-y-3 pt-4 border-t border-border">
              <h4 className="text-sm font-semibold text-foreground">Branding (enviado ao Claude)</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Cor primária</Label>
                  <Input
                    value={config.branding.primary_color ?? ''}
                    onChange={e => setBranding('primary_color', e.target.value)}
                    placeholder="#C9A961"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Cor secundária</Label>
                  <Input
                    value={config.branding.secondary_color ?? ''}
                    onChange={e => setBranding('secondary_color', e.target.value)}
                    placeholder="#1A1A1A"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Cor de destaque</Label>
                  <Input
                    value={config.branding.accent_color ?? ''}
                    onChange={e => setBranding('accent_color', e.target.value)}
                    placeholder="#2D5A3D"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Fonte display</Label>
                  <Input
                    value={config.branding.font_display ?? ''}
                    onChange={e => setBranding('font_display', e.target.value)}
                    placeholder="Cormorant Garamond"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Fonte body</Label>
                  <Input
                    value={config.branding.font_body ?? ''}
                    onChange={e => setBranding('font_body', e.target.value)}
                    placeholder="Inter"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">URL do logo</Label>
                  <Input
                    value={config.branding.logo_url ?? ''}
                    onChange={e => setBranding('logo_url', e.target.value)}
                    placeholder="https://..."
                  />
                </div>
              </div>
            </div>

            {/* Agente padrão */}
            <div className="space-y-3 pt-4 border-t border-border">
              <h4 className="text-sm font-semibold text-foreground">Contato padrão do agente</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Nome</Label>
                  <Input
                    value={config.branding.agente_nome ?? ''}
                    onChange={e => setBranding('agente_nome', e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Telefone</Label>
                  <Input
                    value={config.branding.agente_telefone ?? ''}
                    onChange={e => setBranding('agente_telefone', e.target.value)}
                    placeholder="5511999999999"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">E-mail</Label>
                  <Input
                    type="email"
                    value={config.branding.agente_email ?? ''}
                    onChange={e => setBranding('agente_email', e.target.value)}
                  />
                </div>
              </div>
            </div>

            <Alert>
              <AlertDescription className="text-xs text-muted-foreground">
                O n8n recebe o payload em <code>POST {`{webhook_url}`}</code> com header
                <code> X-ListaPro-Secret</code> e devolve os assets em <code>POST {`{callback_url}`}</code>
                (também com o mesmo secret). PDF + post + story + copy retornam rápido; o Reels é
                gerado em separado e sobrescrito no job depois.
              </AlertDescription>
            </Alert>

            <div className="flex justify-end">
              <Button onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                {saving ? 'Salvando...' : 'Salvar configuração'}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default function Integracoes() {
  const [whatsapp, setWhatsapp] = useState('');
  const [whatsappSaved, setWhatsappSaved] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.whatsapp);
    if (stored) {
      setWhatsapp(stored);
      setWhatsappSaved(true);
    }
  }, []);

  const handleWhatsappSave = () => {
    if (whatsapp.trim()) {
      localStorage.setItem(STORAGE_KEYS.whatsapp, whatsapp.trim());
      setWhatsappSaved(true);
      toast.success('WhatsApp salvo');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <Plug className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-display font-bold text-foreground">Integrações</h1>
      </div>

      {/* ListaPro */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Geração de assets (ListaPro)</h2>
        <ListaProSection />
      </section>

      {/* Portais Imobiliários */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Portais Imobiliários</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <PortalCard name="ZAP Imóveis" storageKey={STORAGE_KEYS.zap} icon="🏠" />
          <PortalCard name="OLX" storageKey={STORAGE_KEYS.olx} icon="📦" />
          <PortalCard name="VivaReal" storageKey={STORAGE_KEYS.vivareal} icon="🏡" />
        </div>
      </section>

      {/* WhatsApp Business */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <MessageSquare className="h-5 w-5" /> WhatsApp Business
        </h2>
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Número do WhatsApp</Label>
                <Input
                  value={whatsapp}
                  onChange={e => setWhatsapp(e.target.value)}
                  placeholder="5511999999999"
                />
              </div>
              <div className="space-y-2">
                <Label>Status da automação</Label>
                <div className="pt-2">
                  <Badge variant={whatsappSaved ? 'default' : 'secondary'}>
                    {whatsappSaved ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button size="sm" onClick={handleWhatsappSave}>Salvar</Button>
              <Button size="sm" variant="outline" onClick={() => toast.info('Conexão testada com sucesso (simulação)')}>
                Testar conexão
              </Button>
            </div>
            <Alert>
              <AlertDescription className="text-xs text-muted-foreground">
                A automação do WhatsApp é gerenciada via n8n. Configure o webhook nas configurações do seu fluxo.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </section>

      {/* Google Calendar */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <CalendarDays className="h-5 w-5" /> Google Calendar
        </h2>
        <Card>
          <CardContent className="pt-6 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">Conectar sua agenda</p>
              <Badge variant="secondary">Não conectado</Badge>
            </div>
            <Button
              variant="outline"
              onClick={() => window.open('https://calendar.google.com', '_blank')}
            >
              <CalendarDays className="h-4 w-4 mr-2" />
              Conectar Google Calendar
              <ExternalLink className="h-3 w-3 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
