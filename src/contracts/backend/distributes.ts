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
  id: string;                    // ID único: 'mi-distribute', 'email-sender'
  displayName: string;           // Nombre para mostrar: "Mi Distribuidor"
  description: string;           // Descripción corta
  icon?: string;                 // Emoji o URL de icono: "📤", "/icons/distribute.svg"
  category?: 'email' | 'whatsapp' | 'sms' | 'signature' | 'campaign' | 'other';
  
  // Configuración
  requiresAuth?: boolean;        // Si requiere autenticación OAuth u otra
  authProvider?: string;         // 'google', 'microsoft', 'custom'
  configSchema?: any;            // Schema JSON de configuración
  
  // UI
  configComponent?: string;      // Path relativo al componente React de configuración
  cardColor?: string;            // Color de la card (hex)
  
  // Capabilities
  capabilities?: {
    email?: boolean;             // Permite enviar por email
    whatsapp?: boolean;         // Permite enviar por WhatsApp
    sms?: boolean;              // Permite enviar por SMS
    signature?: boolean;        // Permite solicitar firmas
    campaign?: boolean;         // Permite campañas masivas
  };
  
  // Metadata
  website?: string;              // URL del sitio web
  docsUrl?: string;              // URL de documentación
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
  config: Record<string, any>;   // Configuración específica de la distribute
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

