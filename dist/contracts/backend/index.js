/**
 * Contratos Backend para Plugins de Formara
 *
 * Este archivo re-exporta todas las interfaces backend del core.
 * En desarrollo (monorepo), usa symlinks a las interfaces del core.
 * En producción (npm package), contiene copias de las interfaces.
 */
// Re-exportar desde symlinks (o copias en build)
export * from './actions';
export * from './hooks';
export * from './integrations';
export * from './generates';
export * from './distributes';
