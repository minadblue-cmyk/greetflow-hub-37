// src/utils/webhook-contracts.ts
/**
 * Contratos (payloads esperados) e exemplos de resposta por webhook.
 * Tudo tipado para você reutilizar nos fetchers/validações.
 */

export type ISODate = string;

export type LeadRow = Record<string, any> & {
  Nome?: string; Telefone?: string;
};

export interface LoggedUser {
  id: number;
  name: string;
  email: string;
}

/* ────────────────────────────────────────────────────────────────────────────
 * EMPRESAS
 * ──────────────────────────────────────────────────────────────────────────── */
export interface CreateCompanyReq {
  nome: string;
  cnpj: string;
  endereco?: string;
  telefone?: string;
  email?: string;
  descricao?: string;
  action: 'create_company';
}
export interface EditCompanyReq {
  id: string | number;
  nome: string;
  cnpj: string;
  endereco?: string;
  telefone?: string;
  email?: string;
  descricao?: string;
  action: 'edit_company';
}
export interface CompanyRes {
  ok?: boolean;
  id?: number | string;
  nome?: string;
}

/* ────────────────────────────────────────────────────────────────────────────
 * LOGIN / SESSÃO
 * ──────────────────────────────────────────────────────────────────────────── */
export interface LoginReq {
  email: string;
  senha: string;
}
export interface LoginRes {
  ok: boolean;
  usuario_id?: number;
  nome?: string;
  email?: string;
  tipo?: string;
  role?: string;
  token?: string;
}
export interface MeRes {
  ok: boolean;
  usuario_id: number;
  nome: string;
  email: string;
  tipo?: string;
  role?: string;
}

/* ────────────────────────────────────────────────────────────────────────────
 * USUÁRIOS
 * ──────────────────────────────────────────────────────────────────────────── */
export interface ListUsersReq {
  action: 'list_users';
  timestamp: ISODate;
  source: string; // 'user_management_settings'
}
export interface CreateUserReq {
  email: string;
  senha: string;
  nome: string;
  tipo?: string;
  ativo?: boolean;
}
export interface EditUserReq {
  action: 'update_user_info';
  userId: number;
  nome: string;
  email: string;
  perfil: string | 'empty';
  profileId: number | null;
  empresaId: number | null;
  ativo: boolean;
  senha: string | null;
  TipoPlano: string | null;
  permissoes: string[]; // empty array = []
  tipo?: string; // ex: 'supervisor'
}
export interface UserRes {
  ok?: boolean;
  id?: number;
  usuario_id?: number;
  nome?: string;
  email?: string;
  tipo?: string;
  ativo?: boolean;
  perfil?: string;
  profile_id?: number | null;
  empresa?: { id?: number; nome?: string } | null;
}

/* ────────────────────────────────────────────────────────────────────────────
 * PERFIS / PERMISSÕES
 * ──────────────────────────────────────────────────────────────────────────── */
export interface CreateProfileReq {
  name: string;
  description?: string;
  permissions: string[]; // ['upload_files','nav_greetings',...]
  action: 'create_profile';
}
export interface EditProfileReq {
  profileId: number;
  name?: string;
  description?: string;
  permissions?: string[];
  action: 'edit_profile';
}
export interface DeleteProfileReq {
  profileId: number;
  action: 'delete_profile';
}
export interface ProfileItem {
  id: number;
  nome_perfil?: string;
  name?: string;
  description?: string;
  permissions?: string[];
}
export interface ProfilesRes {
  items?: ProfileItem[];
  data?: ProfileItem[];
  length?: number;
}

/* ────────────────────────────────────────────────────────────────────────────
 * SAUDAÇÕES
 * ──────────────────────────────────────────────────────────────────────────── */
export interface GreetingDeleteReq {
  id: number;           // id do usuário
  usuario_id: number;
  nome: string;
  email: string;
  tipo: string;
  role: string;
  saudacoes: { id: number; texto: string }[];
}
export interface GreetingInsertReq {
  id: number;           // id do usuário
  usuario_id: number;
  nome: string;
  email: string;
  tipo: string;         // 'admin'
  role: string;         // 'admin'
  plano?: string;       // 'Básico'
  saudacao: string;     // texto
  timestamp: ISODate;
}
export interface GreetingListReq {
  id: number;
  usuario_id: number;
  nome: string;
  email: string;
  tipo: string;
  role: string;
}
export interface GreetingApplyReq {
  usuario_id: number;
  agente: 'recebimento' | string;
  saudacao_id: number;
}

/* ────────────────────────────────────────────────────────────────────────────
 * UPLOAD (EXCEL) / MERCADO
 * ──────────────────────────────────────────────────────────────────────────── */
