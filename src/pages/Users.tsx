import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users as UsersIcon, UserPlus, AlertCircle } from 'lucide-react';

export default function Users() {
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
        
        <Button className="button-primary">
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

      {/* Placeholder Content */}
      <Card className="card-gradient">
        <CardContent className="p-12 text-center">
          <UsersIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Sistema de Usuários</h3>
          <p className="text-muted-foreground mb-4">
            Os componentes UserList, UserProfileDialog e CreateUserForm serão implementados aqui.
          </p>
          <p className="text-sm text-muted-foreground">
            Configure os webhooks necessários para ativar a funcionalidade completa.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}