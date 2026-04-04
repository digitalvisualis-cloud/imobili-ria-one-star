import { useSiteConfig } from '@/hooks/use-site-config';
import { MessageCircle } from 'lucide-react';
import { buildWhatsAppLink } from '@/lib/types';

export function WhatsAppButton() {
  const { data: config } = useSiteConfig();

  if (!config?.whatsapp) return null;

  const link = buildWhatsAppLink(
    config.whatsapp,
    `Olá! Gostaria de mais informações sobre os imóveis disponíveis.`
  );

  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 bg-green-500 hover:bg-green-600 text-white rounded-full p-4 shadow-lg transition-all hover:scale-110"
      aria-label="Contato WhatsApp"
    >
      <MessageCircle className="h-6 w-6" />
    </a>
  );
}
