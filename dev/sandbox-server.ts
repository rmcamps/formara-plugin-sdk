/**
 * Sandbox Server para desarrollo de plugins
 * 
 * Express server mock que monta las rutas del plugin
 * Provee mocks de auth, prisma y otros servicios
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

interface SandboxConfig {
  plugin: {
    name: string;
    displayName?: string;
    integration?: any;
    fieldTypes?: any[];
  };
  backend: {
    routes: any;
    basePath: string;
    port?: number;
  };
  frontend?: {
    port?: number;
  };
}

/**
 * Inicia el servidor sandbox
 */
export async function startSandboxServer(configPath: string) {
  const config: SandboxConfig = require(configPath);
  
  const app = express();
  
  // Middleware básico
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  
  // Logging
  app.use((req, res, next) => {
    console.log(`[Sandbox] ${req.method} ${req.path}`);
    next();
  });
  
  // Montar rutas del plugin
  if (config.backend && config.backend.routes) {
    const basePath = config.backend.basePath || '/api';
    app.use(basePath, config.backend.routes);
    console.log(`[Sandbox] ✓ Plugin routes mounted on ${basePath}`);
  }
  
  // Ruta de health check
  app.get('/health', (req, res) => {
    res.json({ 
      status: 'ok', 
      plugin: config.plugin.name,
      timestamp: new Date().toISOString()
    });
  });
  
  // Error handler
  app.use((err: any, req: any, res: any, next: any) => {
    console.error('[Sandbox Error]:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  });
  
  // Iniciar servidor
  const port = config.backend?.port || 3001;
  app.listen(port, () => {
    console.log('');
    console.log('🚀 Formara Plugin Sandbox Server');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📦 Plugin: ${config.plugin.displayName || config.plugin.name}`);
    console.log(`🌐 Server: http://localhost:${port}`);
    console.log(`🔌 API Base: http://localhost:${port}${config.backend.basePath}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.log('Ready for development! 🎉');
    console.log('');
  });
}

// Si se ejecuta directamente
if (require.main === module) {
  const configPath = process.argv[2] || path.join(process.cwd(), 'dev', 'sandbox.config.js');
  
  if (!require('fs').existsSync(configPath)) {
    console.error('❌ sandbox.config.js not found');
    console.error(`Expected: ${configPath}`);
    process.exit(1);
  }
  
  startSandboxServer(configPath);
}

