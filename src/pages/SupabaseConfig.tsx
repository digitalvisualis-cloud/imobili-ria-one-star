import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Database, Check, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const STORAGE_KEY_URL = 'supabase_custom_url';
const STORAGE_KEY_KEY = 'supabase_custom_key';

export default function SupabaseConfig() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [url, setUrl] = useState(localStorage.getItem(STORAGE_KEY_URL) || '');
  const [anonKey, setAnonKey] = useState(localStorage.getItem(STORAGE_KEY_KEY) || '');
  const [testing, setTesting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleTest = async () => {
    if (!url || !anonKey) {
      toast({ title: 'Preencha todos os campos', variant: 'destructive' });
      return;
    }
    
    setTesting(true);
    setStatus('idle');
    
    try {
      const res = await fetch(`${url}/rest/v1/`, {
        headers: {
          apikey: anonKey,
          Authorization: `Bearer ${anonKey}`,
        },
      });
      
      if (res.ok || res.status === 200) {
        setStatus('success');
        toast({ title: 'Conexão bem-sucedida!' });
      } else {
        setStatus('error');
        toast({ title: 'Falha na conexão', description: `Status: ${res.status}`, variant: 'destructive' });
      }
    } catch (err) {
      setStatus('error');
      toast({ title: 'Erro de conexão', description: 'Verifique a URL e tente novamente', variant: 'destructive' });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = () => {
    if (!url || !anonKey) {
      toast({ title: 'Preencha todos os campos', variant: 'destructive' });
      return;
    }
    
    localStorage.setItem(STORAGE_KEY_URL, url.replace(/\/$/, ''));
    localStorage.setItem(STORAGE_KEY_KEY, anonKey.trim());
    
    toast({ title: 'Credenciais salvas!', description: 'Recarregando aplicação...' });
    
    setTimeout(() => window.location.href = '/login', 1000);
  };

  const handleClear = () => {
    localStorage.removeItem(STORAGE_KEY_URL);
    localStorage.removeItem(STORAGE_KEY_KEY);
    setUrl('');
    setAnonKey('');
    setStatus('idle');
    toast({ title: 'Credenciais removidas', description: 'Usando configuração padrão.' });
    setTimeout(() => window.location.href = '/', 1000);
  };

  const hasCustomConfig = localStorage.getItem(STORAGE_KEY_URL) && localStorage.getItem(STORAGE_KEY_KEY);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Database className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-xl">Conectar Supabase</CardTitle>
          <CardDescription>
            Insira a URL do projeto e a Anon Key para conectar ao seu Supabase externo.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="url">Project URL</Label>
            <Input
              id="url"
              placeholder="https://xxxx.supabase.co"
              value={url}
              onChange={(e) => { setUrl(e.target.value); setStatus('idle'); }}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="key">Anon Public Key</Label>
            <Input
              id="key"
              placeholder="eyJhbGciOiJIUzI1NiIs..."
              value={anonKey}
              onChange={(e) => { setAnonKey(e.target.value); setStatus('idle'); }}
            />
          </div>

          {status === 'success' && (
            <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
              <Check className="h-4 w-4" /> Conexão verificada com sucesso
            </div>
          )}
          {status === 'error' && (
            <div className="flex items-center gap-2 text-sm text-destructive">
              <AlertTriangle className="h-4 w-4" /> Falha na conexão
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button onClick={handleTest} variant="outline" className="flex-1" disabled={testing}>
              {testing ? 'Testando...' : 'Testar Conexão'}
            </Button>
            <Button onClick={handleSave} className="flex-1">
              Salvar e Conectar
            </Button>
          </div>

          {hasCustomConfig && (
            <Button onClick={handleClear} variant="ghost" className="w-full text-muted-foreground">
              Remover configuração customizada
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