export interface InsertMercadoReq {
  data: LeadRow[];
  fileName: string;
  targetDatabase: 'mercado_x' | 'mercado_y' | string;
  flagsSelecionadas?: { value: string; webhook: string }[];
  logged_user: LoggedUser;
}
export interface RemoveLastBaseReq {
  insertId: string | number;
  table: string; // 'mercado_x'
  logged_user: LoggedUser;
}
export interface LeadsListRes {
  leads?: Array<{
    lead_id?: string;
    nome: string;
    telefone: string;
    status?: 'Prospectando'|'Completed'|'prospectando'|'concluido'|'erro';
    timestamp?: ISODate;
    turno?: 'manha'|'tarde'|'noite';
  }>;
}

/* ────────────────────────────────────────────────────────────────────────────
 * AGENTE DE PROSPECÇÃO
 * ──────────────────────────────────────────────────────────────────────────── */
export interface AgentStartReq {
  action: 'start';
  timestamp: ISODate;
  usuario_id: number;
  logged_user: LoggedUser;
}
export interface AgentControlStopReq {
  client_id: number | null;
  horario: ISODate;
  parar_o_agente: true;
}

/* ────────────────────────────────────────────────────────────────────────────
 * UTIL
 * ──────────────────────────────────────────────────────────────────────────── */
export interface OkRes { ok: boolean; [k: string]: any }
export interface InsertRes extends OkRes { insertId?: string | number }
export interface ErrorRes { erro?: string; message?: string; error?: string }

/**
 * Registro "auto-documentado" para exibir nos painéis "Webhooks necessários".
 * Cada entrada contém método, content-type e exemplo de payload/retorno.
 */
