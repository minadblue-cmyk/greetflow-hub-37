import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquare, Save, Trash2, Send, AlertCircle, Smile } from 'lucide-react';
import { getWebhookUrl } from '@/utils/webhooks';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

/** ----------------- Helpers ----------------- **/

// Emojis mais usados no WhatsApp e relacionados a dinheiro
const COMMON_EMOJIS = {
  whatsapp: ['😊', '😂', '🤣', '😍', '😘', '😉', '😎', '🥰', '😇', '🤗', '👍', '👏', '🙌', '👌', '💪', '🤝', '❤️', '💕', '💖', '💯', '🔥', '⭐', '✨', '👋', '🙋‍♀️', '🙋‍♂️'],
  money: ['💰', '💵', '💴', '💶', '💷', '💸', '💳', '💎', '📈', '📊', '🏆', '🎯', '💹', '🤑', '💲', '🏪', '🏢', '📋', '📝', '✅']
};

// Normaliza números vindos como string/number; retorna null se inválido
const parseNum = (v: any) => {
  const n = typeof v === 'string' ? parseInt(v, 10) : v;
  return Number.isFinite(n) ? n : null;
};

// Lê usuário salvo no localStorage (fallback)
const getStoredUser = () => {
  try {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

// Consolida os dados de usuário (contexto -> localStorage -> fallback)
// Garante id/usuario_id sempre numéricos (fallback Date.now())
const resolveUserInfo = (uFromCtx?: any) => {
  const u = uFromCtx ?? getStoredUser() ?? {};
  const id =
    parseNum(u?.id) ??
    parseNum(u?.usuario_id) ??
    parseNum(u?.user_id) ??
    Date.now();

  return {
    id,
    usuario_id: id,
    nome: u?.nome ?? u?.name ?? 'Usuário',
    email: u?.email ?? '',
    tipo: u?.tipo ?? u?.role ?? 'Usuário',
    role: u?.tipo ?? u?.role ?? 'Usuário',
  };
};

// Extrai textos de saudações mesmo quando embrulhados em objetos/arrays
const extractGreetingTexts = (raw: any): string[] => {
  // Se vier string JSON, tenta parsear
  if (typeof raw === 'string') {
    try { return extractGreetingTexts(JSON.parse(raw)); } catch { return [raw]; }
  }

  // Arrays: achata e extrai
  if (Array.isArray(raw)) {
    return raw.flatMap(extractGreetingTexts).filter(Boolean);
  }

  // Objetos conhecidos
  if (raw && typeof raw === 'object') {
    // propriedades que podem vir como string JSON
    if (typeof (raw as any).saudacoes === 'string') return extractGreetingTexts((raw as any).saudacoes);
    if (typeof (raw as any).items === 'string') return extractGreetingTexts((raw as any).items);

    if (Array.isArray((raw as any).saudacoes)) return extractGreetingTexts((raw as any).saudacoes);
    if (Array.isArray((raw as any).items))      return extractGreetingTexts((raw as any).items);

    if (typeof (raw as any).saudacao === 'string') return [(raw as any).saudacao];
    if (typeof (raw as any).texto === 'string')    return [(raw as any).texto];
  }

  return [];
};

// Representa uma saudação carregada da API, preservando ID quando houver
type SavedGreetingItem = { id?: number; text: string; raw?: any };

function normalizeGreetingItems(raw: any): SavedGreetingItem[] {
  const items: SavedGreetingItem[] = [];

  const getId = (obj: any) => {
    const keys = ['id','saudacao_id','saudacaoId','id_saudacao','idx','index','codigo','code'];
    for (const k of keys) {
      const n = parseNum(obj?.[k]);
      if (n) return n;
    }
    return undefined;
  };

  const getText = (obj: any): string => {
    if (typeof obj === 'string') return obj;
    const t = obj?.saudacao ?? obj?.texto ?? obj?.text ?? obj?.message ?? obj?.mensagem;
    return typeof t === 'string' ? t : JSON.stringify(obj);
  };

  const walk = (val: any) => {
    if (val == null) return;
    if (typeof val === 'string') { try { walk(JSON.parse(val)); } catch { items.push({ text: val }); } return; }
    if (Array.isArray(val)) { val.forEach(walk); return; }
    if (typeof val === 'object') {
      if (Array.isArray((val as any).saudacoes)) { walk((val as any).saudacoes); return; }
      if (Array.isArray((val as any).items)) { walk((val as any).items); return; }
      if (Array.isArray((val as any).data)) { walk((val as any).data); return; }
      if ('saudacao' in (val as any) || 'texto' in (val as any) || 'message' in (val as any) || 'text' in (val as any) || 'mensagem' in (val as any) || 'id' in (val as any)) {
        items.push({ id: getId(val), text: getText(val), raw: val });
        return;
      }
      Object.values(val).forEach((v) => { if (Array.isArray(v)) walk(v); });
      return;
    }
  };

  walk(raw);
  return items.map((it, idx) => ({ ...it, id: it.id ?? idx + 1 }));
}

/** --------------- Componente ---------------- **/

export function GreetingManager() {
  const [currentGreeting, setCurrentGreeting] = useState('');
  const [savedGreetings, setSavedGreetings] = useState<SavedGreetingItem[]>([]);
  const [selectedGreeting, setSelectedGreeting] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { toast } = useToast();
  const { user } = useAuth();

  // Função para adicionar emoji na posição do cursor
  const addEmojiToGreeting = (emoji: string) => {
    setCurrentGreeting(prev => prev + emoji);
  };

  const fetchGreetings = async () => {
    const ui = resolveUserInfo(user);

    const candidates = [
      'https://n8n-lavo-n8n.15gxno.easypanel.host/webhook/listar-saudacao',
      getWebhookUrl('greeting-list'),
      getWebhookUrl('webhook-lista-saudacoes'),
    ].filter(Boolean) as string[];

    let lastError: unknown = null;

    for (const url of candidates) {
      try {
        const payload = {
          id: ui.id,
          usuario_id: ui.usuario_id,
          nome: ui.nome,
          email: ui.email,
          tipo: ui.tipo,
          role: ui.role,
        };

        console.log('[GreetingsPage] Fetching greetings from:', url);
        console.log('[GreetingsPage] Payload being sent:', payload);

        const res = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          console.warn('[GreetingsPage] Non-OK response:', res.status, res.statusText);
          continue;
        }

        const text = await res.text();
        let data: any;
        try { data = JSON.parse(text); } catch { data = text; }
        console.log('[GreetingsPage] Greetings response:', data);

        const items = normalizeGreetingItems(data);
        setSavedGreetings(items);
        return; // success
      } catch (error) {
        lastError = error;
        console.error('[GreetingsPage] Error fetching greetings from candidate:', url, error);
      }
    }

    console.error('[GreetingsPage] All candidates failed. Last error:', lastError);
    toast({
      title: 'Falha ao carregar saudações',
      description: 'Erro ao buscar saudações do servidor. Verifique a configuração do webhook.',
      variant: 'destructive',
    });
  };

  useEffect(() => {
    fetchGreetings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleSaveGreeting = async () => {
    if (!currentGreeting.trim()) {
      toast({
        title: 'Saudação vazia',
        description: 'Digite uma saudação antes de salvar.',
        variant: 'destructive',
      });
      return;
    }

    const webhookUrl = getWebhookUrl('greeting-save');
    if (!webhookUrl) {
      toast({
        title: 'Webhook não configurado',
        description: 'Configure o webhook greeting-save antes de prosseguir.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const ui = resolveUserInfo(user);
      const payload = {
        id: ui.id,
        usuario_id: ui.usuario_id,
        nome: ui.nome,
        email: ui.email,
        tipo: ui.tipo,
        role: ui.role,
        saudacao: currentGreeting.trim(),
        timestamp: new Date().toISOString(),
      };

      console.log('[GreetingsPage] Saving greeting to:', webhookUrl);
      console.log('[GreetingsPage] Save payload:', payload);

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload),
      });

      console.log('[GreetingsPage] Save response status:', response.status);
      
      let result: any;
      try {
        const text = await response.text();
        console.log('[GreetingsPage] Save response text:', text);
        result = text ? JSON.parse(text) : {};
      } catch {
        result = { success: response.ok };
      }
      
      console.log('[GreetingsPage] Save response parsed:', result);

      // Considera sucesso se: response ok OU result.ok OU result.success OU status 200
      const isSuccess = response.ok || result.ok === true || result.success === true || response.status === 200;
      
      if (isSuccess) {
        toast({ title: 'Saudação salva', description: 'A saudação foi salva com sucesso.' });
        setCurrentGreeting('');
        await fetchGreetings(); // Atualiza a lista
      } else {
        throw new Error(result.message || result.error || 'Erro ao salvar saudação');
      }
    } catch (error) {
      console.error('[GreetingsPage] Save error:', error);
      toast({
        title: 'Erro ao salvar',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyToAgent = async (greeting?: string, saudacaoIdArg?: number) => {
    const greetingToApply = (greeting || currentGreeting || selectedGreeting || '').trim();

    if (!greetingToApply) {
      toast({
        title: 'Nenhuma saudação selecionada',
        description: 'Selecione ou digite uma saudação para aplicar.',
        variant: 'destructive',
      });
      return;
    }

    const webhookUrl = getWebhookUrl('greeting-apply');
    if (!webhookUrl) {
      toast({
        title: 'Webhook não configurado',
        description: 'Configure o webhook greeting-apply antes de prosseguir.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const ui = resolveUserInfo(user);
      
      const saudacaoId = (typeof saudacaoIdArg === 'number' && saudacaoIdArg > 0)
        ? saudacaoIdArg
        : savedGreetings.findIndex(it => it.text === greetingToApply) + 1;
      
      const payload: any = {
        usuario_id: ui.usuario_id,
        agente: 'recebimento',
        saudacao: greetingToApply,
        saudacao_id: saudacaoId || 1,
        id: saudacaoId || 1,
        saudacaoId: saudacaoId || 1,
      };

      console.log('[GreetingsPage] Applying greeting to agent:', webhookUrl);
      console.log('[GreetingsPage] Apply payload:', payload);

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload),
      });

      console.log('[GreetingsPage] Apply response status:', response.status);
      
      let result: any;
      try {
        const text = await response.text();
        console.log('[GreetingsPage] Apply response text:', text);
        result = text ? JSON.parse(text) : {};
      } catch {
        result = { success: response.ok };
      }
      
      console.log('[GreetingsPage] Apply response parsed:', result);

      // Considera sucesso se: response ok OU result.ok OU result.success OU status 200
      const isSuccess = response.ok || result.ok === true || result.success === true || response.status === 200;
      
      if (isSuccess) {
        toast({ title: 'Saudação aplicada', description: 'A saudação foi aplicada ao agente com sucesso.' });
      } else {
        throw new Error(result.message || result.error || 'Erro ao aplicar saudação');
      }
    } catch (error) {
      console.error('[GreetingsPage] Apply error:', error);
      toast({
        title: 'Erro ao aplicar',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteGreeting = async (index: number) => {
    const greeting = savedGreetings[index];
    if (!greeting) return;

    const webhookUrl = getWebhookUrl('greeting-delete');
    if (!webhookUrl) {
      toast({
        title: 'Webhook não configurado',
        description: 'Configure o webhook greeting-delete antes de prosseguir.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const ui = resolveUserInfo(user);
      const payload = {
        id: greeting.id || index + 1,
        usuario_id: ui.usuario_id,
        saudacao_id: greeting.id || index + 1,
        saudacao: greeting.text,
        nome: ui.nome,
        email: ui.email,
        tipo: ui.tipo,
      };

      console.log('[GreetingsPage] Deleting greeting:', webhookUrl);
      console.log('[GreetingsPage] Delete payload:', payload);

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload),
      });

      console.log('[GreetingsPage] Delete response status:', response.status);

      let result: any;
      try {
        const text = await response.text();
        console.log('[GreetingsPage] Delete response text:', text);
        result = text ? JSON.parse(text) : {};
      } catch {
        result = { success: response.ok };
      }

      console.log('[GreetingsPage] Delete response parsed:', result);

      const isSuccess = response.ok || result.ok === true || result.success === true || response.status === 200;
      
      if (isSuccess) {
        toast({ title: 'Saudação removida', description: 'A saudação foi removida com sucesso.' });
        await fetchGreetings(); // Recarrega a lista
      } else {
        throw new Error(result.message || result.error || `HTTP ${response.status}: Erro ao deletar saudação`);
      }
    } catch (error) {
      console.error('[GreetingsPage] Delete error:', error);
      toast({
        title: 'Erro ao deletar',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const webhooksConfigured = !!(
    getWebhookUrl('greeting-save') &&
    getWebhookUrl('greeting-list') &&
    getWebhookUrl('greeting-apply')
  );

  return (
    <div className="space-y-6">
      {/* Webhook Status */}
      {!webhooksConfigured && (
        <Card className="border-warning/20 bg-warning/5">
          <CardContent className="pt-6">
            <div className="webhook-box">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-warning mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Webhooks necessários:</p>
                  <ul className="text-xs text-muted-foreground mt-1 space-y-1">
                    <li>• greeting-save (POST JSON): {'{ saudacao: string }'}</li>
                    <li>• greeting-list (POST): retorna Array&lt;string | {`{ saudacao: string }`}&gt;</li>
                    <li>• greeting-apply (POST JSON): {'{ saudacao: string }'}</li>
                    <li>• greeting-delete (POST JSON): {'{ id: number, saudacao: string }'}</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create New Greeting */}
      <Card className="card-gradient">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Nova Saudação Personalizada
          </CardTitle>
          <CardDescription>
            Crie uma nova mensagem de saudação para o agente de prospecção
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <Textarea
                  placeholder="Digite sua saudação personalizada aqui...&#10;&#10;Exemplo:&#10;Olá [Nome], tudo bem?&#10;&#10;Meu nome é [Seu Nome] e trabalho na [Sua Empresa].&#10;Estou entrando em contato porque..."
                  value={currentGreeting}
                  onChange={(e) => setCurrentGreeting(e.target.value)}
                  className="min-h-[120px] resize-y"
                />
              </div>
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="icon" className="mb-0 shrink-0">
                    <Smile className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-4" side="top">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-sm mb-2">WhatsApp</h4>
                      <div className="grid grid-cols-8 gap-1">
                        {COMMON_EMOJIS.whatsapp.map((emoji, idx) => (
                          <Button
                            key={idx}
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-base hover:bg-accent"
                            onClick={() => addEmojiToGreeting(emoji)}
                          >
                            {emoji}
                          </Button>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-sm mb-2">Negócios</h4>
                      <div className="grid grid-cols-8 gap-1">
                        {COMMON_EMOJIS.money.map((emoji, idx) => (
                          <Button
                            key={idx}
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-base hover:bg-accent"
                            onClick={() => addEmojiToGreeting(emoji)}
                          >
                            {emoji}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleSaveGreeting}
              disabled={isLoading || !currentGreeting.trim() || !webhooksConfigured}
              className="button-primary"
            >
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? 'Salvando...' : 'Salvar Saudação'}
            </Button>

            <Button
              onClick={() => handleApplyToAgent()}
              disabled={isLoading || !currentGreeting.trim() || !webhooksConfigured}
              variant="outline"
            >
              <Send className="h-4 w-4 mr-2" />
              Aplicar ao Agente
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Saved Greetings */}
      <Card className="card-gradient">
        <CardHeader>
          <CardTitle>Saudações Predefinidas</CardTitle>
          <CardDescription>Lista de saudações salvas anteriormente</CardDescription>
        </CardHeader>

        <CardContent>
          <ScrollArea className="h-[300px]">
            {savedGreetings.length > 0 ? (
              <div className="space-y-3">
                {savedGreetings.map((item, index) => (
                  <div
                    key={index}
                    className={`p-4 border rounded-lg hover:bg-accent/20 transition-colors cursor-pointer ${
                      selectedGreeting === item.text ? 'bg-primary/10 border-primary/30' : ''
                    }`}
                    onClick={() => setSelectedGreeting(item.text)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm line-clamp-3">{item.text}</p>
                      </div>

                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            const idNum = typeof item.id === 'number' ? item.id : (parseInt(String(item.id ?? ''), 10) || index + 1);
                            handleApplyToAgent(item.text, idNum);
                          }}
                          disabled={isLoading || !webhooksConfigured}
                          className="h-8"
                        >
                          <Send className="h-3 w-3" />
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteGreeting(index);
                          }}
                          className="h-8 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    {selectedGreeting === item.text && <Badge variant="default" className="mt-2">Selecionada</Badge>}
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-center">
                <div className="space-y-3">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Nenhuma saudação salva</p>
                    <p className="text-xs text-muted-foreground">Crie sua primeira saudação personalizada acima</p>
                  </div>
                </div>
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}