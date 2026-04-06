import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Lock } from 'lucide-react';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Check if there's a recovery token in the URL hash
    const hash = window.location.hash;
    if (hash && (hash.includes('type=recovery') || hash.includes('type=signup'))) {
      // Let Supabase client handle the hash automatically
      // It will fire PASSWORD_RECOVERY event
    }

    // Check if we already have a session (user clicked recovery link)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setReady(true);
      }
    });

    // Listen for recovery event
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' || (event === 'SIGNED_IN' && session)) {
        setReady(true);
      }
    });

    // Fallback: if after 3 seconds still not ready but we have a session, show form
    const timeout = setTimeout(async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setReady(true);
      }
    }, 3000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  const validate = () => {
    if (password.length < 10) return 'A senha deve ter pelo menos 10 caracteres.';
    if (password !== confirm) return 'As senhas não coincidem.';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) return setError(validationError);

    setLoading(true);
    setError('');

    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      setError('Erro ao atualizar senha. Tente novamente.');
    } else {
      navigate('/admin', { replace: true });
    }
  };

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md">
          <CardContent className="py-8 text-center space-y-4">
            <p className="text-muted-foreground">Verificando link de recuperação...</p>
            <p className="text-xs text-muted-foreground">
              Se esta tela persistir, o link pode ter expirado.{' '}
              <a href="/recuperar-senha" className="text-primary hover:underline">
                Solicitar novo link
              </a>
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="font-display text-2xl">Nova senha</CardTitle>
          <CardDescription>Defina sua nova senha (mínimo 10 caracteres)</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Nova senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input type="password" value={password} onChange={e => setPassword(e.target.value)} className="pl-10" placeholder="Mínimo 10 caracteres" />
              </div>
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
              {loading ? 'Atualizando...' : 'Atualizar senha'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
