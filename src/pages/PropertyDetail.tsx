import { useParams } from 'react-router-dom';
import { useImovelByCodigo } from '@/hooks/use-imoveis';
import { useSiteConfig } from '@/hooks/use-site-config';
import { formatCurrency, TIPO_LABELS, FINALIDADE_LABELS, buildWhatsAppLink } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { BedDouble, Car, Maximize, Bath, MapPin, MessageCircle, Copy, ChevronLeft, Eye, Video } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

function getYouTubeEmbedUrl(url: string): string {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  const videoId = match && match[2].length === 11 ? match[2] : null;
  return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
}

export default function PropertyDetail() {
  const { codigo } = useParams<{ codigo: string }>();
  const { data: imovel, isLoading } = useImovelByCodigo(codigo || '');
  const { data: config } = useSiteConfig();
  const [selectedImage, setSelectedImage] = useState(0);
  const [viewCount, setViewCount] = useState<number | null>(null);

  useEffect(() => {
    if (!imovel) return;
    supabase.functions.invoke('track-view', {
      body: { imovel_id: imovel.id },
    }).then(({ data }) => {
      if (data?.views != null) setViewCount(data.views);
    });
  }, [imovel]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Skeleton className="h-[500px] rounded-lg mb-6" />
        <Skeleton className="h-8 w-1/2 mb-4" />
        <Skeleton className="h-6 w-1/3" />
      </div>
    );
  }

  if (!imovel) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h1 className="font-display text-4xl font-bold mb-4">Imóvel indisponível</h1>
        <p className="text-muted-foreground mb-6">Este imóvel não está mais disponível para visualização.</p>
        <Link to="/">
          <Button variant="outline">← Voltar para o início</Button>
        </Link>
      </div>
    );
  }

  const allImages = [imovel.capa_url, ...(imovel.imagens || [])].filter(Boolean) as string[];
  const currentImage = allImages[selectedImage] || '/placeholder.svg';

  const propertyUrl = `${window.location.origin}/imovel/${imovel.codigo_imovel}`;
  const whatsappMessage = `Olá! Tenho interesse no imóvel código ${imovel.codigo_imovel} - ${imovel.titulo}.\n\n🔗 ${propertyUrl}\n\nPode me passar mais informações?`;
  const whatsappLink = config?.whatsapp ? buildWhatsAppLink(config.whatsapp, whatsappMessage) : '#';

  const copyCode = () => {
    navigator.clipboard.writeText(imovel.codigo_imovel);
    toast.success('Código copiado!');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Link to="/" className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ChevronLeft className="h-4 w-4" /> Voltar
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Images */}
        <div className="space-y-3">
          <div className="aspect-[16/10] rounded-lg overflow-hidden bg-muted">
            <img src={currentImage} alt={imovel.titulo} className="w-full h-full object-cover" />
          </div>
          {allImages.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {allImages.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`shrink-0 w-20 h-16 rounded-md overflow-hidden border-2 transition-colors ${
                    i === selectedImage ? 'border-primary' : 'border-transparent'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-primary text-primary-foreground">{FINALIDADE_LABELS[imovel.finalidade]}</Badge>
              <Badge variant="outline">{TIPO_LABELS[imovel.tipo]}</Badge>
              {imovel.destaque && <Badge className="bg-secondary text-secondary-foreground">Destaque</Badge>}
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold">{imovel.titulo}</h1>
            {(imovel.bairro || imovel.cidade) && (
              <div className="flex items-center gap-1 text-muted-foreground mt-2">
                <MapPin className="h-4 w-4" />
                <span>{[imovel.bairro, imovel.cidade, imovel.estado].filter(Boolean).join(', ')}</span>
              </div>
            )}
            {viewCount !== null && viewCount > 0 && (
              <div className="flex items-center gap-1.5 text-muted-foreground mt-2">
                <Eye className="h-4 w-4" />
                <span className="text-sm">
                  {viewCount} {viewCount === 1 ? 'pessoa visualizou' : 'pessoas visualizaram'} este imóvel
                </span>
              </div>
            )}
          </div>

          <div>
            <p className="font-display text-3xl md:text-4xl font-bold text-primary">
              {formatCurrency(imovel.preco)}
              {imovel.finalidade === 'aluguel' && <span className="text-base font-body font-normal text-muted-foreground">/mês</span>}
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {imovel.quartos > 0 && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-muted">
                <BedDouble className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-semibold">{imovel.quartos}</p>
                  <p className="text-xs text-muted-foreground">Quartos</p>
                </div>
              </div>
            )}
            {imovel.banheiros > 0 && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-muted">
                <Bath className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-semibold">{imovel.banheiros}</p>
                  <p className="text-xs text-muted-foreground">Banheiros</p>
                </div>
              </div>
            )}
            {imovel.vagas > 0 && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-muted">
                <Car className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-semibold">{imovel.vagas}</p>
                  <p className="text-xs text-muted-foreground">Vagas</p>
                </div>
              </div>
            )}
            {imovel.area_m2 > 0 && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-muted">
                <Maximize className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-semibold">{imovel.area_m2} m²</p>
                  <p className="text-xs text-muted-foreground">Área</p>
                </div>
              </div>
            )}
          </div>

          {/* Code */}
          <div className="flex items-center gap-2 p-3 rounded-lg bg-muted">
            <span className="text-sm text-muted-foreground">Código:</span>
            <span className="font-mono font-semibold text-primary">{imovel.codigo_imovel}</span>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={copyCode}>
              <Copy className="h-3.5 w-3.5" />
            </Button>
          </div>

          {/* WhatsApp CTA */}
          <a href={config?.whatsapp ? whatsappLink : '#'} target={config?.whatsapp ? '_blank' : undefined} rel="noopener noreferrer" onClick={(e) => {
            if (!config?.whatsapp) {
              e.preventDefault();
              toast.error('WhatsApp não configurado. Configure nas Configurações do Site.');
            }
          }}>
            <Button size="lg" className="w-full bg-green-600 hover:bg-green-700 text-white">
              <MessageCircle className="h-5 w-5 mr-2" />
              Tenho interesse neste imóvel
            </Button>
          </a>

          {/* Description */}
          {imovel.descricao && (
            <div>
              <h2 className="font-display text-2xl font-semibold mb-3">Descrição</h2>
              <p className="text-muted-foreground font-body leading-relaxed whitespace-pre-line">{imovel.descricao}</p>
            </div>
          )}
        </div>
      </div>

      {/* Video */}
      {(imovel as any).video_url && (
        <div className="mt-8">
          <h2 className="font-display text-2xl font-semibold mb-4 flex items-center gap-2">
            <Video className="h-5 w-5 text-primary" /> Vídeo do Imóvel
          </h2>
          <div className="aspect-video rounded-lg overflow-hidden border border-border bg-muted">
            {(imovel as any).video_url.includes('youtube.com') || (imovel as any).video_url.includes('youtu.be') ? (
              <iframe
                src={getYouTubeEmbedUrl((imovel as any).video_url)}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                title="Vídeo do imóvel"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />
            ) : (
              <video
                src={(imovel as any).video_url}
                controls
                className="w-full h-full object-contain"
                preload="metadata"
              />
            )}
          </div>
        </div>
      )}

      {/* Map */}
      {imovel.mapa_url && (
        <div className="mt-8">
          <h2 className="font-display text-2xl font-semibold mb-4">Localização</h2>
          <div className="aspect-[16/9] rounded-lg overflow-hidden border border-border">
            <iframe
              src={imovel.mapa_url}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Mapa do imóvel"
            />
          </div>
        </div>
      )}
    </div>
  );
}
