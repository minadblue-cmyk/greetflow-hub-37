import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { WebhookModal } from '@/components/webhooks/WebhookModal';
import { Settings, ExternalLink, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function Webhooks() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const webhookCategories = [
    {
      name: 'Empresas',
      description: 'Webhooks para gerenciamento de empresas',
      endpoints: ['list-company', 'company-create', 'company-update'],
      count: 6
    },
    {
      name: 'Usuários',
      description: 'Webhooks para gerenciamento de usuários',
      endpoints: ['list-users', 'edit-users', 'create-user'],
      count: 7
    },
    {
      name: 'Perfis',
      description: 'Webhooks para sistema de permissões',
      endpoints: ['list-profile', 'profiles-create', 'profiles-update'],
      count: 4
    },
    {
      name: 'Dashboard',
      description: 'Webhooks para dados do dashboard',
      endpoints: ['dashboard-title', 'dashboard_meta'],
      count: 3
    },
    {
      name: 'Upload & Agente',
      description: 'Webhooks para upload e agente de prospecção',
      endpoints: ['upload-excel', 'agent-start', 'agent-status'],
      count: 5
    },
    {
      name: 'Saudações',
      description: 'Webhooks para saudações personalizadas',
      endpoints: ['greeting-save', 'greeting-list', 'greeting-apply'],
      count: 3
    },
    {
      name: 'Configurações',
      description: 'Webhooks para configurações do sistema',
      endpoints: ['forgot-config-save', 'forgot-config-get'],
      count: 2
    }
  ];

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configurar Webhooks</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie as integrações e endpoints do sistema
          </p>
        </div>
        
        <Button 
          onClick={() => setIsModalOpen(true)}
          className="button-primary flex items-center gap-2"
        >
          <Settings className="h-4 w-4" />
          Configurar Webhooks
        </Button>
      </div>

      {/* Info Card */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <Info className="h-5 w-5" />
            Como Funciona
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm">
            O sistema Flow Hub utiliza webhooks configuráveis para integração com sistemas externos.
            Todas as operações (listar usuários, criar empresas, etc.) são realizadas através de chamadas HTTP.
          </p>
          
          <div className="space-y-2">
            <h4 className="font-medium">Ordem de Resolução:</h4>
            <ol className="text-sm space-y-1 pl-4">
              <li>1. Configurações personalizadas (localStorage)</li>
              <li>2. URLs padrão configuradas</li>
              <li>3. Sinônimos por categoria</li>
              <li>4. Retorna undefined (sistema tolera ausência)</li>
            </ol>
          </div>
        </CardContent>
      </Card>

      {/* Categories Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {webhookCategories.map((category, index) => (
          <Card key={index} className="card-gradient hover:shadow-glow transition-all duration-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{category.name}</CardTitle>
                <Badge variant="secondary">{category.count} endpoints</Badge>
              </div>
              <CardDescription>{category.description}</CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">Principais endpoints:</h4>
                <div className="space-y-1">
                  {category.endpoints.map((endpoint, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <ExternalLink className="h-3 w-3 text-muted-foreground" />
                      <code className="text-xs bg-muted px-2 py-1 rounded">
                        {endpoint}
                      </code>
                    </div>
                  ))}
                  {category.count > category.endpoints.length && (
                    <div className="text-xs text-muted-foreground">
                      + {category.count - category.endpoints.length} outros
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Webhook Modal */}
      <WebhookModal 
        open={isModalOpen} 
        onOpenChange={setIsModalOpen} 
      />
    </div>
  );
}