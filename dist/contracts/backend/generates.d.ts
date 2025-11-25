/**
 * Tipos y definiciones para el sistema de GENERATES de plugins
 *
 * Las GENERATES permiten a los plugins aparecer como CARDS en la página de Generate
 * con configuración propia
 */
/**
 * Definición de una generate en el manifest del plugin
 */
export interface GenerateDefinition {
    id: string;
    displayName: string;
    description: string;
    icon?: string;
    category?: 'document' | 'email' | 'payment' | 'invoice' | 'other';
    requiresAuth?: boolean;
    authProvider?: string;
    configSchema?: any;
    configComponent?: string;
    cardColor?: string;
    capabilities?: {
        pdf?: boolean;
        email?: boolean;
        web?: boolean;
        custom?: boolean;
    };
    website?: string;
    docsUrl?: string;
}
/**
 * Configuración de una generate instalada
 */
export interface GenerateConfig {
    id: number;
    pluginName: string;
    generateId: string;
    workspaceId: number;
    enabled: boolean;
    config: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}
/**
 * Registro de generates disponibles
 */
export interface GenerateRegistry {
    [pluginName: string]: GenerateDefinition[];
}
/**
 * Respuesta del endpoint de generates
 */
export interface GeneratesListResponse {
    generates: Array<{
        pluginName: string;
        plugin: {
            name: string;
            displayName: string;
            version: string;
        };
        generate: GenerateDefinition;
        installed?: boolean;
        config?: GenerateConfig;
    }>;
}
//# sourceMappingURL=generates.d.ts.map