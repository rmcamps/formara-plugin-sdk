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
  id: string;                    // ID único: 'mi-generate', 'pdf-generator'
  displayName: string;           // Nombre para mostrar: "Mi Generador"
  description: string;           // Descripción corta
  icon?: string;                 // Emoji o URL de icono: "📄", "/icons/generate.svg"
  category?: 'document' | 'email' | 'payment' | 'invoice' | 'other';
  
  // Configuración
  requiresAuth?: boolean;        // Si requiere autenticación OAuth u otra
  authProvider?: string;         // 'google', 'microsoft', 'custom'
  configSchema?: any;            // Schema JSON de configuración
  
  // UI
  configComponent?: string;      // Path relativo al componente React de configuración
  cardColor?: string;            // Color de la card (hex)
  
  // Capabilities
  capabilities?: {
    pdf?: boolean;              // Permite generar PDFs
    email?: boolean;            // Permite generar emails
    web?: boolean;              // Permite generar contenido web
    custom?: boolean;           // Permite generación personalizada
  };
  
  // Metadata
  website?: string;              // URL del sitio web
  docsUrl?: string;              // URL de documentación
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
  config: Record<string, any>;   // Configuración específica de la generate
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

