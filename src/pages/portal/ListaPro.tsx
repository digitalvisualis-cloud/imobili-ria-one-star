import { useState } from 'react';
import { Wand2, Copy, Check, Loader2, Sparkles, RefreshCw, FileDown, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import ImageUpload from '@/components/admin/ImageUpload';
import { generateListingPdf } from '@/lib/listing-pdf';
import { ListaProTrigger } from '@/components/listapro/ListaProTrigger';
import { ImageSelector } from '@/components/listapro/ImageSelector';
import { useAllImoveis } from '@/hooks/use-imoveis';
import type { Imovel } from '@/lib/types';

const TIPOS = ['Casa', 'Apartamento', 'Terreno', 'Cobertura', 'Sobrado', 'Chácara', 'Sítio', 'Comercial'];
const OPERACOES = ['Venda', 'Aluguel', 'Venda e Aluguel'];
const AMENIDADES_LIST = [
  'Piscina', 'Churrasqueira', 'Portaria 24h', 'Academia', 'Salão de festas',
  'Playground', 'Quadra esportiva', 'Garagem coberta',
  'Elevador', 'Área de lazer', 'Pet friendly', 'Vista panorâmica',
  'Sacada', 'Jardim', 'Espaço gourmet', 'Sauna',
];

interface FormState {
  tipo: string;
  operacao: string;
  endereco: string;
  cidade: string;
  estado: string;
  preco: string;
  quartos: string;
  banheiros: string;
  metros_construidos: string;
  metros_terreno: string;
  vagas: string;
  amenidades: string[];
  destaque_agente: string;
  agente_nome: string;
  agente_telefone: string;
  agente_email: string;
  imagens: string[];
}

const initialForm: FormState = {
  tipo: 'Casa',
  operacao: 'Venda',
  endereco: '',
  cidade: '',
  estado: '',
  preco: '',
  quartos: '',
  banheiros: '',
  metros_construidos: '',
  metros_terreno: '',
  vagas: '',
  amenidades: [],
  destaque_agente: '',
  agente_nome: '',
  agente_telefone: '',
  agente_email: '',
  imagens: [],
};

const TIPO_DB_TO_LABEL: Record<string, string> = {
  apartamento: 'Apartamento', casa: 'Casa', chacara: 'Chácara',
  sitio: 'Sítio', terreno: 'Terreno', comercial: 'Comercial',
};

export default function ListaPro() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ descricao: string; instagram: string } | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [selectedImovelId, setSelectedImovelId] = useState<string>('');
  /** Fotos disponíveis no imóvel cadastrado (capa + imagens) */
  const [availableImages, setAvailableImages] = useState<string[]>([]);

  const { data: imoveis = [], isLoading: loadingImoveis } = useAllImoveis();

  const importFromImovel = (id: string) => {
    setSelectedImovelId(id);
    if (!id) {
      setAvailableImages([]);
      return;
    }
    const im = imoveis.find((x: Imovel) => x.id === id);
    if (!im) return;
    // Junta capa + imagens, removendo duplicatas e vazios
    const allImgs = Array.from(
      new Set(
        [im.capa_url, ...(Array.isArray(im.imagens) ? im.imagens : [])]
          .filter((u): u is string => typeof u === 'string' && u.length > 0)
      )
    );
    setAvailableImages(allImgs);
    setForm(p => ({
      ...p,
      tipo: TIPO_DB_TO_LABEL[im.tipo] ?? p.tipo,
      operacao: im.finalidade === 'aluguel' ? 'Aluguel' : 'Venda',
      endereco: im.bairro ?? p.endereco,
      cidade: im.cidade ?? '',
      estado: im.estado ?? '',
      preco: im.preco ? String(im.preco) : '',
      quartos: im.quartos != null ? String(im.quartos) : '',
      banheiros: im.banheiros != null ? String(im.banheiros) : '',
      metros_construidos: im.area_m2 != null ? String(im.area_m2) : '',
      vagas: im.vagas != null ? String(im.vagas) : '',
      destaque_agente: im.descricao ?? p.destaque_agente,
      imagens: allImgs, // todas selecionadas por padrão
    }));
    toast.success(`Imóvel "${im.titulo}" carregado · ${allImgs.length} foto(s)`);
  };

  const clearSelection = () => {
    setSelectedImovelId('');
    setAvailableImages([]);
    setForm(initialForm);
  };

  const downloadPdf = async () => {
    if (!result) return;
    setPdfLoading(true);
    try {
      await generateListingPdf({
        tipo: form.tipo,
        operacao: form.operacao,
        endereco: form.endereco,
        cidade: form.cidade,
        estado: form.estado,
        preco: Number(form.preco) || 0,
        quartos: Number(form.quartos) || 0,
        banheiros: Number(form.banheiros) || 0,
        metros_construidos: Number(form.metros_construidos) || 0,
        metros_terreno: Number(form.metros_terreno) || 0,
        vagas: Number(form.vagas) || 0,
        amenidades: form.amenidades,
        descricao: result.descricao,
        agente_nome: form.agente_nome,
        agente_telefone: form.agente_telefone,
        agente_email: form.agente_email,
        imagens: form.imagens,
      });
      toast.success('PDF gerado');
    } catch (e: any) {
      toast.error(e?.message || 'Erro ao gerar PDF');
    } finally {
      setPdfLoading(false);
    }
  };

  const setField = <K extends keyof FormState>(k: K, v: FormState[K]) => setForm(p => ({ ...p, [k]: v }));

  const toggleAmenidad = (a: string) => {
    setForm(p => ({
      ...p,
      amenidades: p.amenidades.includes(a) ? p.amenidades.filter(x => x !== a) : [...p.amenidades, a],
    }));
  };

  const generate = async () => {
    if (!form.tipo || !form.operacao || !form.cidade || !form.preco) {
      toast.error('Preencha pelo menos tipo, finalidade, cidade e preço');
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const { data, error } = await supabase.functions.invoke('generate-listing', {
        body: {
          tipo: form.tipo,
          operacao: form.operacao,
          endereco: form.endereco,
          cidade: form.cidade,
          estado: form.estado,
          preco: Number(form.preco) || 0,
          quartos: Number(form.quartos) || 0,
          banheiros: Number(form.banheiros) || 0,
          metros_construidos: Number(form.metros_construidos) || 0,
          metros_terreno: Number(form.metros_terreno) || 0,
          vagas: Number(form.vagas) || 0,
          amenidades: form.amenidades,
          destaque_agente: form.destaque_agente,
          agente_nome: form.agente_nome,
          agente_telefone: form.agente_telefone,
          agente_email: form.agente_email,
        },
      });

      if (error) {
        const msg = (error as any)?.message || 'Erro ao gerar conteúdo';
        if (msg.includes('429')) toast.error('Limite de uso excedido. Tente mais tarde.');
        else if (msg.includes('402')) toast.error('Créditos de IA esgotados.');
        else toast.error(msg);
        return;
      }
      if ((data as any)?.error) {
        toast.error((data as any).error);
        return;
      }
      setResult(data as any);
      toast.success('Conteúdo gerado com IA');
    } catch (e: any) {
      toast.error(e?.message || 'Erro inesperado');
    } finally {
      setLoading(false);
    }
  };

  const copy = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    toast.success('Copiado para a área de transferência');
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Wand2 className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-display font-semibold">ListaPro</h1>
          <p className="text-sm text-muted-foreground">Gerador de conteúdo profissional com IA para seus imóveis</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Building2 className="h-4 w-4 text-primary" /> Carregar imóvel cadastrado
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Selecione um imóvel da sua base para preencher os campos automaticamente, ou pule para cadastrar manualmente abaixo.
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            <Select value={selectedImovelId} onValueChange={importFromImovel} disabled={loadingImoveis}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder={loadingImoveis ? 'Carregando imóveis...' : 'Escolher imóvel...'} />
              </SelectTrigger>
              <SelectContent>
                {imoveis.map(im => (
                  <SelectItem key={im.id} value={im.id}>
                    {im.codigo_imovel} — {im.titulo}{im.bairro ? ` · ${im.bairro}` : ''}
                  </SelectItem>
                ))}
                {!imoveis.length && !loadingImoveis && (
                  <div className="px-3 py-2 text-sm text-muted-foreground">Nenhum imóvel cadastrado</div>
                )}
              </SelectContent>
            </Select>
            {selectedImovelId && (
              <Button variant="outline" onClick={clearSelection}>Limpar</Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Dados do imóvel</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Tipo & Operação */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Tipo de imóvel *</Label>
              <Select value={form.tipo} onValueChange={v => setField('tipo', v)}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>{TIPOS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Finalidade *</Label>
              <Select value={form.operacao} onValueChange={v => setField('operacao', v)}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>{OPERACOES.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>

          {/* Localização */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-3">
              <Label>Endereço / Localização</Label>
              <Input className="mt-1.5" value={form.endereco} onChange={e => setField('endereco', e.target.value)} placeholder="Rua, número, bairro" />
            </div>
            <div>
              <Label>Cidade *</Label>
              <Input className="mt-1.5" value={form.cidade} onChange={e => setField('cidade', e.target.value)} placeholder="Ex: São Paulo" />
            </div>
            <div>
              <Label>Estado</Label>
              <Input className="mt-1.5" value={form.estado} onChange={e => setField('estado', e.target.value)} placeholder="Ex: SP" />
            </div>
            <div>
              <Label>Preço (R$) *</Label>
              <Input className="mt-1.5" type="number" value={form.preco} onChange={e => setField('preco', e.target.value)} placeholder="850000" />
            </div>
          </div>

          {/* Características */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <Label>Quartos</Label>
              <Input className="mt-1.5" type="number" value={form.quartos} onChange={e => setField('quartos', e.target.value)} />
            </div>
            <div>
              <Label>Banheiros</Label>
              <Input className="mt-1.5" type="number" value={form.banheiros} onChange={e => setField('banheiros', e.target.value)} />
            </div>
            <div>
              <Label>m² construídos</Label>
              <Input className="mt-1.5" type="number" value={form.metros_construidos} onChange={e => setField('metros_construidos', e.target.value)} />
            </div>
            <div>
              <Label>m² terreno</Label>
              <Input className="mt-1.5" type="number" value={form.metros_terreno} onChange={e => setField('metros_terreno', e.target.value)} />
            </div>
            <div>
              <Label>Vagas</Label>
              <Input className="mt-1.5" type="number" value={form.vagas} onChange={e => setField('vagas', e.target.value)} />
            </div>
          </div>

          {/* Diferenciais */}
          <div>
            <Label>Diferenciais</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
              {AMENIDADES_LIST.map(a => (
                <label key={a} className="flex items-center gap-2 text-sm cursor-pointer p-2 rounded hover:bg-accent">
                  <Checkbox checked={form.amenidades.includes(a)} onCheckedChange={() => toggleAmenidad(a)} />
                  {a}
                </label>
              ))}
            </div>
          </div>

          {/* Destaque do corretor */}
          <div>
            <Label>O que você destaca (2-3 linhas)</Label>
            <Textarea
              className="mt-1.5"
              rows={3}
              value={form.destaque_agente}
              onChange={e => setField('destaque_agente', e.target.value)}
              placeholder="Ex: Casa reformada em bairro tranquilo, próxima a escolas e shopping..."
            />
          </div>

          {/* Fotos */}
          <ImageUpload
            images={form.imagens}
            onImagesChange={imgs => setField('imagens', imgs)}
            folder="listapro"
            maxFiles={15}
            label="Fotos do imóvel (a primeira será a capa)"
          />

          {/* Dados do corretor */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-border">
            <div>
              <Label>Nome do corretor</Label>
              <Input className="mt-1.5" value={form.agente_nome} onChange={e => setField('agente_nome', e.target.value)} />
            </div>
            <div>
              <Label>Telefone</Label>
              <Input className="mt-1.5" value={form.agente_telefone} onChange={e => setField('agente_telefone', e.target.value)} />
            </div>
            <div>
              <Label>E-mail</Label>
              <Input className="mt-1.5" type="email" value={form.agente_email} onChange={e => setField('agente_email', e.target.value)} />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button onClick={generate} disabled={loading} size="lg" className="gap-2">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {loading ? 'Gerando...' : 'Gerar conteúdo com IA'}
            </Button>
            {result && (
              <Button variant="outline" onClick={generate} disabled={loading} className="gap-2">
                <RefreshCw className="h-4 w-4" /> Gerar novamente
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ListaPro pacote completo via Claude/n8n */}
      <ListaProTrigger
        imovelId={selectedImovelId || null}
        dadosManuais={selectedImovelId ? null : {
          tipo: form.tipo,
          operacao: form.operacao,
          endereco: form.endereco,
          cidade: form.cidade,
          estado: form.estado,
          preco: Number(form.preco) || 0,
          quartos: Number(form.quartos) || 0,
          banheiros: Number(form.banheiros) || 0,
          metros_construidos: Number(form.metros_construidos) || 0,
          metros_terreno: Number(form.metros_terreno) || 0,
          vagas: Number(form.vagas) || 0,
          amenidades: form.amenidades,
          destaque_agente: form.destaque_agente,
          agente_nome: form.agente_nome,
          agente_telefone: form.agente_telefone,
          agente_email: form.agente_email,
          imagens: form.imagens,
        }}
      />

      {result && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={downloadPdf} disabled={pdfLoading} size="lg" className="gap-2">
              {pdfLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
              {pdfLoading ? 'Gerando PDF...' : 'Baixar PDF'}
            </Button>
          </div>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Descrição profissional</CardTitle>
              <Button size="sm" variant="outline" onClick={() => copy(result.descricao, 'desc')} className="gap-2">
                {copied === 'desc' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                Copiar
              </Button>
            </CardHeader>
            <CardContent>
              <div className="whitespace-pre-wrap text-sm leading-relaxed">{result.descricao}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Copy para Instagram</CardTitle>
              <Button size="sm" variant="outline" onClick={() => copy(result.instagram, 'ig')} className="gap-2">
                {copied === 'ig' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                Copiar
              </Button>
            </CardHeader>
            <CardContent>
              <div className="whitespace-pre-wrap text-sm leading-relaxed font-mono bg-muted/30 p-4 rounded-md">
                {result.instagram}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
