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
export declare function processMockups(mockupModules: Record<string, {
    default: any;
}>): Record<string, {
    label: string;
    data: any;
}>;
/**
 * @deprecated Usar processMockups() con import.meta.glob en el código del plugin
 * Esta función no funciona porque import.meta.glob se resuelve desde el SDK, no desde el plugin
 */
export declare function loadMockups(): Record<string, {
    label: string;
    data: any;
}>;
/**
 * Carga mockups desde un patrón personalizado (literal)
 *
 * IMPORTANTE: El patrón debe ser un literal string, no una variable.
 * Vite necesita poder resolver el patrón en build time.
 *
 * Ejemplos válidos:
 * - loadMockupsFromPattern('../mockups/*.json')
 * - loadMockupsFromPattern('./mockups/*.json')
 *
 * Ejemplos inválidos:
 * - const pattern = './mockups/*.json'; loadMockupsFromPattern(pattern) // ❌
 *
 * @param pattern - Patrón glob literal (ej: '../mockups/*.json')
 * @returns Record con los mockups cargados
 */
export declare function loadMockupsFromPattern(pattern: './src/mockups/*.json'): Record<string, {
    label: string;
    data: any;
}>;
export declare function loadMockupsFromPattern(pattern: '../mockups/*.json'): Record<string, {
    label: string;
    data: any;
}>;
export declare function loadMockupsFromPattern(pattern: './mockups/*.json'): Record<string, {
    label: string;
    data: any;
}>;
//# sourceMappingURL=mockup-loader.d.ts.map