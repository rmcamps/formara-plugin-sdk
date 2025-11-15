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
  
  // Auto-descubrir actions del backend
  const backendActionsPath = path.join(pluginDir, 'backend', 'actions.ts');
  const backendActionsPathJS = path.join(pluginDir, 'backend', 'actions.js');
  
  let pluginActions: any[] = [];
  if (fs.existsSync(backendActionsPath)) {
    const actionsModule = require(backendActionsPath);
    pluginActions = actionsModule.actions || actionsModule.default || [];
  } else if (fs.existsSync(backendActionsPathJS)) {
    const actionsModule = require(backendActionsPathJS);
    pluginActions = actionsModule.actions || actionsModule.default || [];
  }
  
  // Auto-descubrir hooks del backend
  const backendHooksPath = path.join(pluginDir, 'backend', 'hooks.ts');
  const backendHooksPathJS = path.join(pluginDir, 'backend', 'hooks.js');
  
  let pluginHooks: any[] = [];
  if (fs.existsSync(backendHooksPath)) {
    const hooksModule = require(backendHooksPath);
    pluginHooks = hooksModule.hooks || hooksModule.default || [];
  } else if (fs.existsSync(backendHooksPathJS)) {
    const hooksModule = require(backendHooksPathJS);
    pluginHooks = hooksModule.hooks || hooksModule.default || [];
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
      
      // Buscar la action en las actions del plugin
      const action = pluginActions.find((a: any) => a.id === actionId);
      
      if (!action) {
        return res.status(404).json({
          success: false,
          error: `Action "${actionId}" no encontrada`,
          availableActions: pluginActions.map((a: any) => a.id)
        });
      }
      
      // Ejecutar el handler real de la action
      if (typeof action.handler === 'function') {
        console.log(`[Sandbox] ▶️  Ejecutando handler real de: ${action.label}`);
        
        const result = await action.handler(contextData);
        
        console.log(`[Sandbox] ${result.success ? '✅' : '❌'} Resultado:`, result.message);
        
        res.json(result);
      } else {
        // Si no tiene handler, devolver mock
        res.json({
          success: true,
          message: `Action "${action.label}" ejecutada (sin handler real definido)`,
          actionId,
          contextReceived: contextData.context || 'unknown',
          warning: 'Action sin handler - define handler en backend/actions.ts'
        });
      }
    } catch (error: any) {
      console.error(`[Sandbox] ❌ Error ejecutando action:`, error);
      res.status(500).json({
        success: false,
        message: 'Error ejecutando action',
        error: error.message || 'Error desconocido',
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  });
  
  // Endpoint para disparar hooks del plugin (para testing en sandbox)
  app.post('/sandbox/dispatch-hook/:hookId', async (req, res) => {
    try {
      const { hookId } = req.params;
      const eventData = req.body;
      
      console.log(`[Sandbox] Disparando hook: ${hookId}`);
      console.log(`[Sandbox] Event:`, eventData.event);
      
      // Buscar el hook en los hooks del plugin
      const hook = pluginHooks.find((h: any) => h.id === hookId);
      
      if (!hook) {
        return res.status(404).json({
          success: false,
          error: `Hook "${hookId}" no encontrado`,
          availableHooks: pluginHooks.map((h: any) => h.id)
        });
      }
      
      // Verificar que el evento coincida
      if (hook.event && eventData.event && hook.event !== eventData.event) {
        console.warn(`[Sandbox] ⚠️  Evento no coincide: hook espera "${hook.event}", recibió "${eventData.event}"`);
      }
      
      // Ejecutar el handler real del hook
      if (typeof hook.handler === 'function') {
        console.log(`[Sandbox] ▶️  Ejecutando handler real del hook: ${hook.id}`);
        
        const result = await hook.handler(eventData.data || eventData);
        
        console.log(`[Sandbox] ${result?.success !== false ? '✅' : '❌'} Hook ejecutado`);
        
        res.json({
          success: result?.success !== false,
          message: result?.message || `Hook "${hook.id}" ejecutado`,
          hookId,
          event: eventData.event,
          data: result?.data,
          executionTime: result?.executionTime
        });
      } else {
        res.json({
          success: true,
          message: `Hook "${hook.id}" registrado (sin handler en sandbox)`,
          hookId,
          event: eventData.event,
          warning: 'Hook sin handler disponible en sandbox'
        });
      }
    } catch (error: any) {
      console.error(`[Sandbox] ❌ Error disparando hook:`, error);
      res.status(500).json({
        success: false,
        message: 'Error disparando hook',
        error: error.message || 'Error desconocido',
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
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


