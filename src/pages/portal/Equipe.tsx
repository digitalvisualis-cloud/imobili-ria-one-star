import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const MODULES = [
  { key: 'imoveis', label: 'Imóveis' },
  { key: 'crm', label: 'CRM' },
  { key: 'financeiro', label: 'Financeiro' },
  { key: 'dashboard', label: 'Dashboard' },
] as const;

export default function Equipe() {
  const queryClient = useQueryClient();

  // Get users with portal roles (owner, manager, agent)
  const { data: teamMembers, isLoading } = useQuery({
    queryKey: ['portal-team'],
    queryFn: async () => {
      const { data: roles, error } = await (supabase.from as any)('user_roles')
        .select('user_id, role')
        .in('role', ['owner', 'manager', 'agent']);
      if (error) throw error;

      if (!roles?.length) return [];

      const userIds = roles.map((r: any) => r.user_id);
      const { data: profiles } = await (supabase.from as any)('profiles')
        .select('id, email, full_name')
        .in('id', userIds);

      const { data: permissions } = await (supabase.from as any)('agent_permissions')
        .select('*')
        .in('user_id', userIds);

      return roles.map((r: any) => {
        const profile = profiles?.find((p: any) => p.id === r.user_id);
        const userPerms = permissions?.filter((p: any) => p.user_id === r.user_id) || [];
        return {
          user_id: r.user_id,
          role: r.role,
          email: profile?.email || 'N/A',
          full_name: profile?.full_name || '',
          permissions: userPerms,
        };
      });
    },
  });

  const togglePermission = useMutation({
    mutationFn: async ({ userId, module, field, value }: { userId: string; module: string; field: string; value: boolean }) => {
      // Check if permission row exists
      const { data: existing } = await (supabase.from as any)('agent_permissions')
        .select('id')
        .eq('user_id', userId)
        .eq('module', module)
        .single();

      if (existing) {
        const { error } = await (supabase.from as any)('agent_permissions')
          .update({ [field]: value })
          .eq('id', existing.id);
        if (error) throw error;
      } else {
        const { error } = await (supabase.from as any)('agent_permissions')
          .insert({ user_id: userId, module, [field]: value });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portal-team'] });
      toast.success('Permissão atualizada');
    },
    onError: () => toast.error('Erro ao atualizar permissão'),
  });

  const getPermValue = (member: any, module: string, field: string) => {
    const perm = member.permissions.find((p: any) => p.module === module);
    return perm ? perm[field] : false;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Gestão de Equipe</h1>
        <p className="text-muted-foreground mt-1">Gerencie as permissões de acesso dos membros da equipe</p>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Carregando...</p>
      ) : !teamMembers?.length ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Nenhum membro da equipe encontrado. Adicione usuários com role "manager" ou "agent" para gerenciar permissões.
          </CardContent>
        </Card>
      ) : (
        teamMembers.map((member: any) => (
          <Card key={member.user_id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{member.full_name || member.email}</CardTitle>
                  <CardDescription>{member.email}</CardDescription>
                </div>
                <Badge variant="secondary" className="capitalize">{member.role}</Badge>
              </div>
            </CardHeader>
            {member.role !== 'owner' && (
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Módulo</TableHead>
                      <TableHead className="text-center">Visualizar</TableHead>
                      <TableHead className="text-center">Criar/Editar</TableHead>
                      <TableHead className="text-center">Excluir</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {MODULES.map(mod => (
                      <TableRow key={mod.key}>
                        <TableCell className="font-medium">{mod.label}</TableCell>
                        <TableCell className="text-center">
                          <Switch
                            checked={getPermValue(member, mod.key, 'can_read')}
                            onCheckedChange={v => togglePermission.mutate({ userId: member.user_id, module: mod.key, field: 'can_read', value: v })}
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <Switch
                            checked={getPermValue(member, mod.key, 'can_write')}
                            onCheckedChange={v => togglePermission.mutate({ userId: member.user_id, module: mod.key, field: 'can_write', value: v })}
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <Switch
                            checked={getPermValue(member, mod.key, 'can_delete')}
                            onCheckedChange={v => togglePermission.mutate({ userId: member.user_id, module: mod.key, field: 'can_delete', value: v })}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            )}
          </Card>
        ))
      )}
    </div>
  );
}
