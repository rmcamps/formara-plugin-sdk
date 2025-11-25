/**
 * Tipos y definiciones para el sistema de DISTRIBUTES de plugins
 *
 * Las DISTRIBUTES permiten a los plugins aparecer como CARDS en la página de Distribute
 * con configuración propia
 */
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
/**
 * Registro de distributes disponibles
 */
export interface DistributeRegistry {
    [pluginName: string]: DistributeDefinition[];
}
/**
 * Respuesta del endpoint de distributes
 */
export interface DistributesListResponse {
    distributes: Array<{
        pluginName: string;
        plugin: {
            name: string;
            displayName: string;
            version: string;
        };
        distribute: DistributeDefinition;
        installed?: boolean;
        config?: DistributeConfig;
    }>;
}
//# sourceMappingURL=distributes.d.ts.map