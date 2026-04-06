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
import { ArrowLeft, Save, Video } from 'lucide-react';

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

  const [newImageUrl, setNewImageUrl] = useState('');

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

    try {
      if (isEdit) {
        await updateImovel.mutateAsync({ id, ...form } as any);
        toast.success('Imóvel atualizado com sucesso!');
      } else {
        await createImovel.mutateAsync(form as any);
        toast.success('Imóvel criado com sucesso!');
      }
      navigate('/admin/imoveis');
    } catch (err: any) {
      toast.error(err?.message || 'Erro ao salvar imóvel');
    }
  };

  const addImage = () => {
    if (newImageUrl.trim()) {
      setForm(p => ({ ...p, imagens: [...p.imagens, newImageUrl.trim()] }));
      setNewImageUrl('');
    }
  };

  const removeImage = (index: number) => {
    setForm(p => ({ ...p, imagens: p.imagens.filter((_, i) => i !== index) }));
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
        </CardContent>
      </Card>

      {/* Media */}
      <Card>
        <CardHeader><CardTitle className="font-display">Mídia</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>URL da foto de capa</Label>
            <Input value={form.capa_url} onChange={e => setForm(p => ({ ...p, capa_url: e.target.value }))} placeholder="https://..." />
          </div>
          <div>
            <Label>URL do mapa (Google Maps Embed)</Label>
            <Input value={form.mapa_url} onChange={e => setForm(p => ({ ...p, mapa_url: e.target.value }))} placeholder="https://www.google.com/maps/embed?pb=..." />
            <p className="text-xs text-muted-foreground mt-1">
              Cole a URL de incorporação do Google Maps. No Google Maps, clique em "Compartilhar" → "Incorporar um mapa" e copie apenas a URL do src.
            </p>
          </div>
          <div>
            <Label className="flex items-center gap-2"><Video className="h-4 w-4" /> URL do Vídeo (YouTube ou MP4)</Label>
            <Input value={form.video_url} onChange={e => setForm(p => ({ ...p, video_url: e.target.value }))} placeholder="https://www.youtube.com/watch?v=... ou https://...video.mp4" />
            <p className="text-xs text-muted-foreground mt-1">
              Cole a URL de um vídeo do YouTube ou um link direto para um arquivo MP4.
            </p>
          </div>
          <div>
            <Label>Imagens adicionais</Label>
            <div className="flex gap-2">
              <Input value={newImageUrl} onChange={e => setNewImageUrl(e.target.value)} placeholder="URL da imagem" className="flex-1" />
              <Button type="button" variant="outline" onClick={addImage}>Adicionar</Button>
            </div>
            {form.imagens.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {form.imagens.map((img, i) => (
                  <div key={i} className="relative w-20 h-16 rounded-md overflow-hidden group">
                    <img src={img} alt="" className="w-full h-full object-cover" />
                    <button
                      onClick={() => removeImage(i)}
                      className="absolute inset-0 bg-destructive/70 text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity text-xs flex items-center justify-center"
                    >
                      Remover
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
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

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={createImovel.isPending || updateImovel.isPending}>
          <Save className="h-4 w-4 mr-2" />
          {(createImovel.isPending || updateImovel.isPending) ? 'Salvando...' : 'Salvar'}
        </Button>
      </div>
    </div>
  );
}
