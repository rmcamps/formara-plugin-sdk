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
  | 'file.uploaded'          // Archivo subido
  | 'file.processing'        // Iniciando procesamiento con IA
  | 'file.processed'         // IA terminó extracción
  | 'file.validated'         // Validación completada
  | 'file.updated'           // Datos del archivo editados
  | 'file.deleted'           // Archivo eliminado
  
  // Eventos de Documento (generación desde templates)
  | 'document.generated'     // Documento generado desde template
  | 'document.sent'          // Documento enviado
  | 'document.signed'        // Documento firmado
  
  // Eventos de Formulario
  | 'form.created'           // Nuevo formulario creado
  | 'form.updated'           // Formulario editado
  | 'form.deleted'           // Formulario eliminado
  
  // Eventos de Registro de Formulario
  | 'form.record.created'    // Nuevo registro creado
  | 'form.record.updated'    // Registro editado
  | 'form.record.deleted'    // Registro eliminado
  | 'form.record.validated'  // Registro validado
  
  // Eventos de Workspace
  | 'workspace.created'      // Nuevo workspace
  | 'workspace.member.added' // Miembro agregado
  
  // Eventos de Usuario
  | 'user.registered'        // Usuario registrado
  | 'user.login'             // Usuario inició sesión
  
  // Eventos de Sistema
  | 'system.startup'         // Sistema iniciando
  | 'system.shutdown';       // Sistema cerrando

/**
 * Datos del evento de archivo (uploaded file procesado con IA)
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
  
  // Para eventos de update, datos anteriores
  previousData?: any;
}

/**
 * Datos del evento de documento (generado desde template)
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
  
  // Para eventos de update, datos anteriores
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
  | any; // Para eventos custom

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
  executionTime?: number; // ms
}

/**
 * Definición de un hook
 */
export interface HookDefinition {
  id: string;                    // ID único del hook en el plugin
  pluginName: string;            // Nombre del plugin
  event: HookEvent;              // Evento al que responde
  description?: string;          // Descripción de qué hace
  
  // Configuración
  priority?: number;             // Orden de ejecución (menor = primero)
  async?: boolean;               // Ejecutar en background
  timeout?: number;              // Timeout en ms
  
  // Condiciones para ejecutar
  condition?: (data: HookEventData) => boolean;
  
  // Handler
  handler: (data: HookEventData) => Promise<HookResult | void>;
}

/**
 * Registro de hooks por evento
 */
export interface HookRegistry {
  [event: string]: HookDefinition[];
}

