import { Link } from 'react-router-dom';
import { useSiteConfig } from '@/hooks/use-site-config';
import { Phone, Mail, MapPin, Instagram } from 'lucide-react';

export function Footer() {
  const { data: config } = useSiteConfig();

  return (
    <footer className="bg-secondary text-secondary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <h3 className="font-display text-2xl font-semibold text-primary mb-4">
              {config?.nome_imobiliaria || 'Imobiliária One Star'}
            </h3>
            {config?.endereco_texto && (
              <div className="flex items-start gap-2 text-sm opacity-80 mb-2">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
                <span>{config.endereco_texto}</span>
              </div>
            )}
            {config?.whatsapp && (
              <div className="flex items-center gap-2 text-sm opacity-80 mb-2">
                <Phone className="h-4 w-4 shrink-0 text-primary" />
                <span>{config.whatsapp}</span>
              </div>
            )}
            {config?.email && (
              <div className="flex items-center gap-2 text-sm opacity-80">
                <Mail className="h-4 w-4 shrink-0 text-primary" />
                <span>{config.email}</span>
              </div>
            )}
          </div>

          {/* Links */}
          <div>
            <h4 className="font-display text-lg font-semibold text-primary mb-4">Links</h4>
            <ul className="space-y-2 text-sm opacity-80">
              <li><Link to="/" className="hover:text-primary transition-colors">Início</Link></li>
              <li><Link to="/politica-de-privacidade" className="hover:text-primary transition-colors">Política de Privacidade</Link></li>
              <li><Link to="/termos-de-uso" className="hover:text-primary transition-colors">Termos de Uso</Link></li>
              <li><Link to="/politica-de-cookies" className="hover:text-primary transition-colors">Política de Cookies</Link></li>
            </ul>
          </div>

          {/* Map */}
          <div>
            {config?.google_maps_url && (
              <div>
                <h4 className="font-display text-lg font-semibold text-primary mb-4">Localização</h4>
                <a
                  href={config.google_maps_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm opacity-80 hover:text-primary transition-colors"
                >
                  Ver no Google Maps →
                </a>
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-primary/20 mt-8 pt-6 text-center text-xs opacity-60">
          © {new Date().getFullYear()} {config?.nome_imobiliaria || 'Imobiliária One Star'}. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
}
