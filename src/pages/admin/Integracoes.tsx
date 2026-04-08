import { useState, useEffect } from 'react';
import { Plug, ExternalLink, CalendarDays, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';

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
        <h1 className="text-2xl font-display font-bold text-foreground">Integrações de Portais</h1>
      </div>

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
