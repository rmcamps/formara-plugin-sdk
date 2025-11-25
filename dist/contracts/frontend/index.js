/**
 * Contratos Frontend para Plugins de Formara
 *
 * Este archivo re-exporta todas las interfaces frontend del core.
 * En desarrollo (monorepo), usa symlinks a las interfaces del core.
 * En producción (npm package), contiene copias de las interfaces.
 */
// Re-exportar desde el symlink (o copia en build)
export * from './field-types';
