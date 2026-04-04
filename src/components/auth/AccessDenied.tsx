import { ShieldX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export function AccessDenied() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <ShieldX className="h-16 w-16 text-destructive mb-4" />
      <h1 className="font-display text-3xl font-bold mb-2">Acesso Negado</h1>
      <p className="text-muted-foreground mb-6">
        Você não tem permissão para acessar esta página.
      </p>
      <Link to="/admin">
        <Button variant="outline">Voltar ao painel</Button>
      </Link>
    </div>
  );
}
