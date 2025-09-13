import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { callWebhook } from '@/utils/webhooks';
import { Users, Edit, Trash2, RefreshCw } from 'lucide-react';

interface User {
  id: string;
  email: string;
  nome: string;
  tipo: string;
  ativo: boolean;
  empresa: string;
  empresa_id: string;
  plano: string;
  created_at: string;
}

interface UserListProps {
  onEditUser?: (user: User) => void;
  refreshTrigger?: number;
}

export function UserList({ onEditUser, refreshTrigger = 0 }: UserListProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const loadUsers = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await callWebhook('list-users', {
        method: 'GET',
      });

      if (response.success && response.data) {
        const userData = Array.isArray(response.data) ? response.data : response.data.users || [];
        setUsers(userData);
      } else {
        throw new Error('Erro ao carregar usuários');
      }
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      setError('Erro ao carregar usuários');
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar a lista de usuários.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [refreshTrigger]);

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('pt-BR');
    } catch {
      return dateString;
    }
  };

  const handleDeleteUser = async (userId: string) => {
    // TODO: Implementar delete quando webhook estiver disponível
    toast({
      title: 'Funcionalidade em desenvolvimento',
      description: 'A exclusão de usuários será implementada em breve.',
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Usuários do Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-4 w-[160px]" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Usuários do Sistema
            </div>
            <Button onClick={loadUsers} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Tentar Novamente
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            {error}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Usuários do Sistema ({users.length})
          </div>
          <Button onClick={loadUsers} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          <div className="space-y-4">
            {users.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/20 transition-colors"
              >
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{user.nome}</h4>
                    <Badge variant={user.ativo ? 'default' : 'secondary'}>
                      {user.ativo ? 'Ativo' : 'Inativo'}
                    </Badge>
                    <Badge variant="outline">{user.tipo}</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>Email: {user.email}</p>
                    <p>Empresa: {user.empresa}</p>
                    <p>Plano: {user.plano}</p>
                    <p>Criado em: {formatDate(user.created_at)}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => onEditUser?.(user)}
                    variant="outline"
                    size="sm"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={() => handleDeleteUser(user.id)}
                    variant="outline"
                    size="sm"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            
            {users.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                Nenhum usuário encontrado
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}