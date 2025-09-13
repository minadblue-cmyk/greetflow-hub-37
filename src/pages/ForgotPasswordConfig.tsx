import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { KeyRound, AlertCircle } from 'lucide-react';

export default function ForgotPasswordConfig() {
  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Config. Esqueci a Senha</h1>
        <p className="text-muted-foreground mt-1">
          Configure o fluxo de recuperação de senha
        </p>
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
              <li>• forgot-config-get (GET) - Carregar configurações atuais</li>
              <li>• forgot-config-save (POST) - Salvar configurações</li>
            </ul>
            <div className="mt-3 p-3 bg-muted/20 rounded text-xs">
              <p><strong>Estrutura de configuração:</strong></p>
              <code>{'{ from, templateId, expiresIn, ... }'}</code>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Placeholder Content */}
      <Card className="card-gradient">
        <CardContent className="p-12 text-center">
          <KeyRound className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Configuração de Recuperação</h3>
          <p className="text-muted-foreground mb-4">
            Formulário para configurar o fluxo de "Esqueci a Senha" será implementado aqui.
          </p>
          <p className="text-sm text-muted-foreground">
            Campos típicos: remetente, template, tempo de expiração, etc.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}