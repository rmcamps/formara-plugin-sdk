/**
 * Helper para cargar mockups dinámicamente desde la carpeta mockups del plugin
 *
 * Uso:
 * ```typescript
 * import { loadMockups } from '@formara/plugin-sdk/sandbox/frontend/mockup-loader';
 *
 * // Cargar desde la ubicación estándar: ./src/mockups/*.json
 * const mockups = loadMockups();
 *
 * // O desde una ubicación personalizada (debe ser un literal, no variable)
 * const mockups = loadMockupsFromPattern('../mockups/*.json');
 * ```
 *
 * NOTA: import.meta.glob solo acepta literales, no variables.
 * Por eso hay funciones separadas para diferentes patrones.
 */
/**
 * Procesa los módulos de mockups cargados con import.meta.glob
 *
 * Esta función procesa los resultados de import.meta.glob que debe hacerse
 * en el código del plugin (no en el SDK) porque import.meta.glob se resuelve
 * relativo al archivo donde está escrito, no desde donde se importa.
 *
 * @param mockupModules - Resultado de import.meta.glob('./src/mockups/*.json', { eager: true })
 * @returns Record con los mockups procesados
 *
 * @example
 * ```typescript
 * // En dev.tsx del plugin:
 * import { processMockups } from '@formara/plugin-sdk/sandbox/frontend/mockup-loader';
 *
 * const mockupModules = import.meta.glob('./src/mockups/*.json', { eager: true });
 * const mockups = processMockups(mockupModules);
 * ```
 */
export function processMockups(mockupModules) {
    const mockups = {};
    for (const [path, module] of Object.entries(mockupModules)) {
        // Extraer nombre del archivo sin extensión
        const fileName = path.split('/').pop()?.replace('.json', '') || '';
        // Generar label legible desde el nombre del archivo
        const label = fileName
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
        mockups[fileName] = {
            label,
            data: module.default,
        };
    }
    return mockups;
}
/**
 * @deprecated Usar processMockups() con import.meta.glob en el código del plugin
 * Esta función no funciona porque import.meta.glob se resuelve desde el SDK, no desde el plugin
 */
export function loadMockups() {
    // import.meta.glob solo acepta literales, no variables
    const mockupModules = import.meta.glob('./src/mockups/*.json', { eager: true });
    return processMockups(mockupModules);
}
export function loadMockupsFromPattern(pattern) {
    // Esta función es principalmente para documentación y type safety
    // En la práctica, cada plugin debería usar loadMockups() o importar directamente
    // porque import.meta.glob necesita literales en build time
    // Si el patrón es el estándar, usar loadMockups
    if (pattern === './src/mockups/*.json') {
        return loadMockups();
    }
    // Para otros patrones, el usuario debe importar directamente o usar loadMockups()
    // y ajustar la ruta en su código
    console.warn('loadMockupsFromPattern: Para patrones personalizados, considera importar los mockups directamente o ajustar la estructura de carpetas.');
    return {};
}
