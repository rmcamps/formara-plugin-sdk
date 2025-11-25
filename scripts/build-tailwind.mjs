/**
 * Script para compilar las clases Tailwind CSS del SDK
 * 
 * Este script genera un archivo CSS precompilado con todas las clases
 * usadas por los componentes del SDK, que luego los plugins pueden importar.
 */

import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { existsSync, mkdirSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const sdkRoot = resolve(__dirname, '..');
const distDir = resolve(sdkRoot, 'dist');

// Asegurar que el directorio dist existe
if (!existsSync(distDir)) {
  mkdirSync(distDir, { recursive: true });
}

console.log('🎨 Compilando clases Tailwind CSS del SDK...\n');

try {
  // Usar Tailwind CLI para compilar
  // Tailwind v4 usa @tailwindcss/cli
  const inputFile = resolve(sdkRoot, 'src/sdk-styles.css');
  const outputFile = resolve(distDir, 'sdk-styles.css');
  const configFile = resolve(sdkRoot, 'tailwind.sdk.config.js');

  // Verificar que los archivos existen
  if (!existsSync(inputFile)) {
    throw new Error(`Archivo de entrada no encontrado: ${inputFile}`);
  }
  if (!existsSync(configFile)) {
    throw new Error(`Archivo de configuración no encontrado: ${configFile}`);
  }

  // Compilar con Tailwind CLI v4
  // Tailwind v4 usa @tailwindcss/cli con sintaxis diferente
  const command = `npx @tailwindcss/cli@latest -i "${inputFile}" -o "${outputFile}" --config "${configFile}"`;

  console.log(`📝 Compilando: ${inputFile} -> ${outputFile}`);
  console.log(`⚙️  Config: ${configFile}\n`);

  execSync(command, {
    cwd: sdkRoot,
    stdio: 'inherit',
    env: {
      ...process.env,
      NODE_ENV: 'production',
    },
  });

  console.log(`\n✅ CSS del SDK compilado exitosamente: ${outputFile}`);
} catch (error) {
  console.error('❌ Error compilando Tailwind CSS del SDK:', error.message);
  process.exit(1);
}

