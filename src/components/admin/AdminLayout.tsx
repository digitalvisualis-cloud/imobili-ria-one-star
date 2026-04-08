import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Settings, Building2, ExternalLink, KeyRound, Brain, ScrollText, BookOpen, Users, Activity, LogOut, MessageSquare, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useAuth, AppRole } from '@/contexts/AuthContext';
import { AccessDenied } from '@/components/auth/AccessDenied';
import { Button } from '@/components/ui/button';
import logoImg from '@/assets/logo.png';

interface NavItem {
  to: string;
  label: string;
  icon: any;
  roles: AppRole[];
}

const navItems: NavItem[] = [
  { to: '/admin', label: 'Configurações do Site', icon: Settings, roles: ['admin', 'editor', 'viewer'] },
  { to: '/admin/analytics', label: 'Analytics', icon: BarChart3, roles: ['admin', 'editor', 'viewer'] },
  { to: '/admin/imoveis', label: 'Imóveis', icon: Building2, roles: ['admin', 'editor', 'viewer'] },
  { to: '/admin/api-keys', label: 'Chaves de API', icon: KeyRound, roles: ['admin', 'editor'] },
  { to: '/admin/ia-config', label: 'Configurações de IA', icon: Brain, roles: ['admin'] },
  { to: '/admin/ia-logs', label: 'Logs da Busca IA', icon: ScrollText, roles: ['admin', 'editor', 'viewer'] },
  { to: '/admin/api-logs', label: 'Logs da API', icon: Activity, roles: ['admin'] },
  { to: '/admin/api-docs', label: 'Documentação da API', icon: BookOpen, roles: ['admin', 'editor', 'viewer'] },
  { to: '/admin/usuarios', label: 'Usuários', icon: Users, roles: ['admin'] },
  { to: '/admin/leads', label: 'Leads', icon: MessageSquare, roles: ['admin', 'editor', 'viewer'] },
];

export function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, role, signOut } = useAuth();

  const filteredNav = navItems.filter(item => role && item.roles.includes(role));

  // Check if current route is allowed for this role
  const currentNavItem = navItems.find(item => item.to === location.pathname);
  if (currentNavItem && role && !currentNavItem.roles.includes(role)) {
    return <AccessDenied />;
  }

  const handleSignOut = async () => {
    await signOut();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-sidebar text-sidebar-foreground border-r border-sidebar-border hidden md:flex flex-col">
        <div className="p-4 border-b border-sidebar-border">
          <Link to="/admin" className="flex items-center gap-2">
            <img src={logoImg} alt="Logo" className="h-8 w-auto" />
            <span className="font-display text-sm font-semibold text-sidebar-primary">Painel Admin</span>
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
          <Link to="/admin" className="flex items-center gap-2">
            <img src={logoImg} alt="Logo" className="h-8 w-auto" />
            <span className="font-display text-sm font-semibold text-primary">Admin</span>
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
