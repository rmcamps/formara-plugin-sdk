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
  id: string;                    // ID único: 'google-sheets', 'zapier'
  displayName: string;           // Nombre para mostrar: "Google Sheets"
  description: string;           // Descripción corta
  icon?: string;                 // Emoji o URL de icono: "📊", "/icons/sheets.svg"
  category?: 'storage' | 'automation' | 'communication' | 'analytics' | 'other';
  
  // Configuración
  requiresAuth?: boolean;        // Si requiere autenticación OAuth u otra
  authProvider?: string;         // 'google', 'microsoft', 'custom'
  configSchema?: any;            // Schema JSON de configuración
  
  // UI
  configComponent?: string;      // Path relativo al componente React de configuración
  cardColor?: string;            // Color de la card (hex)
  
  // Capabilities
  capabilities?: {
    sync?: boolean;              // Permite sincronización
    import?: boolean;            // Permite importar datos
    export?: boolean;            // Permite exportar datos
    realtime?: boolean;          // Sincronización en tiempo real
  };
  
  // Hooks que implementa
  hooks?: string[];              // ['form.record.created', 'form.record.updated']
  
  // Metadata
  website?: string;              // URL del sitio web de la integración
  docsUrl?: string;              // URL de documentación
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
  config: Record<string, any>;   // Configuración específica de la integración
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

