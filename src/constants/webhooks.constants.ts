// src/constants/webhooks.constants.ts
export interface WebhookCfg {
  id: string;
  name: string;
  url: string;
}

/**
 * Padrão inicial (fallback). A UI de "Configurar Webhooks" pode sobrescrever via localStorage.webhookSettings.
 * OBS: Mantenho os IDs exatamente como você usa hoje.
 */
export const WEBHOOKS: WebhookCfg[] = [
  { id:'webhook-saudacao',                  name:'Webhook Saudação',                         url:'https://n8n-lavo-n8n.15gxno.easypanel.host/webhook/atualiza-saudacao' },
  { id:'webhook-salvar-saudacao',           name:'Webhook Salvar Saudação',                  url:'https://n8n-lavo-n8n.15gxno.easypanel.host/webhook/salvar-saudacao' },
  { id:'webhook-lista-saudacoes',           name:'Webhook Lista de Saudações',               url:'https://n8n-lavo-n8n.15gxno.easypanel.host/webhook/salvar-lista-saudacoes' },
  { id:'webhook-listar-saudacao',           name:'Webhook Listar Saudação',                  url:'https://n8n-lavo-n8n.15gxno.easypanel.host/webhook/listar-saudacao' },
  { id:'webhook-agente-recebimento',        name:'Webhook Agente de Recebimento',            url:'https://n8n-lavo-n8n.15gxno.easypanel.host/webhook/seleciona-saudacao' },
  { id:'webhook-agente-prospeccao-quente',  name:'Webhook Agente de Prospecção Lead Quente', url:'https://n8n-lavo-n8n.15gxno.easypanel.host/webhook/agente-prospeccao-quente' },
  
  { id:'webhook-criar-usuario',             name:'Webhook Criar Usuário',                    url:'https://n8n-lavo-n8n.15gxno.easypanel.host/webhook/create-user' },
  { id:'webhook-criar-empresa',             name:'Webhook Criar Empresa',                    url:'https://n8n-lavo-n8n.15gxno.easypanel.host/webhook/create-company' },
  { id:'webhook-editar-empresa',            name:'Webhook Editar Empresa',                   url:'https://n8n-lavo-n8n.15gxno.easypanel.host/webhook/edit-company' },
  { id:'webhook-editar-usuarios',           name:'Webhook Editar Usuários',                  url:'https://n8n-lavo-n8n.15gxno.easypanel.host/webhook/edit-users' },
  { id:'list-users',                        name:'Webhook Listar Usuários',                  url:'https://n8n-lavo-n8n.15gxno.easypanel.host/webhook/list-users' },
  { id:'list-company',                      name:'Webhook Listar Empresas',                  url:'https://n8n-lavo-n8n.15gxno.easypanel.host/webhook/list-company' },
 
   { id:'webhook-reset-password',            name:'Webhook Reset Password',                   url:'https://n8n-lavo-n8n.15gxno.easypanel.host/webhook/reset-password' },
  { id:'webhook-atualizar-data-vencimento', name:'Webhook Atualizar Data de Vencimento',     url:'https://n8n-lavo-n8n.15gxno.easypanel.host/webhook/update-due-date' },

  { id:'webhook-lista-prospeccao',          name:'Webhook Lista Prospecção (Leads)',         url:'https://n8n-lavo-n8n.15gxno.easypanel.host/webhook/lista-prospeccao' },
  { id:'webhook-remover-ultima-base',       name:'Webhook Remover Última Base Inserida',     url:'https://n8n-lavo-n8n.15gxno.easypanel.host/webhook/remove-last-base' },
  { id:'webhook-upload',                   name:'Webhook Upload (Insert Excel)',           url:'https://n8n-lavo-n8n.15gxno.easypanel.host/webhook/upload' },

  { id:'webhook-deletar-saudacao',          name:'Webhook Deletar Saudação',                 url:'https://n8n-lavo-n8n.15gxno.easypanel.host/webhook/deletar-saudacao' },
  { id:'webhook-lead-updates',              name:'Webhook Atualizações de Leads (N8N→Frontend)', url:'https://webhook.site/4a8b9c1d-e2f3-4567-8901-23456789abcd' },
  { id:'webhook-n8n-control',               name:'Webhook Controle N8N (lead-update)',       url:'https://n8n-lavo-n8n.15gxno.easypanel.host/webhook/lead-update' },
  { id:'webhook-controle-agente',           name:'Webhook Controle do Agente',               url:'https://n8n-lavo-n8n.15gxno.easypanel.host/webhook/controle-do-agente' },

  { id:'webhook-criar-perfil',              name:'Webhook Criar Perfil',                     url:'https://n8n-lavo-n8n.15gxno.easypanel.host/webhook/create-profile' },
  { id:'webhook-editar-perfil',             name:'Webhook Editar Perfil',                    url:'https://n8n-lavo-n8n.15gxno.easypanel.host/webhook/edit-profile' },
  { id:'webhook-listar-perfil',             name:'Webhook Listar Perfil',                    url:'https://n8n-lavo-n8n.15gxno.easypanel.host/webhook/list-profile' },
  { id:'webhook-deletar-perfil',            name:'Webhook Deletar Perfil',                   url:'https://n8n-lavo-n8n.15gxno.easypanel.host/webhook/delete-profile' },
  { id:'delete-users',                      name:'Webhook Deletar Usuário',                 url:'https://n8n-lavo-n8n.15gxno.easypanel.host/webhook/delete-users' },

  { id:'webhook-login',                     name:'Webhook Login',                            url:'https://n8n-lavo-n8n.15gxno.easypanel.host/webhook/login' },
  { id:'webhook-me',                        name:'Webhook Me',                               url:'https://n8n-lavo-n8n.15gxno.easypanel.host/webhook/me' },
];

// Legacy format for backward compatibility
export const DEFAULT_WEBHOOKS: Record<string, string> = WEBHOOKS.reduce((acc, webhook) => {
  acc[webhook.id] = webhook.url;
  return acc;
}, {} as Record<string, string>);

// Synonym mappings for fallback resolution
export const WEBHOOK_SYNONYMS: Record<string, string[]> = {
  // Empresas
  companies: ['list-company'],
  
  // Usuários
  users: ['list-users'],
  'users-by-company': ['webhook-usuarios-empresa'],
  'edit-users': ['webhook-editar-usuarios', 'webhook-atualizar-usuario', 'update-user-info'],
  
  // Perfis
  profiles: ['webhook-listar-perfil', 'list-profile'],
  
  // Dashboard
  dashboard: ['dashboard-title', 'dashboard_meta', 'webhook-dashboard-title'],
  
  // Upload
  upload: ['webhook-uoload', 'upload-excel'],
  
  // Agente
  agent: ['webhook-agente-prospeccao-quente-2', 'webhook-controle-agente', 'agent-start', 'agent-stop', 'agent-status', 'list-leads'],
  
  // Saudações
  greetings: ['webhook-saudacao', 'webhook-salvar-saudacao', 'webhook-lista-saudacoes', 'webhook-agente-recebimento', 'greeting-save', 'greeting-list', 'greeting-apply'],
  
  // Config
  'forgot-password': ['forgot-config-save', 'forgot-config-get'],
};
