import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Plus, AlertCircle } from 'lucide-react';

export default function Permissions() {
  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gerenciar Permissões</h1>
          <p className="text-muted-foreground mt-1">
            Configure perfis e permissões do sistema
          </p>
        </div>
        
        <Button className="button-primary">
          <Plus className="h-4 w-4 mr-2" />
          Criar Perfil
        </Button>
      </div>

      {/* Webhook Requirements */}
      <Card className="border-warning/20 bg-warning/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-warning">
            <AlertCircle className="h-5 w-5" />
            Webhooks para Sistema de Permissões
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p><strong>Para funcionamento completo:</strong></p>
            <ul className="space-y-1 text-muted-foreground">
              <li>• list-profile (GET) - Lista todos os perfis</li>
              <li>• profiles-create (POST) - Criar novo perfil</li>
              <li>• profiles-update (POST) - Atualizar perfil existente</li>
              <li>• profiles-delete (POST) - Excluir perfil</li>
            </ul>
            <div className="mt-3 p-3 bg-muted/20 rounded text-xs">
              <p><strong>Estrutura esperada do perfil:</strong></p>
              <code>{'{ id, nome_perfil|nome|name, descricao?, permissions? }'}</code>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Placeholder Content */}
      <Card className="card-gradient">
        <CardContent className="p-12 text-center">
          <Shield className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Sistema de Permissões</h3>
          <p className="text-muted-foreground mb-4">
            O componente ProfilesPage será implementado aqui com tabela de perfis,
            criação, edição e exclusão de perfis com suas respectivas permissões.
          </p>
          <p className="text-sm text-muted-foreground">
            Configure os webhooks necessários para ativar a funcionalidade completa.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}