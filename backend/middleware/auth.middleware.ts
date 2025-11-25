/**
 * Mock de middleware de autenticación para desarrollo de plugins
 */

import { Request, Response, NextFunction } from 'express';

/**
 * Middleware de autenticación mock
 * En sandbox: siempre autentica con usuario de desarrollo
 * En producción: el core reemplaza esto con su implementación real
 */
export function authMiddleware(req: any, res: Response, next: NextFunction) {
  // Mock: usuario siempre autenticado en desarrollo
  req.user = {
    id: 1,
    email: 'dev@formara.local',
    name: 'Developer',
  };
  req.workspaceId = 1;
  
  next();
}


