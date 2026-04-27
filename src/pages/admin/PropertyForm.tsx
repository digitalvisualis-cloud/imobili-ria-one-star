import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useImovel, useCreateImovel, useUpdateImovel } from '@/hooks/use-imoveis';
import { generatePropertyCode, TIPO_LABELS, FINALIDADE_LABELS, TipoImovel, FinalidadeImovel } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { ArrowLeft, Save, Building2, MapPin, Camera, Film, Eye, Sparkles } from 'lucide-react';
import ImageUpload from '@/components/admin/ImageUpload';
import VideoUpload from '@/components/admin/VideoUpload';
import { ListaProTrigger } from '@/components/listapro/ListaProTrigger';

const AMENIDADES_LIST = [
  'Piscina', 'Churrasqueira', 'Portaria 24h', 'Academia', 'Salão de festas',
  'Playground', 'Quadra esportiva', 'Garagem coberta',
  'Elevador', 'Área de lazer', 'Pet friendly', 'Vista panorâmica',
  'Sacada', 'Jardim', 'Espaço gourmet', 'Sauna',
  'Quintal', 'Mobiliado', 'Sem mobilia', 'Varanda gourmet',
];

export default function PropertyFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = id && id !== 'novo';
  const navigate = useNavigate();
  const { data: existing, isLoading } = useImovel(isEdit ? id : '');
  const createImovel = useCreateImovel();
  const updateImovel = useUpdateImovel();

  const [form, setForm] = useState({
    codigo_imovel: generatePropertyCode(),
    titulo: '',
    descricao: '',
    tipo: 'apartamento' as TipoImovel,
    finalidade: 'venda' as FinalidadeImovel,
    preco: 0,
    quartos: 0,
    banheiros: 0,
    vagas: 0,
    area_m2: 0,
    bairro: '',
    cidade: '',
    estado: 'SP',
    capa_url: '',
    mapa_url: '',
    video_url: '',
    imagens: [] as string[],
    destaque: false,
    publicado: true,
  });

  const [amenidades, setAmenidades] = useState<string[]>([]);

  useEffect(() => {
    if (existing) {
      setForm({
        codigo_imovel: existing.codigo_imovel,
        titulo: existing.titulo,
        descricao: existing.descricao || '',
        tipo: existing.tipo,
        finalidade: existing.finalidade,
        preco: existing.preco,
        quartos: existing.quartos,
        banheiros: existing.banheiros,
        vagas: existing.vagas,
        area_m2: existing.area_m2,
        bairro: existing.bairro || '',
        cidade: existing.cidade || '',
        estado: existing.estado || 'SP',
        capa_url: existing.capa_url || '',
        mapa_url: (existing as any).mapa_url || '',
        video_url: (existing as any).video_url || '',
        imagens: existing.imagens || [],
        destaque: existing.destaque,
        publicado: existing.publicado,
      });
      // Recupera amenidades marcadas a partir da descrição (se foram adicionadas anteriormente)
      const desc = existing.descricao || '';
      setAmenidades(AMENIDADES_LIST.filter(a => desc.includes(a)));
    }
  }, [existing]);

  const toggleAmenidad = (a: string) => {
    setAmenidades(prev => (prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a]));
  };

  const inserirAmenidadesNaDescricao = () => {
    if (!amenidades.length) {
      toast.error('Marque pelo menos um diferencial');
      return;
    }
    const bloco = `\n\nDiferenciais: ${amenidades.join(' · ')}.`;
    setForm(p => ({
      ...p,
      descricao: (p.descricao || '').replace(/\n\nDiferenciais:.*$/s, '') + bloco,
    }));
    toast.success('Diferenciais inseridos na descrição');
  };

  const handleSave = async () => {
    if (!form.titulo.trim()) {
      toast.error('O título é obrigatório');
      return;
    }
    if (form.preco <= 0) {
      toast.error('O preço deve ser maior que zero');
      return;
    }

    const dataToSave = {
      ...form,
      capa_url: form.capa_url || form.imagens[0] || '',
    };

    try {
      if (isEdit) {
        await updateImovel.mutateAsync({ id, ...dataToSave } as any);
        toast.success('Imóvel atualizado com sucesso!');
      } else {
        await createImovel.mutateAsync(dataToSave as any);
        toast.success('Imóvel criado com sucesso!');
      }
      navigate('/admin/imoveis');
    } catch (err: any) {
      toast.error(err?.message || 'Erro ao salvar imóvel');
    }
  };

  if (isEdit && isLoading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin/imoveis')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Building2 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-semibold">
              {isEdit ? 'Editar Imóvel' : 'Novo Imóvel'}
            </h1>
            <p className="text-sm text-muted-foreground">
              Código <span className="font-mono font-semibold text-primary">{form.codigo_imovel}</span>
            </p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={createImovel.isPending || updateImovel.isPending} size="lg">
          <Save className="h-4 w-4 mr-2" />
          {(createImovel.isPending || updateImovel.isPending) ? 'Salvando...' : 'Salvar imóvel'}
        </Button>
      </div>

      {/* Informações principais */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Building2 className="h-4 w-4 text-primary" /> Informações principais
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Título *</Label>
            <Input
              className="mt-1.5"
              value={form.titulo}
              onChange={e => setForm(p => ({ ...p, titulo: e.target.value }))}
              placeholder="Ex: Apartamento moderno no centro com 3 suítes"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Tipo *</Label>
              <Select value={form.tipo} onValueChange={(v: TipoImovel) => setForm(p => ({ ...p, tipo: v }))}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(TIPO_LABELS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Finalidade *</Label>
              <Select value={form.finalidade} onValueChange={(v: FinalidadeImovel) => setForm(p => ({ ...p, finalidade: v }))}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(FINALIDADE_LABELS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Preço (R$) *</Label>
              <Input
                className="mt-1.5"
                type="number"
                min={0}
                value={form.preco}
                onChange={e => setForm(p => ({ ...p, preco: Number(e.target.value) }))}
                placeholder="850000"
              />
            </div>
          </div>

          <div>
            <Label>Descrição</Label>
            <Textarea
              className="mt-1.5"
              value={form.descricao}
              onChange={e => setForm(p => ({ ...p, descricao: e.target.value }))}
              rows={5}
              placeholder="Descreva o imóvel: localização, diferenciais, estado de conservação..."
            />
          </div>
        </CardContent>
      </Card>

      {/* Detalhes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Características</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <Label>Quartos</Label>
              <Input className="mt-1.5" type="number" min={0} value={form.quartos} onChange={e => setForm(p => ({ ...p, quartos: Number(e.target.value) }))} />
            </div>
            <div>
              <Label>Banheiros</Label>
              <Input className="mt-1.5" type="number" min={0} value={form.banheiros} onChange={e => setForm(p => ({ ...p, banheiros: Number(e.target.value) }))} />
            </div>
            <div>
              <Label>Vagas</Label>
              <Input className="mt-1.5" type="number" min={0} value={form.vagas} onChange={e => setForm(p => ({ ...p, vagas: Number(e.target.value) }))} />
            </div>
            <div>
              <Label>Área (m²)</Label>
              <Input className="mt-1.5" type="number" min={0} value={form.area_m2} onChange={e => setForm(p => ({ ...p, area_m2: Number(e.target.value) }))} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Diferenciais — checklist estilo ListaPro */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" /> Diferenciais
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Marque o que esse imóvel oferece. Use o botão abaixo para adicionar à descrição.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {AMENIDADES_LIST.map(a => (
              <label
                key={a}
                className="flex items-center gap-2 text-sm cursor-pointer p-2 rounded-md border border-border hover:bg-accent transition-colors"
              >
                <Checkbox
                  checked={amenidades.includes(a)}
                  onCheckedChange={() => toggleAmenidad(a)}
                />
                {a}
              </label>
            ))}
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={inserirAmenidadesNaDescricao}
            disabled={!amenidades.length}
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Inserir diferenciais na descrição
          </Button>
        </CardContent>
      </Card>

      {/* Localização */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" /> Localização
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Bairro</Label>
              <Input className="mt-1.5" value={form.bairro} onChange={e => setForm(p => ({ ...p, bairro: e.target.value }))} />
            </div>
            <div>
              <Label>Cidade</Label>
              <Input className="mt-1.5" value={form.cidade} onChange={e => setForm(p => ({ ...p, cidade: e.target.value }))} />
            </div>
            <div>
              <Label>Estado</Label>
              <Input className="mt-1.5" value={form.estado} onChange={e => setForm(p => ({ ...p, estado: e.target.value }))} />
            </div>
          </div>
          <div>
            <Label>URL do mapa (Google Maps Embed)</Label>
            <Input
              className="mt-1.5"
              value={form.mapa_url}
              onChange={e => setForm(p => ({ ...p, mapa_url: e.target.value }))}
              placeholder="https://www.google.com/maps/embed?pb=..."
            />
            <p className="text-xs text-muted-foreground mt-1">
              No Google Maps: Compartilhar → Incorporar um mapa → copie a URL do <code>src</code>.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Fotos */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Camera className="h-4 w-4 text-primary" /> Fotos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ImageUpload
            images={form.imagens}
            onImagesChange={imgs => setForm(p => ({ ...p, imagens: imgs, capa_url: imgs[0] || '' }))}
            folder="fotos"
          />
          <p className="text-xs text-muted-foreground mt-2">
            A primeira foto será usada como capa do imóvel.
          </p>
        </CardContent>
      </Card>

      {/* Vídeo */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Film className="h-4 w-4 text-primary" /> Vídeo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <VideoUpload
            videoUrl={form.video_url}
            onVideoChange={url => setForm(p => ({ ...p, video_url: url }))}
          />
        </CardContent>
      </Card>

      {/* Exibição */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Eye className="h-4 w-4 text-primary" /> Exibição no site
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-8 flex-wrap">
            <div className="flex items-center gap-3">
              <Switch checked={form.destaque} onCheckedChange={v => setForm(p => ({ ...p, destaque: v }))} />
              <Label>Destacar na home</Label>
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={form.publicado} onCheckedChange={v => setForm(p => ({ ...p, publicado: v }))} />
              <Label>Publicado no site</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ListaPro */}
      {isEdit && <ListaProTrigger imovelId={id ?? null} />}

      <div className="flex justify-end pt-2">
        <Button onClick={handleSave} disabled={createImovel.isPending || updateImovel.isPending} size="lg">
          <Save className="h-4 w-4 mr-2" />
          {(createImovel.isPending || updateImovel.isPending) ? 'Salvando...' : 'Salvar imóvel'}
        </Button>
      </div>
    </div>
  );
}
