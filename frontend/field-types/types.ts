/**
 * Tipos para el sistema de field types de Formara
 */

import { z } from 'zod';

/**
 * Capacidades opcionales que un tipo de campo puede soportar
 */
export interface FieldTypeCapabilities {
  supportsMask?: boolean;
  supportsValidate?: boolean;
  supportsCalc?: boolean;
  supportsInlineLayout?: boolean;
}

/**
 * Configuración de un campo
 */
export interface FieldConfig {
  id?: string;
  type: string;
  label?: string;
  description?: string;
  placeholder?: string;
  required?: boolean;
  defaultValue?: any;
  options?: Array<{ value: string; label: string }>;
  mask?: string;
  validate?: string;
  calc?: string;
  [key: string]: any;
}

/**
 * Definición de un tipo de campo
 */
export interface FieldTypeDefinition {
  id: string;
  label: string;
  category: 'basic' | 'specialized' | 'structural' | 'file' | 'custom';
  description?: string;
  aiHint?: string;
  icon?: string;
  capabilities?: FieldTypeCapabilities;
  renderPreview: (props: FieldPreviewProps) => React.ReactNode;
  renderField?: (props: FieldRenderProps) => React.ReactNode;
  ConfigComponent?: React.FC<FieldConfigProps>;
  generateZodSchema: (config: FieldConfig) => z.ZodTypeAny;
  validate?: (value: any, config: FieldConfig) => {
    valid: boolean;
    error?: string;
    message?: string;
  };
  onCalcDependencies?: (formula: string) => string[];
  configSchema?: Record<string, any>;
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
  disabled?: boolean;
  error?: string;
}

/**
 * Props para componente de configuración de campo
 */
export interface FieldConfigProps {
  config: FieldConfig;
  onChange: (config: Partial<FieldConfig>) => void;
}


