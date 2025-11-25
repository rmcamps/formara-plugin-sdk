/**
 * Helper para configurar Tailwind CSS en plugins de Formara
 *
 * IMPORTANTE: Tailwind NO escanea archivos en node_modules por defecto,
 * incluso si los agregamos al array `content`. Por eso, este helper proporciona
 * dos funciones:
 * 1. `getPluginTailwindContent()` - Rutas para content (aunque no funcionen para node_modules)
 * 2. `getPluginTailwindSafelist()` - Safelist con clases usadas por el SDK (SOLUCIÓN REAL)
 */
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
export declare function getPluginTailwindContent(pluginDir: string): string[];
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
export declare function getPluginTailwindSafelist(): Array<string | {
    pattern: RegExp;
}>;
//# sourceMappingURL=tailwind-config.d.ts.map