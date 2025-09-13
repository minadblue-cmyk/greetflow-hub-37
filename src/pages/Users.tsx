import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users as UsersIcon, UserPlus, AlertCircle } from 'lucide-react';
import { UserList } from '@/components/users/UserList';
import { CreateUserForm } from '@/components/users/CreateUserForm';
import { EditUserForm } from '@/components/users/EditUserForm';

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

export default function Users() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Usuários</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie usuários do sistema
          </p>
        </div>
        
        <Button 
          className="button-primary"
          onClick={() => setIsCreateModalOpen(true)}
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Criar Usuário
        </Button>
      </div>

      {/* Webhook Requirements */}
      <Card className="border-warning/20 bg-warning/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-warning">
            <AlertCircle className="h-5 w-5" />
            Webhooks Necessários
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p><strong>Para funcionamento completo:</strong></p>
            <ul className="space-y-1 text-muted-foreground">
              <li>• list-users (GET) - Lista todos os usuários</li>
              <li>• users-by-company (GET) - Usuários por empresa</li>
              <li>• edit-users (POST) - Editar usuário</li>
              <li>• create-user (POST) - Criar novo usuário</li>
              <li>• list-company (GET) - Lista empresas para seleção</li>
              <li>• list-profile (GET) - Lista perfis disponíveis</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* User List */}
      <UserList 
        refreshTrigger={refreshTrigger}
        onEditUser={(user) => {
          setSelectedUser(user);
          setIsEditModalOpen(true);
        }}
      />

      {/* Create User Modal */}
      <CreateUserForm
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onUserCreated={() => {
          setRefreshTrigger(prev => prev + 1);
        }}
      />

      {/* Edit User Modal */}
      <EditUserForm
        user={selectedUser}
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        onUserUpdated={() => {
          setRefreshTrigger(prev => prev + 1);
        }}
      />
    </div>
  );
}