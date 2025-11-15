/**
 * Sandbox Server para desarrollo de plugins
 * 
 * Express server mock que monta las rutas del plugin
 * NO instancia Prisma directamente (las rutas usan el SDK que tiene mocks o DB configurada)
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

/**
 * Inicia el servidor sandbox
 */
export async function startSandboxServer(pluginDir: string) {
  const fs = require('fs');
  
  // Leer manifest.json del plugin
  const manifestPath = path.join(pluginDir, 'manifest.json');
  if (!fs.existsSync(manifestPath)) {
    console.error('❌ manifest.json not found in plugin directory');
    process.exit(1);
  }
  
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
  
  // Auto-descubrir rutas del backend
  const backendRoutesPath = path.join(pluginDir, 'backend', 'routes.ts');
  const backendRoutesPathJS = path.join(pluginDir, 'backend', 'routes.js');
  
  let routes;
  if (fs.existsSync(backendRoutesPath)) {
    routes = require(backendRoutesPath).default || require(backendRoutesPath);
  } else if (fs.existsSync(backendRoutesPathJS)) {
    routes = require(backendRoutesPathJS).default || require(backendRoutesPathJS);
  }
  
  const pluginName = manifest.name;
  const pluginDisplayName = manifest.displayName || manifest.name;
  
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
  const basePath = `/api/plugins/${pluginName}`;
  if (routes) {
    app.use(basePath, routes);
    console.log(`[Sandbox] ✓ Plugin routes mounted on ${basePath}`);
  }
  
  // Endpoint para obtener configuración del plugin (para el frontend)
  app.get('/sandbox/plugin-info', (req, res) => {
    res.json({
      name: pluginName,
      displayName: pluginDisplayName,
      description: manifest.description,
      capabilities: manifest.capabilities || {},
      fieldTypes: manifest.capabilities?.fieldTypes || [],
      actions: manifest.capabilities?.actions || [],
      hooks: manifest.capabilities?.hooks || [],
      integrations: manifest.capabilities?.integrations || []
    });
  });
  
  // Endpoint para ejecutar actions del plugin (para testing en sandbox)
  app.post('/sandbox/execute-action/:actionId', async (req, res) => {
    try {
      const { actionId } = req.params;
      const contextData = req.body;
      
      console.log(`[Sandbox] Ejecutando action: ${actionId}`);
      console.log(`[Sandbox] Context data:`, JSON.stringify(contextData, null, 2));
      
      // TODO: Implementar ejecución real de actions
      // Por ahora, devolver respuesta mock
      res.json({
        success: true,
        message: `Action "${actionId}" ejecutada en modo sandbox`,
        actionId,
        contextReceived: contextData.context || 'unknown',
        warning: 'Ejecución simulada - implementar handler real del plugin'
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Error ejecutando action'
      });
    }
  });
  
  // Ruta de health check
  app.get('/health', (req, res) => {
    res.json({ 
      status: 'ok', 
      plugin: pluginName,
      displayName: pluginDisplayName,
      timestamp: new Date().toISOString()
    });
  });
  
  // Error handler
  app.use((err: any, req: any, res: any, next: any) => {
    console.error('[Sandbox Error]:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  });
  
  // Iniciar servidor
  const port = process.env.PORT || 3001;
  app.listen(port, () => {
    console.log('');
    console.log('🚀 Formara Plugin Sandbox Server');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📦 Plugin: ${pluginDisplayName}`);
    console.log(`🌐 Server: http://localhost:${port}`);
    console.log(`🔌 API Base: http://localhost:${port}${basePath}`);
    console.log(`📋 Info: http://localhost:${port}/sandbox/plugin-info`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.log('📊 Plugin capabilities:');
    if (manifest.capabilities?.fieldTypes?.length > 0) {
      console.log(`   - Field Types: ${manifest.capabilities.fieldTypes.length}`);
    }
    if (manifest.capabilities?.actions?.length > 0) {
      console.log(`   - Actions: ${manifest.capabilities.actions.length}`);
    }
    if (manifest.capabilities?.hooks?.length > 0) {
      console.log(`   - Hooks: ${manifest.capabilities.hooks.length}`);
    }
    console.log('');
    console.log('Ready for development! 🎉');
    console.log('');
  });
}

// Si se ejecuta directamente
if (require.main === module) {
  const pluginDir = process.argv[2] || process.cwd();
  startSandboxServer(pluginDir);
}


