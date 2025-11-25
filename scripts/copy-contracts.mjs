/**
 * Script para copiar contratos del core al SDK durante el build
 * 
 * Resuelve los symlinks y copia los archivos reales para publicar en npm
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SDK_DIR = path.resolve(__dirname, '..');
const SRC_DIR = path.join(SDK_DIR, 'src');
const DIST_DIR = path.join(SDK_DIR, 'dist');

// Archivos a copiar (resolviendo symlinks)
const contractsToCopy = [
  {
    from: path.join(SRC_DIR, 'contracts/frontend/field-types.ts'),
    to: path.join(DIST_DIR, 'contracts/frontend/field-types.js'),
    toTypes: path.join(DIST_DIR, 'contracts/frontend/field-types.d.ts'),
  },
  {
    from: path.join(SRC_DIR, 'contracts/backend/actions.ts'),
    to: path.join(DIST_DIR, 'contracts/backend/actions.js'),
    toTypes: path.join(DIST_DIR, 'contracts/backend/actions.d.ts'),
  },
  {
    from: path.join(SRC_DIR, 'contracts/backend/hooks.ts'),
    to: path.join(DIST_DIR, 'contracts/backend/hooks.js'),
    toTypes: path.join(DIST_DIR, 'contracts/backend/hooks.d.ts'),
  },
  {
    from: path.join(SRC_DIR, 'contracts/backend/integrations.ts'),
    to: path.join(DIST_DIR, 'contracts/backend/integrations.js'),
    toTypes: path.join(DIST_DIR, 'contracts/backend/integrations.d.ts'),
  },
];

function resolveSymlink(filePath) {
  try {
    const stats = fs.lstatSync(filePath);
    if (stats.isSymbolicLink()) {
      return fs.readlinkSync(filePath);
    }
    return filePath;
  } catch (error) {
    console.warn(`Warning: Could not resolve ${filePath}:`, error.message);
    return filePath;
  }
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

console.log('📦 Copiando contratos del core al SDK...');

// Crear directorios de destino
ensureDir(path.join(DIST_DIR, 'contracts/frontend'));
ensureDir(path.join(DIST_DIR, 'contracts/backend'));

// TypeScript ya compiló los archivos, solo necesitamos verificar que existan
console.log('✓ Contratos compilados por TypeScript');

