/**
 * Tipos y definiciones para el sistema de HOOKS de plugins
 * 
 * Los HOOKS permiten a los plugins reaccionar a eventos del sistema
 */

/**
 * Eventos disponibles en el sistema
 */
export type HookEvent =
  // Eventos de Archivo (uploaded files procesados con IA)
  | 'file.uploaded'
  | 'file.processing'
  | 'file.processed'
  | 'file.validated'
  | 'file.updated'
  | 'file.deleted'
  
  // Eventos de Documento (generación desde templates)
  | 'document.generated'
  | 'document.sent'
  | 'document.signed'
  
  // Eventos de Formulario
  | 'form.created'
  | 'form.updated'
  | 'form.deleted'
  
  // Eventos de Registro de Formulario
  | 'form.record.created'
  | 'form.record.updated'
  | 'form.record.deleted'
  | 'form.record.validated'
  
  // Eventos de Workspace
  | 'workspace.created'
  | 'workspace.member.added'
  
  // Eventos de Usuario
  | 'user.registered'
  | 'user.login'
  
  // Eventos de Sistema
  | 'system.startup'
  | 'system.shutdown';

/**
 * Datos del evento de archivo
 */
export interface FileEventData {
  file: {
    id: number;
    name: string;
    type: string;
    status: string;
    ownerId: number;
    workspaceId?: number;
    extractedData?: any;
    structuredData?: any;
    filePath?: string;
    validationResults?: any;
  };
  user?: {
    id: number;
    email: string;
  };
  workspace?: {
    id: number;
    name: string;
  };
  previousData?: any;
}

/**
 * Datos del evento de documento generado
 */
export interface DocumentEventData {
  document: {
    id: number;
    name: string;
    templateId?: number;
    recordId?: number;
    status: string;
    filePath?: string;
  };
  user?: {
    id: number;
    email: string;
  };
  workspace?: {
    id: number;
    name: string;
  };
}

/**
 * Datos del evento de registro de formulario
 */
export interface FormRecordEventData {
  record: {
    id: number;
    formId: number;
    data: Record<string, any>;
    createdAt?: Date;
    updatedAt?: Date;
  };
  form: {
    id: number;
    name: string;
    schema: any;
    workspaceId?: number;
  };
  user?: {
    id: number;
    email: string;
  };
  validationResults?: any;
  previousData?: any;
}

/**
 * Datos del evento de formulario
 */
export interface FormEventData {
  form: {
    id: number;
    name: string;
    schema: any;
    workspaceId?: number;
  };
  user?: {
    id: number;
    email: string;
  };
}

/**
 * Union type de todos los datos de eventos
 */
export type HookEventData = 
  | FileEventData
  | DocumentEventData
  | FormRecordEventData
  | FormEventData
  | any;

/**
 * Resultado de ejecutar un hook
 */
export interface HookResult {
  success: boolean;
  pluginName: string;
  hookId: string;
  message?: string;
  data?: any;
  error?: string;
  executionTime?: number;
}

/**
 * Definición de un hook
 */
export interface HookDefinition {
  id: string;
  pluginName: string;
  event: HookEvent;
  description?: string;
  priority?: number;
  async?: boolean;
  timeout?: number;
  condition?: (data: HookEventData) => boolean;
  handler: (data: HookEventData) => Promise<HookResult | void>;
}

/**
 * Registro de hooks por evento
 */
export interface HookRegistry {
  [event: string]: HookDefinition[];
}


