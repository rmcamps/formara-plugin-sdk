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
import express from 'express';
import cors from 'cors';
export function createDevServer(config = {}) {
    const { port = 4001, frontendUrl = 'http://localhost:5182', coreApiUrl = 'http://localhost:3000', mockUser = {
        id: 1,
        email: 'dev@example.com',
        name: 'Developer',
        workspaceId: 1,
        role: 'admin',
    }, } = config;
    const app = express();
    // CORS: permitir requests del frontend del plugin
    // En desarrollo (dev-server siempre es desarrollo), permitir cualquier localhost (Vite puede usar puertos dinámicos)
    app.use(cors({
        origin: (origin, callback) => {
            // Permitir requests sin origin (Postman, curl, etc.)
            if (!origin) {
                return callback(null, true);
            }
            // Permitir cualquier localhost (dev-server siempre es para desarrollo)
            if (origin.match(/^http:\/\/localhost:\d+$/)) {
                return callback(null, true);
            }
            // Permitir el frontend específico
            if (origin === frontendUrl) {
                return callback(null, true);
            }
            callback(new Error('Not allowed by CORS'));
        },
        credentials: true,
    }));
    // Parse JSON
    app.use(express.json());
    // Logging middleware
    app.use((req, res, next) => {
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
        next();
    });
    /**
     * Middleware de Mock de Autenticación
     * En desarrollo standalone, siempre retorna un usuario autenticado
     */
    app.use((req, res, next) => {
        req.user = mockUser;
        req.headers.authorization = 'Bearer mock-dev-token';
        next();
    });
    // Health check
    app.get('/health', (req, res) => {
        res.json({
            status: 'ok',
            mode: 'standalone',
            timestamp: new Date().toISOString(),
            config: {
                port,
                frontendUrl,
                coreApiUrl,
            },
        });
    });
    // Manejo de errores
    app.use((err, req, res, next) => {
        console.error('Error:', err);
        res.status(500).json({
            error: 'Internal Server Error',
            message: err.message,
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
        });
    });
    // Iniciar servidor
    app.listen(port, () => {
        console.log('');
        console.log('🚀 Plugin Backend (Standalone Mode)');
        console.log('');
        console.log(`   Server:      http://localhost:${port}`);
        console.log(`   Frontend:    ${frontendUrl}`);
        // Solo mostrar Core API si se está usando (no es necesario en standalone puro)
        // console.log(`   Core API:    ${coreApiUrl} (opcional)`);
        console.log('');
    });
    return app;
}
