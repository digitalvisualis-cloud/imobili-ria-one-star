import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Lock, ShieldAlert } from 'lucide-react';

export default function ChangePassword() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const validate = () => {
    if (password.length < 10) return 'A senha deve ter pelo menos 10 caracteres.';
    if (!/\d/.test(password)) return 'Recomendado: inclua pelo menos um número.';
    if (password !== confirm) return 'As senhas não coincidem.';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const v = validate();
    if (v && v !== 'Recomendado: inclua pelo menos um número.') return setError(v);

    setLoading(true);
    setError('');

    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) {
      setLoading(false);
      return setError('Erro ao atualizar senha.');
    }

    // Mark password as changed
    if (user) {
      await supabase.from('profiles').update({ must_change_password: false }).eq('id', user.id);
    }

    setLoading(false);
    navigate('/admin', { replace: true });
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2">
            <ShieldAlert className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="font-display text-2xl">Troca de senha obrigatória</CardTitle>
          <CardDescription>Por segurança, defina uma nova senha antes de continuar.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Nova senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input type="password" value={password} onChange={e => setPassword(e.target.value)} className="pl-10" placeholder="Mínimo 10 caracteres" />
              </div>
              <p className="text-xs text-muted-foreground">Mínimo 10 caracteres. Recomendado: letras e números.</p>
            </div>
            <div className="space-y-2">
              <Label>Confirmar senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} className="pl-10" />
              </div>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Atualizando...' : 'Definir nova senha'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
