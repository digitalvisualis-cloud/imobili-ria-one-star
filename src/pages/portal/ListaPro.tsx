import { useState } from 'react';
import { Wand2, Copy, Check, Loader2, Sparkles, RefreshCw } from 'lucide-react';
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

const TIPOS = ['Casa', 'Departamento', 'Terreno', 'Penthouse'];
const OPERACIONES = ['Venta', 'Renta'];
const AMENIDADES_LIST = [
  'Alberca', 'Jardín', 'Seguridad 24h', 'Gimnasio', 'Roof garden',
  'Salón de eventos', 'Área de juegos', 'Estacionamiento techado',
  'Elevador', 'Cisterna', 'Pet friendly', 'Vista panorámica',
];

interface FormState {
  tipo: string;
  operacion: string;
  direccion: string;
  ciudad: string;
  estado: string;
  precio: string;
  recamaras: string;
  banos: string;
  metros_construidos: string;
  metros_terreno: string;
  estacionamientos: string;
  amenidades: string[];
  destaque_agente: string;
  agente_nombre: string;
  agente_telefono: string;
  agente_email: string;
  imagenes: string[];
}

const initialForm: FormState = {
  tipo: 'Casa',
  operacion: 'Venta',
  direccion: '',
  ciudad: '',
  estado: '',
  precio: '',
  recamaras: '',
  banos: '',
  metros_construidos: '',
  metros_terreno: '',
  estacionamientos: '',
  amenidades: [],
  destaque_agente: '',
  agente_nombre: '',
  agente_telefono: '',
  agente_email: '',
  imagenes: [],
};

