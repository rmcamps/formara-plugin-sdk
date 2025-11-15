/**
 * Configuración de API para plugins
 */

/**
 * Resuelve la URL base de la API según el entorno
 */
function resolveApiBase(): string {
  // En desarrollo local, usar path relativo para que proxy funcione
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const port = window.location.port;
    
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      // En sandbox del plugin, usar puerto específico
      if (port === '5174') {
        return 'http://localhost:3001';
      }
      // En core de Formara, usar path relativo
      if (port === '5173') {
        return '';
      }
    }
  }
  
  // Fallback a variable de entorno o localhost
  // @ts-ignore - import.meta.env existe en contexto de Vite
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    // @ts-ignore
    return (import.meta.env.VITE_API_URL as string) || 'http://localhost:3000';
  }
  
  return 'http://localhost:3000';
}

export const API_BASE = resolveApiBase();

/**
 * Construye una URL completa de API
 */
export function api(path: string): string {
  if (!path) return API_BASE;
  return `${API_BASE}${path.startsWith('/') ? '' : '/'}${path}`;
}

/**
 * Base URL para archivos estáticos
 */
export const FILE_BASE = API_BASE || 'http://localhost:3000';

/**
 * Construye una URL completa para archivos
 */
export function fileUrl(path: string): string {
  if (!path) return FILE_BASE;
  const cleaned = path.replace(/^\/+/, '').replace(/^uploads\/+uploads\//, 'uploads/');
  return `${FILE_BASE}/${cleaned}`;
}


