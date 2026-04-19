import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useImovel, useCreateImovel, useUpdateImovel } from '@/hooks/use-imoveis';
import { generatePropertyCode, TIPO_LABELS, FINALIDADE_LABELS, TipoImovel, FinalidadeImovel } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { ArrowLeft, Save } from 'lucide-react';
import ImageUpload from '@/components/admin/ImageUpload';
import VideoUpload from '@/components/admin/VideoUpload';
import { ListaProTrigger } from '@/components/listapro/ListaProTrigger';

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
    }
  }, [existing]);

  const handleSave = async () => {
    if (!form.titulo.trim()) {
      toast.error('O título é obrigatório');
      return;
    }
    if (form.preco <= 0) {
      toast.error('O preço deve ser maior que zero');
      return;
    }

    // Use first image as cover if no cover set
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
      <div className="space-y-6 max-w-4xl">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin/imoveis')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="font-display text-3xl font-bold">
            {isEdit ? 'Editar Imóvel' : 'Novo Imóvel'}
          </h1>
        </div>
        <Button onClick={handleSave} disabled={createImovel.isPending || updateImovel.isPending}>
          <Save className="h-4 w-4 mr-2" />
          {(createImovel.isPending || updateImovel.isPending) ? 'Salvando...' : 'Salvar'}
        </Button>
      </div>

      {/* Code */}
      <div className="p-3 bg-muted rounded-lg flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Código do imóvel:</span>
        <span className="font-mono font-bold text-primary text-lg">{form.codigo_imovel}</span>
      </div>

      {/* Main info */}
      <Card>
        <CardHeader><CardTitle className="font-display">Informações Principais</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Título *</Label>
            <Input value={form.titulo} onChange={e => setForm(p => ({ ...p, titulo: e.target.value }))} />
          </div>
          <div>
            <Label>Descrição *</Label>
            <Textarea value={form.descricao} onChange={e => setForm(p => ({ ...p, descricao: e.target.value }))} rows={5} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Tipo</Label>
              <Select value={form.tipo} onValueChange={(v: TipoImovel) => setForm(p => ({ ...p, tipo: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(TIPO_LABELS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Finalidade</Label>
              <Select value={form.finalidade} onValueChange={(v: FinalidadeImovel) => setForm(p => ({ ...p, finalidade: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(FINALIDADE_LABELS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Preço *</Label>
              <Input type="number" min={0} value={form.preco} onChange={e => setForm(p => ({ ...p, preco: Number(e.target.value) }))} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Details */}
      <Card>
        <CardHeader><CardTitle className="font-display">Detalhes</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <Label>Quartos</Label>
              <Input type="number" min={0} value={form.quartos} onChange={e => setForm(p => ({ ...p, quartos: Number(e.target.value) }))} />
            </div>
            <div>
              <Label>Banheiros</Label>
              <Input type="number" min={0} value={form.banheiros} onChange={e => setForm(p => ({ ...p, banheiros: Number(e.target.value) }))} />
            </div>
            <div>
              <Label>Vagas</Label>
              <Input type="number" min={0} value={form.vagas} onChange={e => setForm(p => ({ ...p, vagas: Number(e.target.value) }))} />
            </div>
            <div>
              <Label>Área (m²)</Label>
              <Input type="number" min={0} value={form.area_m2} onChange={e => setForm(p => ({ ...p, area_m2: Number(e.target.value) }))} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Location */}
      <Card>
        <CardHeader><CardTitle className="font-display">Localização</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Bairro</Label>
              <Input value={form.bairro} onChange={e => setForm(p => ({ ...p, bairro: e.target.value }))} />
            </div>
            <div>
              <Label>Cidade</Label>
              <Input value={form.cidade} onChange={e => setForm(p => ({ ...p, cidade: e.target.value }))} />
            </div>
            <div>
              <Label>Estado</Label>
              <Input value={form.estado} onChange={e => setForm(p => ({ ...p, estado: e.target.value }))} />
            </div>
          </div>
          <div className="mt-4">
            <Label>URL do mapa (Google Maps Embed)</Label>
            <Input value={form.mapa_url} onChange={e => setForm(p => ({ ...p, mapa_url: e.target.value }))} placeholder="https://www.google.com/maps/embed?pb=..." />
            <p className="text-xs text-muted-foreground mt-1">
              Cole a URL de incorporação do Google Maps. No Google Maps, clique em "Compartilhar" → "Incorporar um mapa" e copie apenas a URL do src.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Photos */}
      <Card>
        <CardHeader><CardTitle className="font-display">Fotos</CardTitle></CardHeader>
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

      {/* Video */}
      <Card>
        <CardHeader><CardTitle className="font-display">Vídeo</CardTitle></CardHeader>
        <CardContent>
          <VideoUpload
            videoUrl={form.video_url}
            onVideoChange={url => setForm(p => ({ ...p, video_url: url }))}
          />
        </CardContent>
      </Card>

      {/* Display */}
      <Card>
        <CardHeader><CardTitle className="font-display">Exibição</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <Label>Destaque</Label>
              <Switch checked={form.destaque} onCheckedChange={v => setForm(p => ({ ...p, destaque: v }))} />
            </div>
            <div className="flex items-center gap-3">
              <Label>Publicado</Label>
              <Switch checked={form.publicado} onCheckedChange={v => setForm(p => ({ ...p, publicado: v }))} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ListaPro */}
      {isEdit && (
        <ListaProTrigger imovelId={id ?? null} />
      )}

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={createImovel.isPending || updateImovel.isPending}>
          <Save className="h-4 w-4 mr-2" />
          {(createImovel.isPending || updateImovel.isPending) ? 'Salvando...' : 'Salvar'}
        </Button>
      </div>
    </div>
  );
}
