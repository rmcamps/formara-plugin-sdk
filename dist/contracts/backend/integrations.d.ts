/**
 * Tipos y definiciones para el sistema de INTEGRATIONS de plugins
 *
 * Las INTEGRATIONS permiten a los plugins aparecer como CARDS en la página de Integraciones
 * con configuración propia
 */
/**
 * Definición de una integración en el manifest del plugin
 */
export interface IntegrationDefinition {
    id: string;
    displayName: string;
    description: string;
    icon?: string;
    category?: 'storage' | 'automation' | 'communication' | 'analytics' | 'other';
    requiresAuth?: boolean;
    authProvider?: string;
    configSchema?: any;
    configComponent?: string;
    cardColor?: string;
    capabilities?: {
        sync?: boolean;
        import?: boolean;
        export?: boolean;
        realtime?: boolean;
    };
    hooks?: string[];
    website?: string;
    docsUrl?: string;
}
/**
 * Configuración de una integración instalada
 */
export interface IntegrationConfig {
    id: number;
    pluginName: string;
    integrationId: string;
    workspaceId: number;
    enabled: boolean;
    config: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}
/**
 * Registro de integraciones disponibles
 */
export interface IntegrationRegistry {
    [pluginName: string]: IntegrationDefinition[];
}
/**
 * Respuesta del endpoint de integraciones
 */
export interface IntegrationsListResponse {
    integrations: Array<{
        pluginName: string;
        plugin: {
            name: string;
            displayName: string;
            version: string;
        };
        integration: IntegrationDefinition;
        installed?: boolean;
        config?: IntegrationConfig;
    }>;
}
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
 * Definición de una distribute en el manifest del plugin
 */
export interface DistributeDefinition {
    id: string;
    displayName: string;
    description: string;
    icon?: string;
    category?: 'email' | 'whatsapp' | 'sms' | 'signature' | 'campaign' | 'other';
    requiresAuth?: boolean;
    authProvider?: string;
    configSchema?: any;
    configComponent?: string;
    cardColor?: string;
    capabilities?: {
        email?: boolean;
        whatsapp?: boolean;
        sms?: boolean;
        signature?: boolean;
        campaign?: boolean;
    };
    website?: string;
    docsUrl?: string;
}
/**
 * Configuración de una distribute instalada
 */
export interface DistributeConfig {
    id: number;
    pluginName: string;
    distributeId: string;
    workspaceId: number;
    enabled: boolean;
    config: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}
//# sourceMappingURL=integrations.d.ts.map