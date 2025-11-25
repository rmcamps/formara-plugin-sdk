/**
 * Mock de contexto de autenticación para desarrollo de plugins
 */

import React, { createContext, useContext } from 'react';

export type AuthUser = {
  id: number;
  email: string;
  name?: string | null;
  picture?: string | null;
};

type AuthContextType = {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  loginWithToken: (token: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Mock del AuthProvider para desarrollo
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // En sandbox, siempre hay un usuario autenticado
  const mockUser: AuthUser = {
    id: 1,
    email: 'dev@formara.local',
    name: 'Plugin Developer',
  };

  const value: AuthContextType = {
    user: mockUser,
    token: 'dev-mock-token',
    loading: false,
    loginWithToken: async (token: string) => {
      console.log('[SDK Mock Auth] loginWithToken called with:', token);
    },
    logout: () => {
      console.log('[SDK Mock Auth] logout called');
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Hook para acceder al contexto de autenticación
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

/**
 * Genera headers de autenticación para requests
 */
export function authHeaders(token: string): { Authorization: string } {
  return {
    Authorization: `Bearer ${token}`,
  };
}


