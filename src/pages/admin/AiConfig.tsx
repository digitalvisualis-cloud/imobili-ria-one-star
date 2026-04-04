import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Save } from 'lucide-react';
import { useState, useEffect } from 'react';

const geminiModels = [
  { value: 'google/gemini-2.5-flash', label: '⚡ Gemini 2.5 Flash (Recomendado)', highlight: true },
  { value: 'google/gemini-2.5-flash-lite', label: 'Gemini 2.5 Flash Lite' },
  { value: 'google/gemini-2.5-pro', label: 'Gemini 2.5 Pro' },
  { value: 'google/gemini-3-flash-preview', label: 'Gemini 3 Flash Preview' },
  { value: 'google/gemini-3.1-pro-preview', label: 'Gemini 3.1 Pro Preview' },
];

const openaiModels = [
  { value: 'gpt-4o-mini', label: '⚡ GPT-4o Mini (Recomendado)', highlight: true },
  { value: 'gpt-4o', label: 'GPT-4o' },
  { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
  { value: 'gpt-5-mini', label: 'GPT-5 Mini' },
  { value: 'gpt-5-nano', label: 'GPT-5 Nano' },
  { value: 'gpt-5', label: 'GPT-5' },
  { value: 'gpt-5.2', label: 'GPT-5.2' },
];

export default function AiConfig() {
  const queryClient = useQueryClient();
  const [provider, setProvider] = useState('gemini');
  const [model, setModel] = useState('google/gemini-2.5-flash');
  const [apiKey, setApiKey] = useState('');
  const [maxTokens, setMaxTokens] = useState('1024');
  const [defaultMode, setDefaultMode] = useState('enxuto');

  const { data: config, isLoading } = useQuery({
    queryKey: ['ai-config'],
    queryFn: async () => {
      const { data } = await supabase.from('ai_config').select('*').limit(1).single();
      return data;
    },
  });

  useEffect(() => {
    if (config) {
      setProvider(config.provider);
      setModel(config.model);
      setApiKey(config.api_key_encrypted || '');
      setMaxTokens(String(config.max_tokens || 1024));
      setDefaultMode(config.default_mode);
    }
  }, [config]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (config?.id) {
        await supabase.from('ai_config').update({
          provider,
          model,
          api_key_encrypted: apiKey || null,
          max_tokens: parseInt(maxTokens) || 1024,
          default_mode: defaultMode,
        }).eq('id', config.id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-config'] });
      toast.success('Configurações de IA salvas!');
    },
  });

  const models = provider === 'gemini' ? geminiModels : openaiModels;

  const handleProviderChange = (v: string) => {
    setProvider(v);
    setModel(v === 'gemini' ? 'google/gemini-2.5-flash' : 'gpt-4o-mini');
  };

  if (isLoading) return <div className="text-muted-foreground">Carregando...</div>;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Configurações de IA</h1>
        <p className="text-muted-foreground text-sm">Configure o provedor e modelo para a busca inteligente</p>
      </div>

      <div className="space-y-4 border rounded-lg p-6">
        <div className="space-y-2">
          <Label>Provedor</Label>
          <Select value={provider} onValueChange={handleProviderChange}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="gemini">Google Gemini</SelectItem>
              <SelectItem value="openai">OpenAI</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Modelo</Label>
          <Select value={model} onValueChange={setModel}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {models.map(m => (
                <SelectItem key={m.value} value={m.value}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Chave da API externa (opcional)</Label>
          <Input type="password" placeholder="Deixe vazio para usar Lovable AI" value={apiKey} onChange={e => setApiKey(e.target.value)} />
          <p className="text-xs text-muted-foreground">Informe sua chave da API do provedor selecionado (OpenAI ou Google). Sem a chave, a busca IA não funcionará.</p>
        </div>

        <div className="space-y-2">
          <Label>Limite de tokens</Label>
          <Input type="number" value={maxTokens} onChange={e => setMaxTokens(e.target.value)} />
        </div>

        <div className="space-y-2">
          <Label>Modo padrão de resposta</Label>
          <Select value={defaultMode} onValueChange={setDefaultMode}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="enxuto">Enxuto (campos básicos)</SelectItem>
              <SelectItem value="detalhado">Detalhado (todos os campos)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} className="w-full">
          <Save className="h-4 w-4 mr-2" /> Salvar configurações
        </Button>
      </div>
    </div>
  );
}
