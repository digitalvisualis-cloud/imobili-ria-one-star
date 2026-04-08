import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Building2, Users, DollarSign, UserCog, ExternalLink, LogOut, CalendarDays } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useAuth, AppRole } from '@/contexts/AuthContext';
import logoImg from '@/assets/logo.png';

interface NavItem {
  to: string;
  label: string;
  icon: any;
  module?: string;
  ownerOnly?: boolean;
}

const navItems: NavItem[] = [
  { to: '/painel', label: 'Dashboard', icon: LayoutDashboard, module: 'dashboard' },
  { to: '/painel/imoveis', label: 'Imóveis', icon: Building2, module: 'imoveis' },
  { to: '/painel/crm', label: 'CRM', icon: Users, module: 'crm' },
  { to: '/painel/agenda', label: 'Agenda', icon: CalendarDays },
  { to: '/painel/financeiro', label: 'Financeiro', icon: DollarSign, module: 'financeiro' },
  { to: '/painel/equipe', label: 'Equipe', icon: UserCog, ownerOnly: true },
];

export function ClientLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, role, signOut } = useAuth();

  // owner and admin see all; manager/agent see based on permissions (handled by backend)
  const filteredNav = navItems.filter(item => {
    if (item.ownerOnly && role !== 'owner' && role !== 'admin') return false;
    return true;
  });

  const handleSignOut = async () => {
    await signOut();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-sidebar text-sidebar-foreground border-r border-sidebar-border hidden md:flex flex-col">
        <div className="p-4 border-b border-sidebar-border">
          <Link to="/painel" className="flex items-center gap-2">
            <img src={logoImg} alt="Logo" className="h-8 w-auto" />
            <span className="font-display text-sm font-semibold text-sidebar-primary">Painel</span>
          </Link>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {filteredNav.map(item => (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors',
                location.pathname === item.to
                  ? 'bg-sidebar-accent text-sidebar-primary'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-sidebar-border space-y-2">
          {user && (
            <div className="px-3 py-1">
              <p className="text-xs text-sidebar-foreground/50 truncate">{user.email}</p>
              <p className="text-xs text-sidebar-primary capitalize">{role}</p>
            </div>
          )}
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors"
          >
            <ExternalLink className="h-4 w-4" />
            Ver site público
          </a>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors w-full"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </button>
          <div className="px-3">
            <ThemeToggle />
          </div>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="flex-1 flex flex-col">
        <header className="md:hidden flex items-center justify-between p-4 border-b border-border bg-card">
          <Link to="/painel" className="flex items-center gap-2">
            <img src={logoImg} alt="Logo" className="h-8 w-auto" />
            <span className="font-display text-sm font-semibold text-primary">Painel</span>
          </Link>
          <div className="flex items-center gap-2">
            {filteredNav.map(item => (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  'p-2 rounded-md transition-colors',
                  location.pathname === item.to ? 'bg-primary/10 text-primary' : 'text-muted-foreground'
                )}
              >
                <item.icon className="h-5 w-5" />
              </Link>
            ))}
            <button onClick={handleSignOut} className="p-2 rounded-md text-muted-foreground hover:text-destructive">
              <LogOut className="h-5 w-5" />
            </button>
            <ThemeToggle />
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8 overflow-y-auto bg-background">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
