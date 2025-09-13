// src/utils/webhooks.ts
import { WEBHOOKS } from '@/constants/webhooks.constants';

export type WebhookId = (typeof WEBHOOKS)[number]['id'] | string;

/**
 * Sinônimos aceitos (para compatibilidade com IDs antigos/variantes).
 * getWebhookUrl procura pelo id pedido e por todos os aliases desta tabela.
 */
const ALIASES: Record<string, string[]> = {
  // Empresas
  'list-company': ['List Company', 'webhook-listar-empresas', 'companies'],
  // Perfis
  'list-profile': ['webhook-listar-perfil', 'profiles'],
  // Usuários
  'list-users': ['webhook-listar-usuarios', 'users'],
  'users-by-company': ['webhook-usuarios-empresa'],
  // Edição usuário
  'edit-users': ['webhook-editar-usuarios', 'webhook-atualizar-usuario', 'update-user-info'],
  // Upload / Leads / Mercado
  'mercado': ['webhook-mercado'],
  'remove-last-base': ['webhook-remover-ultima-base'],
  'lista-prospeccao': ['webhook-lista-prospeccao'],
  // Agente
  'agente-quente-2': ['webhook-agente-prospeccao-quente-2','webhook-agente-prospeccao-quente'],
  'agente-stop': ['webhook-controle-agente'],
  // Saudação
  'greeting-save': ['webhook-saudacao'],
  'greeting-list': ['webhook-listar-saudacao'],
  'greeting-delete': ['webhook-deletar-saudacao'],
  'greeting-apply': ['webhook-agente-recebimento'],
  // Auth
  'login': ['webhook-login'],
  'me': ['webhook-me'],
};

function fromLocalStorage(id: string): string | undefined {
  try {
    const raw = localStorage.getItem('webhookSettings');
    if (!raw) return undefined;
    const obj = JSON.parse(raw) as Record<string, string>;
    if (obj[id]) return obj[id];
    // tenta aliases
    for (const [key, list] of Object.entries(ALIASES)) {
      if (key === id || list.includes(id)) {
        if (obj[key]) return obj[key];
        for (const alias of list) if (obj[alias]) return obj[alias];
      }
    }
    return undefined;
  } catch {
    return undefined;
  }
}

function fromConstants(id: string): string | undefined {
  const direct = WEBHOOKS.find(w => w.id === id)?.url;
  if (direct) return direct;
  // tenta por alias
  for (const [key, list] of Object.entries(ALIASES)) {
    if (key === id || list.includes(id)) {
      const viaKey = WEBHOOKS.find(w => w.id === key)?.url;
      if (viaKey) return viaKey;
      for (const alias of list) {
        const viaAlias = WEBHOOKS.find(w => w.id === alias)?.url;
        if (viaAlias) return viaAlias;
      }
    }
  }
  return undefined;
}

/**
 * Resolve a URL de webhook por id ou alias.
 * Ordem: localStorage → constants → undefined
 */
export function getWebhookUrl(id: WebhookId): string | undefined {
  const reqId = String(id);
  const override = fromLocalStorage(reqId);
  if (override) {
    console.log('[Webhooks.getWebhookUrl] requestId:', reqId, '→ override(localStorage):', override);
    return override;
  }
  const fallback = fromConstants(reqId);
  console.log('[Webhooks.getWebhookUrl] requestId:', reqId, '→ fallback(constants):', fallback ?? 'undefined');
  return fallback;
}

/**
 * Save webhook settings to localStorage
 */
export function saveWebhookSettings(settings: Record<string, string>): void {
  try {
    localStorage.setItem('webhookSettings', JSON.stringify(settings));
    console.log('[Webhooks.saveWebhookSettings] Settings saved:', settings);
  } catch (error) {
    console.error('[Webhooks.saveWebhookSettings] Error saving settings:', error);
  }
}

/**
 * Get all webhook settings from localStorage
 */
export function getWebhookSettings(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem('webhookSettings') || '{}');
  } catch (error) {
    console.error('[Webhooks.getWebhookSettings] Error loading settings:', error);
    return {};
  }
}

/**
 * Reset webhook settings to defaults
 */
export function resetWebhookSettings(): void {
  try {
    const defaultSettings = WEBHOOKS.reduce((acc, webhook) => {
      acc[webhook.id] = webhook.url;
      return acc;
    }, {} as Record<string, string>);
    localStorage.setItem('webhookSettings', JSON.stringify(defaultSettings));
    console.log('[Webhooks.resetWebhookSettings] Settings reset to defaults');
  } catch (error) {
    console.error('[Webhooks.resetWebhookSettings] Error resetting settings:', error);
  }
}

/**
 * Call webhook with data and return response
 */
export async function callWebhook(
  id: WebhookId, 
  options: { method?: string; body?: string; headers?: Record<string, string> } = {}
): Promise<{ success: boolean; data?: any; error?: string; status?: number }> {
  const url = getWebhookUrl(id);
  
  if (!url) {
    console.error(`[Webhooks.callWebhook] No URL found for webhook: ${id}`);
    return {
      success: false,
      error: `Webhook ${id} não está configurado`
    };
  }

  try {
    console.log(`[Webhooks.callWebhook] Calling ${id} (${url}):`, options);
    
    const response = await fetch(url, {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      body: options.body
    });

    const responseText = await response.text();
    let data: any;
    
    try {
      data = responseText ? JSON.parse(responseText) : {};
    } catch {
      data = { message: responseText };
    }

    console.log(`[Webhooks.callWebhook] Response from ${id}:`, {
      status: response.status,
      ok: response.ok,
      data
    });

    return {
      success: response.ok,
      data,
      status: response.status,
      error: !response.ok ? `HTTP ${response.status}: ${data.message || responseText}` : undefined
    };
  } catch (error) {
    console.error(`[Webhooks.callWebhook] Error calling ${id}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
  }
}

/**
 * Test webhook URL with simple GET request
 */
export async function testWebhookUrl(url: string): Promise<{ success: boolean; response?: any; error?: string }> {
  try {
    console.log(`[Webhooks.testWebhookUrl] Testing: ${url}`);
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    
    const data = await response.text();
    console.log(`[Webhooks.testWebhookUrl] Response:`, { status: response.status, data });
    
    return {
      success: response.ok,
      response: { status: response.status, data }
    };
  } catch (error) {
    console.error(`[Webhooks.testWebhookUrl] Error testing ${url}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}