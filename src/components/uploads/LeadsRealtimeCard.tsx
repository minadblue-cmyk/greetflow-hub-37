import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RefreshCw, Users, ExternalLink, AlertCircle } from 'lucide-react';
import { getWebhookUrl } from '@/utils/webhooks';

interface Lead {
  id: string | number;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  status?: string;
  createdAt?: string;
}

export function LeadsRealtimeCard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchLeads = async () => {
    const webhookUrl = getWebhookUrl('list-leads');
    if (!webhookUrl) {
      console.log('[LeadsRealtimeCard] No webhook configured for list-leads');
      return;
    }

    setIsLoading(true);

    try {
      console.log('[LeadsRealtimeCard] Fetching leads from:', webhookUrl);
      const response = await fetch(webhookUrl);
      const data = await response.json();
      
      console.log('[LeadsRealtimeCard] Leads response:', data);
      
      // Normalize response (array or object with items)
      const leadsArray = Array.isArray(data) ? data : (data.items || []);
      setLeads(leadsArray);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('[LeadsRealtimeCard] Error fetching leads:', error);
      setLeads([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchLeads, 30000);
    return () => clearInterval(interval);
  }, []);

  const webhookConfigured = !!getWebhookUrl('list-leads');

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <Card className="card-gradient">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Leads Prospectados
            </CardTitle>
            <CardDescription>
              Acompanhe os leads gerados pelo agente em tempo real
            </CardDescription>
          </div>
          
          <Button
            size="sm"
            variant="outline"
            onClick={fetchLeads}
            disabled={isLoading || !webhookConfigured}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Webhook Status */}
        {!webhookConfigured && (
          <div className="webhook-box">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-warning mt-0.5" />
              <div>
                <p className="text-sm font-medium">Webhook necessário:</p>
                <ul className="text-xs text-muted-foreground mt-1">
                  <li>• list-leads (GET) - retorna array de leads</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center justify-between p-3 bg-accent/20 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
              <Users className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">{leads.length} leads encontrados</p>
              {lastUpdate && (
                <p className="text-xs text-muted-foreground">
                  Atualizado às {formatTime(lastUpdate)}
                </p>
              )}
            </div>
          </div>
          
          {leads.length > 0 && (
            <Badge variant="default" className="status-running">
              Ativo
            </Badge>
          )}
        </div>

        {/* Leads List */}
        <ScrollArea className="h-[300px] border rounded-lg p-2">
          {leads.length > 0 ? (
            <div className="space-y-2">
              {leads.map((lead, index) => (
                <div key={lead.id || index} className="flex items-center justify-between p-3 bg-accent/10 rounded-lg hover:bg-accent/20 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{lead.name}</p>
                    <div className="text-xs text-muted-foreground space-y-1">
                      {lead.email && <p>📧 {lead.email}</p>}
                      {lead.phone && <p>📱 {lead.phone}</p>}
                      {lead.company && <p>🏢 {lead.company}</p>}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {lead.status && (
                      <Badge variant="outline" className="text-xs">
                        {lead.status}
                      </Badge>
                    )}
                    <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-center">
              <div className="space-y-3">
                <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mx-auto">
                  <Users className="h-8 w-8 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Nenhum lead encontrado
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Os leads aparecerão aqui quando o agente começar a trabalhar
                  </p>
                </div>
              </div>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}