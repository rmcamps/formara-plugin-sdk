/**
 * Tipos y definiciones para el sistema de ACTIONS de plugins
 * 
 * Las ACTIONS son botones/comandos que los plugins pueden registrar
 * para aparecer en diferentes contextos de la UI
 */

/**
 * Contextos donde puede aparecer una acción
 */
export type ActionContext = 
  | 'document'      // Vista de documento individual
  | 'form-record'   // Vista de registro de formulario
  | 'form'          // Vista de formulario (lista de registros)
  | 'workspace'     // Panel del workspace
  | 'global';       // Menú global de la app

/**
 * Resultado de ejecutar una acción
 */
export interface ActionResult {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
  
  // Acciones post-ejecución
  refresh?: boolean;           // Refrescar la vista actual
  redirect?: string;           // Redirigir a otra URL
  download?: {                 // Descargar archivo
    filename: string;
    url: string;
  };
  notification?: {             // Mostrar notificación
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
  };
}

/**
 * Datos que se pasan a una acción según el contexto
 */
export interface ActionContextData {
  context: ActionContext;
  
  // Para context: 'document'
  document?: {
    id: number;
    name: string;
    type: string;
    status: string;
    extractedData?: any;
    fields?: Record<string, any>;
  };
  
  // Para context: 'form-record'
  formRecord?: {
    id: number;
    formId: number;
    workspaceId?: number;
    documentId?: number;
    recordId?: number;
    data: Record<string, any>;
  };
  
  // ID del usuario que ejecuta
  userId?: number;
  
  // Para context: 'form'
  form?: {
    id: number;
    name: string;
    schema: any;
    records?: any[];
  };
  
  // Usuario que ejecuta la acción
  user?: {
    id: number;
    email: string;
  };
  
  // Workspace actual
  workspace?: {
    id: number;
    name: string;
  };
}

/**
 * Definición de una acción
 */
export interface ActionDefinition {
  id: string;                    // ID único: 'validate-afip', 'send-email'
  pluginName: string;            // Nombre del plugin que provee la acción
  label: string;                 // Texto del botón: "Validar con AFIP"
  icon?: string;                 // Emoji o nombre de icono: "🇦🇷", "check-circle"
  description?: string;          // Descripción de qué hace
  
  contexts: ActionContext[];     // Dónde aparece el botón
  
  // Requisitos para que la acción esté disponible
  requiresFields?: string[];     // Campos requeridos: ['cuit', 'total']
  requiresStatus?: string[];     // Estados requeridos: ['processed', 'validated']
  requiresPermissions?: string[]; // Permisos: ['documents:write']
  
  // Configuración de la UI
  confirmMessage?: string;       // Mensaje de confirmación antes de ejecutar
  buttonVariant?: 'primary' | 'secondary' | 'danger';
  showInMenu?: boolean;          // Mostrar en menú contextual
  showInToolbar?: boolean;       // Mostrar en toolbar
  
  // Handler
  handler: (data: ActionContextData) => Promise<ActionResult>;
}

/**
 * Registro de acciones disponibles
 */
export interface ActionRegistry {
  [actionId: string]: ActionDefinition;
}

