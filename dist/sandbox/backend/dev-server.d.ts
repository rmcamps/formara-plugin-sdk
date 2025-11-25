/**
 * Servidor Express Standalone para Plugin de Formara
 *
 * Este servidor permite desarrollar y probar el backend del plugin
 * sin necesidad de tener el core de Formara corriendo.
 *
 * Características:
 * - Mock de autenticación (usuario siempre logueado)
 * - CORS habilitado para el frontend del plugin
 * - Prisma client conectado a DB del plugin
 * - Puede llamar servicios del core via REST API
 *
 * Uso:
 *   import { createDevServer } from '@formara/plugin-sdk/sandbox/backend/dev-server';
 *   const app = createDevServer({ port: 4001, frontendUrl: 'http://localhost:5182' });
 *   app.use('/api/plugins/PLUGIN_NAME', pluginRouter);
 */
import { Express } from 'express';
export interface DevServerConfig {
    port?: number;
    frontendUrl?: string;
    coreApiUrl?: string;
    mockUser?: {
        id: number;
        email: string;
        name: string;
        workspaceId: number;
        role?: string;
    };
}
export declare function createDevServer(config?: DevServerConfig): Express;
//# sourceMappingURL=dev-server.d.ts.map