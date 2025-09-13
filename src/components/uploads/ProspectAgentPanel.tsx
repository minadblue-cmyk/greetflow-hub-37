import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Square, AlertCircle, Activity, Users } from 'lucide-react';
import { getWebhookUrl } from '@/utils/webhooks';
import { useToast } from '@/hooks/use-toast';

type AgentStatus = 'running' | 'stopped' | 'unknown';

interface ProspectAgentPanelProps {
  fileId?: string;
}

export function ProspectAgentPanel({ fileId }: ProspectAgentPanelProps) {
  const [status, setStatus] = useState<AgentStatus>('unknown');
  const [processed, setProcessed] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  
  const { toast } = useToast();

  const fetchStatus = async () => {
    const webhookUrl = getWebhookUrl('agent-status');
    if (!webhookUrl) return;

    try {
      console.log('[UploadAgent] Fetching status from:', webhookUrl);
      const response = await fetch(webhookUrl);
      const data = await response.json();
      
      console.log('[UploadAgent] Status response:', data);
      
      setStatus(data.status || 'unknown');
      setProcessed(data.processed || 0);
    } catch (error) {
      console.error('[UploadAgent] Error fetching status:', error);
      setStatus('unknown');
    }
  };

  useEffect(() => {
    fetchStatus();
    
    // Poll status every 5 seconds if running
    const interval = setInterval(() => {
      if (status === 'running') {
        fetchStatus();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [status]);

  const handleStart = async () => {
    const webhookUrl = getWebhookUrl('agent-start');
    
    if (!webhookUrl) {
      toast({
        title: 'Webhook não configurado',
        description: 'Configure o webhook agent-start antes de prosseguir.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      console.log('[UploadAgent] Starting agent:', webhookUrl);
      
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileId }),
      });

      const result = await response.json();
      console.log('[UploadAgent] Start response:', result);

      if (result.ok) {
        setStatus('running');
        toast({
          title: 'Agente iniciado',
          description: 'O agente de prospecção foi iniciado com sucesso.',
        });
      } else {
        throw new Error(result.message || 'Erro ao iniciar agente');
      }
    } catch (error) {
      console.error('[UploadAgent] Start error:', error);
      toast({
        title: 'Erro ao iniciar agente',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStop = async () => {
    const webhookUrl = getWebhookUrl('agent-stop');
    
    if (!webhookUrl) {
      toast({
        title: 'Webhook não configurado',
        description: 'Configure o webhook agent-stop antes de prosseguir.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      console.log('[UploadAgent] Stopping agent:', webhookUrl);
      
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileId }),
      });

      const result = await response.json();
      console.log('[UploadAgent] Stop response:', result);

      if (result.ok) {
        setStatus('stopped');
        toast({
          title: 'Agente parado',
          description: 'O agente de prospecção foi parado com sucesso.',
        });
      } else {
        throw new Error(result.message || 'Erro ao parar agente');
      }
    } catch (error) {
      console.error('[UploadAgent] Stop error:', error);
      toast({
        title: 'Erro ao parar agente',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const statusConfig = {
    running: {
      label: 'Rodando',
      variant: 'default' as const,
      className: 'status-running',
      icon: Activity
    },
    stopped: {
      label: 'Parado',
      variant: 'secondary' as const,
      className: 'status-stopped',
      icon: Square
    },
    unknown: {
      label: 'Desconhecido',
      variant: 'outline' as const,
      className: 'status-error',
      icon: AlertCircle
    }
  };

  const currentStatus = statusConfig[status];
  const StatusIcon = currentStatus.icon;

  const webhooksConfigured = !!(
    getWebhookUrl('agent-start') && 
    getWebhookUrl('agent-stop') && 
    getWebhookUrl('agent-status')
  );

  return (
    <Card className="card-gradient">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Agente de Prospecção
        </CardTitle>
        <CardDescription>
          Controle o agente automatizado de prospecção de leads
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Webhook Status */}
        {!webhooksConfigured && (
          <div className="webhook-box">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-warning mt-0.5" />
              <div>
                <p className="text-sm font-medium">Webhooks necessários:</p>
                <ul className="text-xs text-muted-foreground mt-1 space-y-1">
                  <li>• agent-start (POST JSON)</li>
                  <li>• agent-stop (POST JSON)</li>
                  <li>• agent-status (GET)</li>
                  <li>• list-leads (GET) - opcional</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Status Display */}
        <div className="flex items-center justify-between p-4 bg-accent/20 rounded-lg">
          <div className="flex items-center gap-3">
            <StatusIcon className="h-5 w-5" />
            <div>
              <p className="font-medium">Status do Agente</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={currentStatus.variant} className={currentStatus.className}>
                  {currentStatus.label}
                </Badge>
                {processed > 0 && (
                  <span className="text-xs text-muted-foreground">
                    {processed} processados
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-2">
          <Button
            onClick={handleStart}
            disabled={isLoading || status === 'running' || !webhooksConfigured}
            className="button-primary flex-1"
          >
            <Play className="h-4 w-4 mr-2" />
            {isLoading && status !== 'running' ? 'Iniciando...' : 'Iniciar Agente'}
          </Button>
          
          <Button
            onClick={handleStop}
            disabled={isLoading || status === 'stopped' || !webhooksConfigured}
            variant="outline"
            className="flex-1"
          >
            <Square className="h-4 w-4 mr-2" />
            {isLoading && status === 'running' ? 'Parando...' : 'Parar Agente'}
          </Button>
        </div>

        {/* Additional Info */}
        <div className="text-xs text-muted-foreground bg-muted/20 p-3 rounded-lg">
          <p>
            <strong>Funcionamento:</strong> O agente processa os dados da planilha enviada e 
            realiza a prospecção automatizada de leads conforme configuração.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}