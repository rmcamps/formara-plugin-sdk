/**
 * Contratos Frontend para Plugins de Formara
 * 
 * Este archivo re-exporta todas las interfaces frontend del core.
 * Los archivos son copias directas del core (ya no symlinks).
 */

// Re-exportar desde field-types (ahora es archivo real, no symlink)
export * from './field-types.js';

// Tipos adicionales que los plugins pueden necesitar
export type { FieldTypeDefinition, FieldPreviewProps, FieldRenderProps, FieldConfigProps, FieldConfig } from './field-types.js';

