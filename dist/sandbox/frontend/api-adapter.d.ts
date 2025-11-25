/**
 * API Adapter para Plugins - Funciona en Standalone e Integrado
 *
 * Este adapter detecta automáticamente el contexto y construye URLs correctas:
 * - Standalone: URLs apuntan al backend del plugin (http://localhost:4001)
 * - Integrado: URLs apuntan al core de Formara
 *
 * Uso:
 *   import { api } from '@formara/plugin-sdk/sandbox/frontend/api-adapter';
 *   const url = api('/api/plugins/arca/validate-cuit');
 */
/**
 * Función api - Construye URLs de API
 *
 * Similar a la función api() del core pero adaptada al contexto del plugin
 *
 * @param path - Ruta de la API (ej: '/api/plugins/arca/validate-cuit')
 * @returns URL completa
 */
export declare function api(path: string): string;
//# sourceMappingURL=api-adapter.d.ts.map