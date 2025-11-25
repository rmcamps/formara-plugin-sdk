/**
 * Auth Adapter para Plugins - Funciona en Standalone e Integrado
 * 
 * Este adapter detecta automáticamente el contexto y proporciona:
 * - Standalone: Mock de autenticación (usuario fijo)
 * - Integrado: Auth real del core
 * 
 * Uso:
 *   import { useAuth, authHeaders } from '@formara/plugin-sdk/sandbox/frontend/auth-adapter';
 */

import { useContext, createContext } from 'react';

/**
 * Detectar si estamos en modo standalone o integrado
 * 
 * En standalone: el plugin corre en su propio servidor (localhost:5182, etc.)
 * En integrado: el plugin está dentro del core de Formara
 */
function isStandaloneMode(): boolean {
  if (typeof window === 'undefined') return false;
  
  // En standalone, el hostname es localhost y el path puede incluir /dev.html
  const hostname = window.location.hostname;
  const pathname = window.location.pathname;
  
  // Si estamos en localhost y el path incluye /dev.html, es standalone
  if (hostname === 'localhost' && pathname.includes('/dev.html')) {
    return true;
  }
  
  // Si estamos en un puerto de desarrollo típico (5182, 5183, etc.) y no es el core, es standalone
  const port = window.location.port;
  if (hostname === 'localhost' && port && parseInt(port) >= 5182 && parseInt(port) < 6000) {
    return true;
  }
  
  return false;
}

/**
 * Mock user para desarrollo standalone
 */
const MOCK_USER = {
  id: 1,
  email: 'dev@example.com',
  name: 'Developer',
  workspaceId: 1,
  role: 'admin',
  token: 'mock-dev-token',
};

/**
 * Contexto de autenticación
 */
interface AuthContextType {
  user: {
    id: number;
    email: string;
    name?: string;
    workspaceId: number;
    role?: string;
    token?: string;
  } | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Tipo de retorno de useAuth
 */
export interface UseAuthReturn {
  user: {
    id: number;
    email: string;
    name?: string;
    workspaceId: number;
    role?: string;
    token?: string;
  } | null;
  token: string | null;
  loading: boolean;
  login?: (email: string, password: string) => Promise<void>;
  logout?: () => void;
  loginWithToken?: (token: string) => Promise<void>;
}

/**
 * Hook useAuth - Funciona en ambos modos
 * 
 * En standalone: retorna mock user
 * En integrado: intenta usar el AuthContext real del core
 */
export function useAuth(): UseAuthReturn {
  const standalone = isStandaloneMode();
  
  // En standalone, retornar mock user
  if (standalone) {
    return {
      user: MOCK_USER,
      token: MOCK_USER.token || null,
      loading: false,
      login: async () => {
        console.log('[Auth Adapter] Mock login - siempre autenticado en standalone');
      },
      logout: () => {
        console.log('[Auth Adapter] Mock logout - no hace nada en standalone');
      },
    };
  }
  
  // En integrado (producción), usar el AuthContext real del core
  // El core expone las funciones globalmente en window.__FORMARA_CORE_AUTH__
  const coreAuthModule = typeof window !== 'undefined' ? (window as any).__FORMARA_CORE_AUTH__ : null;
  
  if (coreAuthModule && typeof coreAuthModule.useAuth === 'function') {
    try {
      // Usar el hook del core directamente
      const coreAuth = coreAuthModule.useAuth();
      const result: UseAuthReturn = {
        user: coreAuth.user ? {
          id: coreAuth.user.id,
          email: coreAuth.user.email,
          name: coreAuth.user.name || undefined,
          workspaceId: (coreAuth.user as any).workspaceId || 1,
          role: (coreAuth.user as any).role,
          token: coreAuth.token,
        } : null,
        token: coreAuth.token || null,
        loading: coreAuth.loading || false,
        login: coreAuth.login || (async () => {}),
        logout: coreAuth.logout || (() => {}),
      };
      if (coreAuth.loginWithToken) {
        result.loginWithToken = coreAuth.loginWithToken;
      }
      return result;
    } catch (e) {
      console.warn('[Auth Adapter] Error usando useAuth del core:', e);
    }
  }
  
  // Si no está disponible, usar fallback con token del localStorage
  // En producción, intentar obtener el token del localStorage
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  const user = token ? {
    id: 1,
    email: 'user@example.com',
    name: 'User',
    workspaceId: 1,
    token,
  } : null;
  
  return {
    user,
    token,
    loading: false,
    login: async () => {},
    logout: () => {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
      }
    },
  };
}

/**
 * Función authHeaders - Genera headers de autenticación
 * 
 * En standalone: usa token mock
 * En integrado: usa función real del core si está disponible
 */
export function authHeaders(token?: string | null): Record<string, string> {
  const standalone = isStandaloneMode();
  
  // En standalone, usar token mock
  if (standalone) {
    const mockToken = token || MOCK_USER.token || 'mock-dev-token';
    return {
      'Authorization': `Bearer ${mockToken}`,
      'Content-Type': 'application/json',
    };
  }
  
  // En integrado (producción), usar función del core si está disponible
  try {
    // El core expone authHeaders globalmente en window.__FORMARA_AUTH_HEADERS__
    const coreAuthHeaders = typeof window !== 'undefined' ? (window as any).__FORMARA_AUTH_HEADERS__ : null;
    
    if (coreAuthHeaders && typeof coreAuthHeaders === 'function') {
      return coreAuthHeaders(token);
    }
    
    // Si no está disponible, usar la misma implementación que el core
    // Obtener token del parámetro o del localStorage
    const realToken = token || (typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null);
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (realToken) {
      headers['Authorization'] = `Bearer ${realToken}`;
    }
    
    // Agregar workspace ID si está disponible (igual que el core)
    const activeWs = typeof window !== 'undefined' ? localStorage.getItem('active_ws') : null;
    if (activeWs) {
      headers['x-workspace-id'] = activeWs;
    }
    
    return headers;
  } catch (error) {
    console.warn('[Auth Adapter] Error accediendo a authHeaders del core:', error);
    // Fallback a implementación básica
    const fallbackToken = token || MOCK_USER.token || '';
    return {
      'Authorization': fallbackToken ? `Bearer ${fallbackToken}` : '',
      'Content-Type': 'application/json',
    };
  }
}
