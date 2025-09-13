import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Plus, AlertCircle } from 'lucide-react';

export default function Companies() {
  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Empresas</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie empresas cadastradas no sistema
          </p>
        </div>
        
        <Button className="button-primary">
          <Plus className="h-4 w-4 mr-2" />
          Criar Empresa
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
              <li>• list-company (GET) - Lista todas as empresas</li>
              <li>• company-create (POST) - Criar nova empresa</li>
              <li>• company-update (POST) - Atualizar empresa existente</li>
            </ul>
            <div className="mt-3 p-3 bg-muted/20 rounded text-xs">
              <p><strong>Payload para company-create:</strong></p>
              <code>{'{ nome_empresa, cnpj, email, telefone, endereco, descricao }'}</code>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Placeholder Content */}
      <Card className="card-gradient">
        <CardContent className="p-12 text-center">
          <Building2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Sistema de Empresas</h3>
          <p className="text-muted-foreground mb-4">
            Os componentes CompanyList e CreateCompanyForm serão implementados aqui.
          </p>
          <p className="text-sm text-muted-foreground">
            Configure os webhooks necessários para ativar a funcionalidade completa.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}