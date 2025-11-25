/**
 * Helper para configurar Vite en plugins de Formara
 *
 * Configura el alias @core para que resuelva a las interfaces del SDK
 */
import { defineConfig } from 'vite';
import path from 'path';
/**
 * Obtener configuración base de Vite para plugins
 *
 * Configura el alias @core para que apunte al SDK instalado
 */
export function getPluginViteConfig(pluginDir) {
    // Resolver ruta al SDK instalado
    // En desarrollo (monorepo): puede estar en node_modules o como workspace
    // En producción: está en node_modules/@formara/plugin-sdk
    const sdkPath = path.resolve(pluginDir, 'node_modules', '@formara', 'plugin-sdk', 'src', 'contracts');
    return {
        resolve: {
            alias: {
                '@core': sdkPath,
                '@core/frontend': path.join(sdkPath, 'frontend'),
                '@core/backend': path.join(sdkPath, 'backend'),
            },
        },
    };
}
/**
 * Configuración completa de Vite para plugins (incluye React)
 */
export function createPluginViteConfig(pluginDir, customConfig = {}) {
    const baseConfig = getPluginViteConfig(pluginDir);
    return defineConfig({
        ...baseConfig,
        ...customConfig,
        resolve: {
            ...baseConfig.resolve,
            ...customConfig.resolve,
            alias: {
                ...baseConfig.resolve?.alias,
                ...customConfig.resolve?.alias,
            },
        },
    });
}
