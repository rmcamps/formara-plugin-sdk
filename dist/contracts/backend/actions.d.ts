/**
 * Tipos y definiciones para el sistema de ACTIONS de plugins
 *
 * Las ACTIONS son botones/comandos que los plugins pueden registrar
 * para aparecer en diferentes contextos de la UI
 */
/**
 * Contextos donde puede aparecer una acción
 */
export type ActionContext = 'document' | 'record' | 'form' | 'workspace' | 'global';
/**
 * Resultado de ejecutar una acción
 */
export interface ActionResult {
    success: boolean;
    message: string;
    data?: any;
    error?: string;
    refresh?: boolean;
    redirect?: string;
    download?: {
        filename: string;
        url: string;
    };
    notification?: {
        type: 'success' | 'error' | 'warning' | 'info';
        message: string;
    };
}
/**
 * Datos que se pasan a una acción según el contexto
 */
export interface ActionContextData {
    context: ActionContext;
    document?: {
        id: number;
        name: string;
        type: string;
        status: string;
        extractedData?: any;
        fields?: Record<string, any>;
    };
    record?: {
        id: number;
        formId: number;
        workspaceId?: number;
        documentId?: number;
        recordId?: number;
        data: Record<string, any>;
    };
    userId?: number;
    form?: {
        id: number;
        name: string;
        schema: any;
        records?: any[];
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
 * Definición de una acción
 */
export interface ActionDefinition {
    id: string;
    pluginName: string;
    label: string;
    icon?: string;
    description?: string;
    contexts: ActionContext[];
    requiresFields?: string[];
    requiresStatus?: string[];
    requiresPermissions?: string[];
    confirmMessage?: string;
    buttonVariant?: 'primary' | 'secondary' | 'danger';
    showInMenu?: boolean;
    showInToolbar?: boolean;
    target?: 'staging' | 'prod';
    handler: (data: ActionContextData) => Promise<ActionResult>;
}
/**
 * Registro de acciones disponibles
 */
export interface ActionRegistry {
    [actionId: string]: ActionDefinition;
}
//# sourceMappingURL=actions.d.ts.map