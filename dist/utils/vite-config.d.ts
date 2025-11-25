/**
 * Helper para configurar Vite en plugins de Formara
 *
 * Configura el alias @core para que resuelva a las interfaces del SDK
 */
import { UserConfig } from 'vite';
/**
 * Obtener configuración base de Vite para plugins
 *
 * Configura el alias @core para que apunte al SDK instalado
 */
export declare function getPluginViteConfig(pluginDir: string): Partial<UserConfig>;
/**
 * Configuración completa de Vite para plugins (incluye React)
 */
export declare function createPluginViteConfig(pluginDir: string, customConfig?: Partial<UserConfig>): UserConfig;
//# sourceMappingURL=vite-config.d.ts.map