import { Link } from 'react-router-dom';
import { useSiteConfig } from '@/hooks/use-site-config';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { ThemeToggle } from '@/components/ThemeToggle';
import logoImg from '@/assets/logo.png';

export function Header() {
  const { data: config } = useSiteConfig();
  const [mobileOpen, setMobileOpen] = useState(false);

  const logoSrc = config?.logo_url || logoImg;

  return (
    <header className="sticky top-0 z-50 bg-secondary/95 backdrop-blur-md border-b border-primary/10">
      <div className="container mx-auto px-4 flex items-center justify-between h-16 md:h-20">
        <Link to="/" className="flex items-center gap-3">
          <img src={logoSrc} alt={config?.nome_imobiliaria || 'Logo'} className="h-10 md:h-12 w-auto" />
          <div className="hidden sm:block">
            <span className="font-display text-lg md:text-xl font-semibold text-primary tracking-wide">
              {config?.nome_imobiliaria || 'Imobiliária One Star'}
            </span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-sm font-body text-secondary-foreground/80 hover:text-primary transition-colors">
            Início
          </Link>
          <Link to="/#imoveis" className="text-sm font-body text-secondary-foreground/80 hover:text-primary transition-colors">
            Imóveis
          </Link>
          <Link to="/#contato" className="text-sm font-body text-secondary-foreground/80 hover:text-primary transition-colors">
            Contato
          </Link>
          <ThemeToggle />
        </nav>

        <button
          className="md:hidden text-secondary-foreground"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-secondary border-t border-primary/10 px-4 py-4 space-y-3">
          <Link to="/" onClick={() => setMobileOpen(false)} className="block text-sm text-secondary-foreground/80 hover:text-primary">
            Início
          </Link>
          <Link to="/#imoveis" onClick={() => setMobileOpen(false)} className="block text-sm text-secondary-foreground/80 hover:text-primary">
            Imóveis
          </Link>
          <Link to="/#contato" onClick={() => setMobileOpen(false)} className="block text-sm text-secondary-foreground/80 hover:text-primary">
            Contato
          </Link>
          <ThemeToggle />
        </div>
      )}
    </header>
  );
}
