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
//# sourceMappingURL=integrations.d.ts.map