export const WEBHOOK_CONTRACTS: Record<string, {
  method: 'GET'|'POST';
  contentType?: 'application/json'|'multipart/form-data';
  requestExample?: any;
  responseExample?: any;
}> = {
  /* EMPRESAS */
  'webhook-criar-empresa': {
    method: 'POST',
    contentType: 'application/json',
    requestExample: <CreateCompanyReq>{
      nome:'Code-IQ',
      cnpj:'00.623.904/0001-73',
      endereco:'Rua Erva Mate,531',
      telefone:'51984033242',
      email:'admin@code-iq.com.br',
      descricao:'Empresa de Tecnologia especialista em fluxos e automações.',
      action:'create_company',
    },
    responseExample: <CompanyRes>{ ok:true, id:1, nome:'Code-IQ' }
  },
  'webhook-editar-empresa': {
    method: 'POST',
    contentType: 'application/json',
    requestExample: <EditCompanyReq>{
      id:'2',
      nome:'Elleve Consorcios Elleve Consorcios LTDA',
      cnpj:'57.722.023/0001-27',
      endereco:'Avenida Santos Ferreira, 1340',
      telefone:'(51) 99699-4432',
      email:'clebersonfernandofrank85@gmail.com',
      descricao:'…',
      action:'edit_company',
    },
    responseExample: <CompanyRes>{ ok:true }
  },
  'List Company': { method: 'GET' },

  /* LOGIN */
  'webhook-login': {
    method: 'POST',
    contentType: 'application/json',
    requestExample: <LoginReq>{
      email:'admin@code-iq.com.br',
      senha:'F0rm@T10',
    },
    responseExample: <LoginRes>{ ok:true, usuario_id:5, nome:'Administrator Code-IQ', email:'admin@code-iq.com.br', role:'admin' }
  },
  'webhook-me': { method: 'GET' },

  /* USUÁRIOS */
  'webhook-listar-usuarios': {
    method: 'POST',
    contentType: 'application/json',
    requestExample: <ListUsersReq>{
      action:'list_users',
      timestamp:'2025-09-01T18:40:22.429Z',
      source:'user_management_settings'
    },
    responseExample: <UserRes[]>[{ usuario_id:5, nome:'Administrator Code-IQ', email:'admin@...' }]
  },
  'webhook-criar-usuario': {
    method: 'POST',
    contentType: 'application/json',
    requestExample: <CreateUserReq>{
      email:'foo@bar.com',
      senha:'secret',
      nome:'Nome Completo',
      tipo:'padrao',
      ativo:true,
    },
    responseExample: <UserRes>{ ok:true, id:15 }
  },
  'webhook-editar-usuarios': {
    method: 'POST',
    contentType: 'application/json',
    requestExample: <EditUserReq>{
      action:'update_user_info',
      userId:15,
      nome:'Marcio André Macedo da Silva',
      email:'marcio.macedo@code-iq.com.br',
      perfil:'empty',
      profileId:null,
      empresaId:1,
      ativo:true,
      senha:null,
      TipoPlano:'Básico',
      permissoes:[],
      tipo:'supervisor'
    },
    responseExample: <OkRes>{ ok:true }
  },
  'webhook-usuarios-empresa': { method: 'GET' },

  /* PERFIS */
  'webhook-criar-perfil': {
    method: 'POST',
    contentType: 'application/json',
    requestExample: <CreateProfileReq>{
      name:'Teste',
      description:'Teste',
      permissions:['upload_files','nav_greetings'],
      action:'create_profile'
    },
    responseExample: <OkRes>{ ok:true, id:12 }
  },
  'webhook-editar-perfil': {
    method: 'POST',
    contentType: 'application/json',
    requestExample: <EditProfileReq>{
      profileId:12,
      name:'Teste',
      description:'Teste',
      permissions:['nav_dashboard'],
      action:'edit_profile'
    },
    responseExample: <OkRes>{ ok:true }
  },
  'webhook-deletar-perfil': {
    method: 'POST',
    contentType: 'application/json',
    requestExample: <DeleteProfileReq>{ profileId:11, action:'delete_profile' },
    responseExample: <OkRes>{ ok:true }
  },
  'webhook-listar-perfil': { method: 'GET' },

  /* SAUDAÇÕES */
  'webhook-deletar-saudacao': {
    method: 'POST',
    contentType: 'application/json',
    requestExample: <GreetingDeleteReq>{
      id:5, usuario_id:5, nome:'Administrator Code-IQ', email:'admin@code-iq.com.br', tipo:'admin', role:'admin',
      saudacoes:[{id:46, texto:'Teste'}]
    },
    responseExample: <OkRes>{ ok:true }
  },
  'webhook-saudacao': {
    method: 'POST',
    contentType: 'application/json',
    requestExample: <GreetingInsertReq>{
      id:5, usuario_id:5, nome:'Administrator Code-IQ', email:'admin@code-iq.com.br',
      tipo:'admin', role:'admin', plano:'Básico', saudacao:'Teste', timestamp:'2025-09-12T20:33:55.422Z'
    },
    responseExample: <OkRes>{ ok:true }
  },
  'webhook-lista-saudacoes': {
    method:'POST',
    contentType:'application/json',
    requestExample: <GreetingListReq>{
      id:5, usuario_id:5, nome:'Administrator Code-IQ', email:'admin@code-iq.com.br', tipo:'admin', role:'admin'
    },
    responseExample: { items:[{ id:41, texto:'...' }] }
  },
  'webhook-agente-recebimento': {
    method:'POST',
    contentType:'application/json',
    requestExample: <GreetingApplyReq>{
      usuario_id:5, agente:'recebimento', saudacao_id:41
    },
    responseExample: <OkRes>{ ok:true }
  },

  /* EXCEL / MERCADO */
  'webhook-mercado': {
    method:'POST',
    contentType:'application/json',
    requestExample: <InsertMercadoReq>{
      data:[{ Nome:'Roger Macedo da Silva', Telefone:'51984033242', 'Fonte de prospecção':'Márcio André' }],
      fileName:'leads.xlsx',
      targetDatabase:'mercado_x',
      flagsSelecionadas:[{ value:'mercado_x', webhook:'…/webhook/mercado' }],
      logged_user:{ id:5, name:'Administrator Code-IQ', email:'admin@code-iq.com.br' }
    },
    responseExample: <InsertRes>{ ok:true, insertId:'1757702678361' }
  },
  'webhook-remover-ultima-base': {
    method:'POST',
    contentType:'application/json',
    requestExample: <RemoveLastBaseReq>{
      insertId:'1757702678361',
      table:'mercado_x',
      logged_user:{ id:5, name:'Administrator Code-IQ', email:'admin@code-iq.com.br' }
    },
    responseExample: <OkRes>{ ok:true }
  },
  'webhook-lista-prospeccao': { method:'GET' },

  /* AGENTE */
  'webhook-agente-prospeccao-quente-2': {
    method:'POST',
    contentType:'application/json',
    requestExample: <AgentStartReq>{
      action:'start',
      timestamp:'2025-09-12T12:00:00.000Z',
      usuario_id:5,
      logged_user:{ id:5, name:'Administrator Code-IQ', email:'admin@code-iq.com.br' }
    },
    responseExample: <OkRes>{ ok:true, status:'running' }
  },
  'webhook-controle-agente': {
    method:'POST',
    contentType:'application/json',
    requestExample: <AgentControlStopReq>{
      client_id:5,
      horario:'2025-09-12T12:05:00.000Z',
      parar_o_agente:true
    },
    responseExample: <OkRes>{ ok:true, status:'stopped' }
  },
};