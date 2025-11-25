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
 * Detectar si estamos en modo standalone o integrado
 */
function isStandaloneMode() {
    if (typeof window === 'undefined')
        return false;
    const hostname = window.location.hostname;
    const pathname = window.location.pathname;
    const port = window.location.port;
    // Si estamos en localhost y el path incluye /dev.html, es standalone
    if (hostname === 'localhost' && pathname.includes('/dev.html')) {
        return true;
    }
    // Si estamos en un puerto de desarrollo típico del plugin (5182-5999), es standalone
    if (hostname === 'localhost' && port && parseInt(port) >= 5182 && parseInt(port) < 6000) {
        return true;
    }
    return false;
}
/**
 * Obtener base URL del backend según el contexto
 */
function getBaseUrl() {
    const standalone = isStandaloneMode();
    if (standalone) {
        // En standalone, usar la URL del backend configurada por DevApp
        // DevApp configura window.__PLUGIN_BACKEND_URL__ cuando se monta
        if (typeof window !== 'undefined' && window.__PLUGIN_BACKEND_URL__) {
            return window.__PLUGIN_BACKEND_URL__;
        }
        // Fallback: usar puerto si está configurado
        const backendPort = (typeof window !== 'undefined' && window.__PLUGIN_BACKEND_PORT__) || '4001';
        return `http://localhost:${backendPort}`;
    }
    // En integrado, usar la misma base URL que el frontend (mismo origen)
    if (typeof window !== 'undefined') {
        return window.location.origin;
    }
    // Fallback
    return 'http://localhost:3000';
}
/**
 * Función api - Construye URLs de API
 *
 * Similar a la función api() del core pero adaptada al contexto del plugin
 *
 * @param path - Ruta de la API (ej: '/api/plugins/arca/validate-cuit')
 * @returns URL completa
 */
export function api(path) {
    // Si el path ya es una URL completa, retornarlo tal cual
    if (path.startsWith('http://') || path.startsWith('https://')) {
        return path;
    }
    // Asegurar que el path empiece con /
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    const standalone = isStandaloneMode();
    // En integrado (producción), usar función del core si está disponible
    if (!standalone && typeof window !== 'undefined') {
        // El core expone api globalmente en window.__FORMARA_API__
        const coreApi = window.__FORMARA_API__;
        if (coreApi && typeof coreApi === 'function') {
            return coreApi(normalizedPath);
        }
        // Si no está disponible, usar la misma lógica que el core
        // En producción, usar path relativo (mismo origen)
        // En desarrollo local, también usar path relativo para que el proxy de Vite funcione
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            // En desarrollo, usar path relativo para que el proxy funcione
            return normalizedPath;
        }
        // En producción/staging, usar la URL base del entorno
        const envBase = import.meta.env.VITE_API_URL || window.location.origin;
        return `${envBase}${normalizedPath}`;
    }
    // En standalone, construir URL con base URL del backend del plugin
    const baseUrl = getBaseUrl();
    return `${baseUrl}${normalizedPath}`;
}
