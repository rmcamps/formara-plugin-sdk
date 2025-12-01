/**
 * Sistema modular de tipos de campo para Formara
 * Cada tipo de campo es un módulo independiente que se puede
 * agregar/quitar/modificar sin afectar el resto del sistema
 */

import { z } from 'zod';

/**
 * Capacidades opcionales que un tipo de campo puede soportar
 */
export interface FieldTypeCapabilities {
  /** Soporta máscaras de input */
  supportsMask?: boolean;
  /** Soporta validación con fórmulas */
  supportsValidate?: boolean;
  /** Soporta cálculo con fórmulas */
  supportsCalc?: boolean;
  /** Soporta layout inline */
  supportsInlineLayout?: boolean;
}

/**
 * Definición de un tipo de campo
 */
export interface FieldTypeDefinition {
  /** ID único del tipo (ej: 'string', 'email', 'cuit') */
  id: string;
  
  /** Nombre legible para mostrar en UI */
  label: string;
  
  /** Categoría para agrupar en UI */
  category: 'basic' | 'specialized' | 'structural' | 'file' | 'custom';
  
  /** Descripción del tipo */
  description?: string;
  
  /** Hint para la IA (se incluye en el prompt de OpenAI para mejor extracción) */
  aiHint?: string;
  
  /** Ícono para mostrar (opcional) */
  icon?: string;
  
  /** Capacidades que soporta este tipo de campo */
  capabilities?: FieldTypeCapabilities;
  
  /** Renderizar preview en el editor de formularios */
  renderPreview: (props: FieldPreviewProps) => React.ReactNode;
  
  /** Renderizar campo en formulario dinámico (para llenar datos) */
  renderField?: (props: FieldRenderProps) => React.ReactNode;
  
  /** Componente para configuración en panel de propiedades (opcional) */
  ConfigComponent?: React.FC<FieldConfigProps>;
  
  /** Generar schema de validación Zod */
  generateZodSchema: (config: FieldConfig) => z.ZodTypeAny;
  
  /** Función de validación personalizada (ejecutada al cargar/editar datos) */
  validate?: (value: any, config: FieldConfig) => { 
    valid: boolean; 
    error?: string;
    message?: string; // Mensaje descriptivo de lo que se validó
  };
  
  /** Hook para obtener dependencias de cálculo desde una fórmula */
  onCalcDependencies?: (formula: string) => string[];
  
  /** Propiedades configurables específicas de este tipo */
  configSchema?: Record<string, any>;
  
  /** Valor por defecto para este tipo */
  defaultValue: any;
}

/**
 * Props para renderizar preview en editor
 */
export interface FieldPreviewProps {
  title: string;
  description?: string;
  config: FieldConfig;
  onChange: (description: string) => void;
}

/**
 * Props para renderizar campo en formulario
 */
export interface FieldRenderProps {
  value: any;
  onChange: (value: any) => void;
  config: FieldConfig;
  error?: string;
  disabled?: boolean;
  onBlur?: () => void;      // NUEVO: Para triggers onBlur
  onFocus?: () => void;     // NUEVO: Para triggers onFocus
}

/**
 * Props para renderizar configuración en panel de propiedades
 */
export interface FieldConfigProps {
  node: any; // El nodo del schema actual
  setNode: (partial: any) => void; // Función para actualizar el nodo
}

/**
 * Máscara de input para tipos de campo
 */
export type InputMask = 
  | string 
  | {
      preset?: 'date' | 'datetime' | 'time' | 'email' | 'url' | 'phone' | 'money';
      pattern?: string;
    };

/**
 * Configuración de relación para campos tipo 'relation'
 */
export interface RelationConfig {
  /** ID o slug del formulario relacionado */
  form: string;
  /** Campos para búsqueda */
  searchFields: string[];
  /** Campos para mostrar (si no se especifica, mostrar los primeros 6 o los marcados como importantes) */
  displayFields?: string[];
}

/**
 * Configuración de un campo
 */
export interface FieldConfig {
  name: string;
  type: string;
  label?: string;
  description?: string;
  placeholder?: string;
  required?: boolean | string; // MEJORADO: ahora puede ser expresión FSL
  validation?: {
    pattern?: string;
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
  };
  options?: Array<{ value: string; label: string }>;
  accept?: string;
  multiple?: boolean;
  defaultValue?: any;
  
  // Propiedades de scripting y condicionales
  /** Máscara de input (para string, number, integer) */
  input_mask?: InputMask;
  
  /** Fórmula de validación (FSL, retorna boolean) - LEGACY, usar validations[] */
  validate?: string;
  
  /** Mensaje de error personalizado para validación - LEGACY */
  validate_error?: string;
  
  /** Validaciones múltiples (NUEVO) */
  validations?: Array<{
    expression: string;   // Expresión FSL que debe retornar boolean
    message: string;      // Mensaje de error si la validación falla
  }>;
  
  /** Fórmula de cálculo (FSL, hace el campo readonly) */
  calc?: string;
  
  /** Condición de visibilidad (NUEVO) - Expresión FSL o boolean */
  visible?: string | boolean;
  
  /** Condición de editabilidad (NUEVO) - Expresión FSL o boolean */
  enabled?: string | boolean;
  
  /** Triggers de eventos (NUEVO) */
  triggers?: {
    onChange?: string;    // Script FSL ejecutado al cambiar el valor
    onFocus?: string;     // Script FSL ejecutado al hacer foco
    onBlur?: string;      // Script FSL ejecutado al perder foco
  };
  
  /** Configuración de relación (solo para type: 'relation') */
  relation?: RelationConfig;
  
  /** Permanecer en la misma línea que el campo anterior (layout) */
  stayinline?: boolean;
  
  /** Ancho del campo en unidades grid (1-12, cada unidad ~30px o columna) */
  width?: number;
  
  /** Marcar campo como importante/relevante */
  important?: boolean;
  
  [key: string]: any; // Propiedades custom por tipo
}

