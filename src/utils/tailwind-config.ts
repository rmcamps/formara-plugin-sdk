/**
 * Helper para configurar Tailwind CSS en plugins de Formara
 * 
 * IMPORTANTE: Tailwind NO escanea archivos en node_modules por defecto,
 * incluso si los agregamos al array `content`. Por eso, este helper proporciona
 * dos funciones:
 * 1. `getPluginTailwindContent()` - Rutas para content (aunque no funcionen para node_modules)
 * 2. `getPluginTailwindSafelist()` - Safelist con clases usadas por el SDK (SOLUCIÓN REAL)
 */

import path from 'path';

/**
 * Obtener rutas de contenido de Tailwind para plugins
 * 
 * NOTA: Estas rutas NO funcionarán para escanear node_modules porque Tailwind
 * ignora node_modules por defecto. Usa `getPluginTailwindSafelist()` en su lugar.
 * 
 * @param pluginDir Directorio del plugin (usar __dirname desde tailwind.config.js)
 * @returns Array de rutas relativas al plugin para incluir en content
 * @deprecated Usar getPluginTailwindSafelist() en su lugar
 */
export function getPluginTailwindContent(pluginDir: string): string[] {
  // Resolver ruta al SDK instalado
  const sdkPath = path.resolve(
    pluginDir,
    'node_modules',
    '@formara',
    'plugin-sdk'
  );
  
  // Rutas relativas al directorio del plugin
  const relativeSdkPath = path.relative(pluginDir, sdkPath);
  
  // Normalizar separadores de ruta para compatibilidad cross-platform
  const normalizePath = (p: string) => p.replace(/\\/g, '/');
  
  return [
    // Archivos fuente TypeScript/TSX del SDK (desarrollo y producción)
    normalizePath(relativeSdkPath + '/src/sandbox/frontend/**/*.{ts,tsx}'),
    normalizePath(relativeSdkPath + '/src/ui/**/*.{ts,tsx}'),
    // Archivos compilados JavaScript (por si acaso, para producción)
    normalizePath(relativeSdkPath + '/dist/sandbox/frontend/**/*.js'),
    normalizePath(relativeSdkPath + '/dist/ui/**/*.js'),
  ];
}

/**
 * Obtener safelist de clases Tailwind usadas por el SDK
 * 
 * Tailwind NO escanea archivos en node_modules por defecto, por lo que
 * debemos usar `safelist` para forzar la generación de clases usadas por el SDK.
 * 
 * Este método devuelve un array de patrones que Tailwind usará para generar
 * las clases necesarias, incluso si no se encuentran en los archivos escaneados.
 * 
 * @returns Array de patrones para usar en safelist de tailwind.config.js
 */
export function getPluginTailwindSafelist(): Array<string | { pattern: RegExp }> {
  // Clases específicas usadas en DevApp y componentes UI del SDK
  // Estas clases se generarán siempre, incluso si no están en los archivos escaneados
  return [
    // Tamaños de texto (usados en DevApp)
    'text-2xl',
    'text-xl',
    'text-lg',
    'text-sm',
    'text-xs',
    
    // Colores de texto (usados en DevApp con dark mode)
    'text-gray-900',
    'text-gray-800',
    'text-gray-700',
    'text-gray-600',
    'text-gray-500',
    'text-gray-400',
    'text-gray-300',
    'text-gray-100',
    'dark:text-gray-100',
    'dark:text-gray-300',
    'dark:text-gray-400',
    
    // Fondos (usados en DevApp con dark mode)
    'bg-gray-50',
    'bg-gray-100',
    'bg-gray-200',
    'bg-gray-700',
    'bg-gray-800',
    'bg-gray-900',
    'dark:bg-gray-900',
    'dark:bg-gray-800',
    'dark:bg-gray-700',
    'dark:bg-gray-950',
    
    // Bordes (usados en componentes UI)
    'border-gray-200',
    'border-gray-300',
    'border-gray-600',
    'border-gray-700',
    'dark:border-gray-600',
    'dark:border-gray-700',
    
    // Padding y margin (usados en DevApp)
    'p-4',
    'p-6',
    'px-3',
    'px-4',
    'py-1',
    'py-2',
    'mb-2',
    'mb-4',
    'mt-1',
    'mt-4',
    
    // Flexbox y Grid (usados en DevApp)
    'flex',
    'flex-col',
    'flex-wrap',
    'items-center',
    'items-start',
    'justify-between',
    'justify-center',
    'gap-2',
    'gap-3',
    'gap-4',
    'grid',
    'grid-cols-1',
    
    // Bordes redondeados (usados en componentes UI)
    'rounded',
    'rounded-md',
    'rounded-lg',
    'rounded-xl',
    
    // Sombras (usados en componentes UI)
    'shadow',
    'shadow-sm',
    'shadow-lg',
    
    // Transiciones (usados en DevApp)
    'transition-colors',
    
    // Otros (usados en DevApp)
    'min-h-screen',
    'max-w-7xl',
    'mx-auto',
    'space-y-1',
    'space-y-2',
    'space-y-4',
    'space-y-6',
    'whitespace-nowrap',
    'overflow-auto',
    'overflow-x-auto',
    'max-h-64',
    'max-h-96',
    'opacity-50',
    'opacity-70',
    
    // Clases para tabs activos (data-[state=active])
    // Nota: Tailwind requiere que estas clases estén explícitamente en safelist
    // Usamos la sintaxis completa con corchetes escapados
    'data-[state=active]:bg-sky-100',
    'data-[state=active]:text-sky-900',
    'data-[state=active]:shadow-sm',
    'data-[state=active]:font-semibold',
    'dark:data-[state=active]:bg-sky-900/30',
    'dark:data-[state=active]:text-sky-100',
    
    // Hover para tabs
    'hover:bg-gray-100',
    'dark:hover:bg-gray-800',
    
    // Colores base necesarios para tabs activos (celeste)
    'bg-sky-100',
    'text-sky-900',
    'bg-sky-900/30',
    'text-sky-100',
    'shadow-sm',
    'font-semibold',
    
    // Patrones dinámicos para clases con variantes
    {
      pattern: /^(text|bg|border)-(gray|blue|sky|cyan|green|red|yellow)-(50|100|200|300|400|500|600|700|800|900)$/,
    },
    {
      pattern: /^dark:(text|bg|border)-(gray|blue|sky|cyan|green|red|yellow)-(50|100|200|300|400|500|600|700|800|900)$/,
    },
    // Patrones para selectores de atributos data-[state=active]
    // Escapamos los corchetes en la expresión regular
    {
      pattern: /^data-\[state=active\]:(bg|text|shadow|font)-(.*)$/,
    },
    {
      pattern: /^dark:data-\[state=active\]:(bg|text|shadow|font)-(.*)$/,
    },
  ];
}