export default function ListaPro() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ descripcion: string; instagram: string } | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const setField = <K extends keyof FormState>(k: K, v: FormState[K]) => setForm(p => ({ ...p, [k]: v }));

  const toggleAmenidad = (a: string) => {
    setForm(p => ({
      ...p,
      amenidades: p.amenidades.includes(a) ? p.amenidades.filter(x => x !== a) : [...p.amenidades, a],
    }));
  };

  const generate = async () => {
    if (!form.tipo || !form.operacion || !form.ciudad || !form.precio) {
      toast.error('Completa al menos tipo, operación, ciudad y precio');
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const { data, error } = await supabase.functions.invoke('generate-listing', {
        body: {
          tipo: form.tipo,
          operacion: form.operacion,
          direccion: form.direccion,
          ciudad: form.ciudad,
          estado: form.estado,
          precio: Number(form.precio) || 0,
          recamaras: Number(form.recamaras) || 0,
          banos: Number(form.banos) || 0,
          metros_construidos: Number(form.metros_construidos) || 0,
          metros_terreno: Number(form.metros_terreno) || 0,
          estacionamientos: Number(form.estacionamientos) || 0,
          amenidades: form.amenidades,
          destaque_agente: form.destaque_agente,
          agente_nombre: form.agente_nombre,
          agente_telefono: form.agente_telefono,
          agente_email: form.agente_email,
        },
      });

      if (error) {
        const msg = (error as any)?.message || 'Error al generar contenido';
        if (msg.includes('429')) toast.error('Límite de uso excedido. Intenta más tarde.');
        else if (msg.includes('402')) toast.error('Créditos de IA agotados.');
        else toast.error(msg);
        return;
      }
      if ((data as any)?.error) {
        toast.error((data as any).error);
        return;
      }
      setResult(data as any);
      toast.success('Contenido generado con IA');
    } catch (e: any) {
      toast.error(e?.message || 'Error inesperado');
    } finally {
      setLoading(false);
    }
  };

  const copy = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    toast.success('Copiado al portapapeles');
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
          <p className="text-sm text-muted-foreground">Generador de contenido profesional con IA para tus propiedades</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Datos de la propiedad</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Tipo & Operación */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Tipo de propiedad *</Label>
              <Select value={form.tipo} onValueChange={v => setField('tipo', v)}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>{TIPOS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Operación *</Label>
              <Select value={form.operacion} onValueChange={v => setField('operacion', v)}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>{OPERACIONES.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>

          {/* Ubicación */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-3">
              <Label>Dirección / Ubicación</Label>
              <Input className="mt-1.5" value={form.direccion} onChange={e => setField('direccion', e.target.value)} placeholder="Calle, número, colonia" />
            </div>
            <div>
              <Label>Ciudad *</Label>
              <Input className="mt-1.5" value={form.ciudad} onChange={e => setField('ciudad', e.target.value)} placeholder="Ej: Monterrey" />
            </div>
            <div>
              <Label>Estado</Label>
              <Input className="mt-1.5" value={form.estado} onChange={e => setField('estado', e.target.value)} placeholder="Ej: Nuevo León" />
            </div>
            <div>
              <Label>Precio MXN *</Label>
              <Input className="mt-1.5" type="number" value={form.precio} onChange={e => setField('precio', e.target.value)} placeholder="2500000" />
            </div>
          </div>

          {/* Características */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <Label>Recámaras</Label>
              <Input className="mt-1.5" type="number" value={form.recamaras} onChange={e => setField('recamaras', e.target.value)} />
            </div>
            <div>
              <Label>Baños</Label>
              <Input className="mt-1.5" type="number" value={form.banos} onChange={e => setField('banos', e.target.value)} />
            </div>
            <div>
              <Label>m² construidos</Label>
              <Input className="mt-1.5" type="number" value={form.metros_construidos} onChange={e => setField('metros_construidos', e.target.value)} />
            </div>
            <div>
              <Label>m² terreno</Label>
              <Input className="mt-1.5" type="number" value={form.metros_terreno} onChange={e => setField('metros_terreno', e.target.value)} />
            </div>
            <div>
              <Label>Estacion.</Label>
              <Input className="mt-1.5" type="number" value={form.estacionamientos} onChange={e => setField('estacionamientos', e.target.value)} />
            </div>
          </div>

          {/* Amenidades */}
          <div>
            <Label>Amenidades</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
              {AMENIDADES_LIST.map(a => (
                <label key={a} className="flex items-center gap-2 text-sm cursor-pointer p-2 rounded hover:bg-accent">
                  <Checkbox checked={form.amenidades.includes(a)} onCheckedChange={() => toggleAmenidad(a)} />
                  {a}
                </label>
              ))}
            </div>
          </div>

          {/* Destaque del agente */}
          <div>
            <Label>Lo que destacas (2-3 líneas)</Label>
            <Textarea
              className="mt-1.5"
              rows={3}
              value={form.destaque_agente}
              onChange={e => setField('destaque_agente', e.target.value)}
              placeholder="Ej: Casa remodelada en zona tranquila, a 5 min de escuelas y plazas..."
            />
          </div>

          {/* Fotos */}
          <ImageUpload
            images={form.imagenes}
            onImagesChange={imgs => setField('imagenes', imgs)}
            folder="listapro"
            maxFiles={15}
            label="Fotos de la propiedad (la primera será la portada)"
          />

          {/* Datos del agente */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-border">
            <div>
              <Label>Nombre del agente</Label>
              <Input className="mt-1.5" value={form.agente_nombre} onChange={e => setField('agente_nombre', e.target.value)} />
            </div>
            <div>
              <Label>Teléfono</Label>
              <Input className="mt-1.5" value={form.agente_telefono} onChange={e => setField('agente_telefono', e.target.value)} />
            </div>
            <div>
              <Label>Email</Label>
              <Input className="mt-1.5" type="email" value={form.agente_email} onChange={e => setField('agente_email', e.target.value)} />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button onClick={generate} disabled={loading} size="lg" className="gap-2">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {loading ? 'Generando...' : 'Generar contenido con IA'}
            </Button>
            {result && (
              <Button variant="outline" onClick={generate} disabled={loading} className="gap-2">
                <RefreshCw className="h-4 w-4" /> Regenerar
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Descripción profesional</CardTitle>
              <Button size="sm" variant="outline" onClick={() => copy(result.descripcion, 'desc')} className="gap-2">
                {copied === 'desc' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                Copiar
              </Button>
            </CardHeader>
            <CardContent>
              <div className="whitespace-pre-wrap text-sm leading-relaxed">{result.descripcion}</div>
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
