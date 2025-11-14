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
    
    // TODO: Iniciar frontend shell cuando esté implementado
    console.log('');
    console.log('✓ Backend running');
    console.log('ℹ Frontend shell coming soon...');
    console.log('');
    console.log('Press Ctrl+C to stop');
    
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
    console.log('Frontend shell coming soon...');
    break;
    
  default:
    console.log('Usage: formara-sandbox [command]');
    console.log('');
    console.log('Commands:');
    console.log('  start     Start backend and frontend (default)');
    console.log('  backend   Start backend only');
    console.log('  frontend  Start frontend only');
}

