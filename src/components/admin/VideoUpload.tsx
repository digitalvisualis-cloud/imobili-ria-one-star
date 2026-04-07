import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Video, Loader2, X, Upload } from 'lucide-react';

interface VideoUploadProps {
  videoUrl: string;
  onVideoChange: (url: string) => void;
}

function generateId() {
  return crypto.randomUUID?.() || Date.now().toString(36) + Math.random().toString(36).slice(2);
}

export default function VideoUpload({ videoUrl, onVideoChange }: VideoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [mode, setMode] = useState<'upload' | 'url'>(videoUrl && (videoUrl.includes('youtube') || videoUrl.includes('youtu.be')) ? 'url' : 'upload');

  const handleFile = useCallback(async (file: File | null) => {
    if (!file) return;
    if (file.size > 50 * 1024 * 1024) {
      toast.error('Vídeo deve ter no máximo 50MB');
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split('.').pop() || 'mp4';
      const path = `videos/${generateId()}.${ext}`;
      
      const { error } = await supabase.storage.from('imoveis').upload(path, file, {
        cacheControl: '3600',
        upsert: false,
      });
      if (error) throw error;
      
      const { data } = supabase.storage.from('imoveis').getPublicUrl(path);
      onVideoChange(data.publicUrl);
      toast.success('Vídeo enviado!');
    } catch (err: any) {
      toast.error(err?.message || 'Erro ao enviar vídeo');
    } finally {
      setUploading(false);
    }
  }, [onVideoChange]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium flex items-center gap-2">
          <Video className="h-4 w-4" /> Vídeo do Imóvel
        </label>
        <div className="flex gap-1">
          <Button type="button" variant={mode === 'upload' ? 'default' : 'outline'} size="sm" onClick={() => setMode('upload')}>
            <Upload className="h-3 w-3 mr-1" /> Upload
          </Button>
          <Button type="button" variant={mode === 'url' ? 'default' : 'outline'} size="sm" onClick={() => setMode('url')}>
            YouTube
          </Button>
        </div>
      </div>

      {mode === 'upload' ? (
        <div
          onDrop={e => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}
          onDragOver={e => e.preventDefault()}
          className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer"
          onClick={() => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'video/mp4,video/webm';
            input.onchange = () => handleFile(input.files?.[0] || null);
            input.click();
          }}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="text-sm">Enviando vídeo...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <Video className="h-8 w-8" />
              <span className="text-sm">Arraste um vídeo ou clique para selecionar</span>
              <span className="text-xs">MP4, WebM • Máx. 50MB</span>
            </div>
          )}
        </div>
      ) : (
        <Input
          value={videoUrl}
          onChange={e => onVideoChange(e.target.value)}
          placeholder="https://www.youtube.com/watch?v=..."
        />
      )}

      {videoUrl && (
        <div className="relative">
          {videoUrl.includes('youtube') || videoUrl.includes('youtu.be') ? (
            <div className="aspect-video rounded-lg overflow-hidden bg-muted">
              <iframe
                src={videoUrl.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                className="w-full h-full"
                allowFullScreen
              />
            </div>
          ) : (
            <div className="aspect-video rounded-lg overflow-hidden bg-muted">
              <video src={videoUrl} controls className="w-full h-full object-cover" />
            </div>
          )}
          <button
            type="button"
            onClick={() => onVideoChange('')}
            className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1.5"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
