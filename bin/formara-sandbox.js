#!/usr/bin/env node

/**
 * CLI para ejecutar sandbox de plugins
 */

const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');

const command = process.argv[2] || 'start';
const pluginDir = process.cwd();

// Verificar que estamos en un directorio de plugin
const configPath = path.join(pluginDir, 'dev', 'sandbox.config.js');
if (!fs.existsSync(configPath)) {
  console.error('❌ Error: sandbox.config.js not found');
  console.error('Are you running this from a plugin directory?');
  console.error(`Expected: ${configPath}`);
  process.exit(1);
}

console.log('🚀 Formara Plugin Sandbox');
console.log('');

switch (command) {
  case 'start':
    console.log('Starting backend and frontend...');
    
    // Buscar sandbox-server en el SDK
    const sdkPath = path.join(pluginDir, 'node_modules', '@formara', 'plugin-sdk');
    const serverScript = path.join(sdkPath, 'dev', 'sandbox-server.ts');
    
    if (!fs.existsSync(serverScript)) {
      console.error('❌ SDK not found. Run: npm install');
      process.exit(1);
    }
    
    // Ejecutar backend con ts-node
    const backend = spawn('npx', ['ts-node', serverScript, configPath], {
      cwd: pluginDir,
      stdio: 'inherit',
      env: { ...process.env, NODE_ENV: 'development' }
    });
    
    backend.on('error', (err) => {
      console.error('❌ Error starting backend:', err.message);
      process.exit(1);
    });
    
    backend.on('exit', (code) => {
      if (code !== 0) {
        console.log('Backend stopped');
      }
    });
    
    // Esperar 2 segundos para que el backend arranque
    setTimeout(() => {
      console.log('');
      console.log('✓ Backend running on http://localhost:3001');
      console.log('Starting frontend shell...');
      console.log('');
      
      // Ejecutar frontend shell con vite
      const shellPath = path.join(sdkPath, 'dev', 'sandbox-shell');
      const frontend = spawn('npm', ['run', 'dev'], {
        cwd: shellPath,
        stdio: 'inherit',
        env: { ...process.env, NODE_ENV: 'development' }
      });
      
      frontend.on('error', (err) => {
        console.error('❌ Error starting frontend:', err.message);
      });
      
      console.log('✓ Frontend will be available at http://localhost:5174');
      console.log('');
      console.log('Press Ctrl+C to stop both servers');
    }, 2000);
    
    break;
    
  case 'backend':
    console.log('Starting backend only...');
    const sdkPathBackend = path.join(pluginDir, 'node_modules', '@formara', 'plugin-sdk');
    const serverScriptBackend = path.join(sdkPathBackend, 'dev', 'sandbox-server.ts');
    
    const backendOnly = spawn('npx', ['ts-node', serverScriptBackend, configPath], {
      cwd: pluginDir,
      stdio: 'inherit',
      env: { ...process.env, NODE_ENV: 'development' }
    });
    break;
    
  case 'frontend':
    console.log('Starting frontend shell...');
    const sdkPathFrontend = path.join(pluginDir, 'node_modules', '@formara', 'plugin-sdk');
    const shellPathFrontend = path.join(sdkPathFrontend, 'dev', 'sandbox-shell');
    
    if (!fs.existsSync(shellPathFrontend)) {
      console.error('❌ Sandbox shell not found');
      process.exit(1);
    }
    
    const frontendOnly = spawn('npm', ['run', 'dev'], {
      cwd: shellPathFrontend,
      stdio: 'inherit',
      env: { ...process.env, NODE_ENV: 'development' }
    });
    break;
    
  default:
    console.log('Usage: formara-sandbox [command]');
    console.log('');
    console.log('Commands:');
    console.log('  start     Start backend and frontend (default)');
    console.log('  backend   Start backend only');
    console.log('  frontend  Start frontend only');
}

