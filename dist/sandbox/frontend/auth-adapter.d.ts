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
export declare function useAuth(): UseAuthReturn;
/**
 * Función authHeaders - Genera headers de autenticación
 *
 * En standalone: usa token mock
 * En integrado: usa función real del core si está disponible
 */
export declare function authHeaders(token?: string | null): Record<string, string>;
//# sourceMappingURL=auth-adapter.d.ts.map