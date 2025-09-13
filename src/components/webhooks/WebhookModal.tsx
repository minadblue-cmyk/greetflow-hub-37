import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  getWebhookSettings, 
  saveWebhookSettings, 
  resetWebhookSettings, 
  testWebhookUrl 
} from '@/utils/webhooks';
import { DEFAULT_WEBHOOKS } from '@/constants/webhooks.constants';
import { useToast } from '@/hooks/use-toast';
import { Search, RefreshCw, TestTube, Save, RotateCcw, Loader2 } from 'lucide-react';

interface WebhookModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WebhookModal({ open, onOpenChange }: WebhookModalProps) {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [testingUrl, setTestingUrl] = useState<string | null>(null);
  
  const { toast } = useToast();

  // Load settings on mount
  useEffect(() => {
    if (open) {
      const currentSettings = getWebhookSettings();
      // Merge with defaults to ensure all keys are present
      const mergedSettings = { ...DEFAULT_WEBHOOKS, ...currentSettings };
      setSettings(mergedSettings);
    }
  }, [open]);

  // Filter webhooks based on search
  const filteredWebhooks = Object.keys(settings).filter(id =>
    id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    settings[id].toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSettingChange = (id: string, url: string) => {
    setSettings(prev => ({ ...prev, [id]: url }));
  };

  const handleSave = () => {
    setIsLoading(true);
    try {
      saveWebhookSettings(settings);
      toast({
        title: 'Configurações salvas',
        description: 'As configurações de webhook foram salvas com sucesso.',
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Erro ao salvar',
        description: 'Ocorreu um erro ao salvar as configurações.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    resetWebhookSettings();
    const defaultSettings = { ...DEFAULT_WEBHOOKS };
    setSettings(defaultSettings);
    toast({
      title: 'Configurações resetadas',
      description: 'As configurações foram resetadas para os valores padrão.',
    });
  };

  const handleTest = async (id: string, url: string) => {
    if (!url.trim()) {
      toast({
        title: 'URL vazia',
        description: 'Informe uma URL para testar.',
        variant: 'destructive',
      });
      return;
    }

    setTestingUrl(id);
    try {
      const result = await testWebhookUrl(url);
      
      if (result.success) {
        toast({
          title: 'Teste bem-sucedido',
          description: `Webhook testado com sucesso. Status: ${result.response?.status}`,
        });
      } else {
        toast({
          title: 'Teste falhou',
          description: result.error || 'Erro desconhecido',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Erro no teste',
        description: 'Ocorreu um erro ao testar o webhook.',
        variant: 'destructive',
      });
    } finally {
      setTestingUrl(null);
    }
  };

  const getWebhookCategory = (id: string): string => {
    if (id.includes('company') || id.includes('empresa')) return 'Empresas';
    if (id.includes('user') || id.includes('usuario')) return 'Usuários';
    if (id.includes('profile') || id.includes('perfil')) return 'Perfis';
    if (id.includes('dashboard')) return 'Dashboard';
    if (id.includes('upload') || id.includes('excel')) return 'Upload';
    if (id.includes('agent') || id.includes('lead')) return 'Agente';
    if (id.includes('greeting') || id.includes('saudacao')) return 'Saudações';
    if (id.includes('forgot') || id.includes('senha')) return 'Config';
    return 'Outros';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Configurar Webhooks
          </DialogTitle>
          <DialogDescription>
            Configure as URLs dos webhooks para integração com sistemas externos.
            Os webhooks são resolvidos na ordem: localStorage → padrões → sinônimos.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar webhook..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Webhook List */}
          <ScrollArea className="h-[400px] border rounded-lg p-4">
            <div className="space-y-4">
              {filteredWebhooks.map((id) => {
                const category = getWebhookCategory(id);
                const url = settings[id] || '';
                
                return (
                  <div key={id} className="space-y-2 p-4 border rounded-lg hover:bg-accent/20 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Label className="font-medium">{id}</Label>
                        <Badge variant="secondary" className="text-xs">
                          {category}
                        </Badge>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleTest(id, url)}
                        disabled={!url.trim() || testingUrl === id}
                        className="h-8"
                      >
                        {testingUrl === id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <TestTube className="h-3 w-3" />
                        )}
                        Testar
                      </Button>
                    </div>
                    
                    <Input
                      placeholder="https://exemplo.com/webhook"
                      value={url}
                      onChange={(e) => handleSettingChange(id, e.target.value)}
                      className="text-sm"
                    />
                  </div>
                );
              })}
              
              {filteredWebhooks.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  Nenhum webhook encontrado para "{searchTerm}"
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Actions */}
          <div className="flex justify-between pt-4 border-t">
            <Button
              variant="outline"
              onClick={handleReset}
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Resetar
            </Button>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={handleSave}
                disabled={isLoading}
                className="button-primary flex items-center gap-2"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Salvar
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}