/**
 * MaskedInput Component para Plugin SDK
 * 
 * Componente de input con máscara para CUIT y otros campos formateados
 * Versión simplificada sin IMask para evitar dependencias pesadas
 */

import React, { useRef, useEffect, forwardRef } from 'react';
import { Input } from './input';

interface MaskedInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value?: string;
  onChange?: (value: string) => void;
  mask?: string | ((value: string) => string);
  placeholder?: string;
}

/**
 * Aplicar máscara a un valor
 * Soporta máscaras simples como "XX-XXXXXXXX-X" o "00-00000000-0" para CUIT
 */
function applyMask(value: string, mask?: string | ((value: string) => string)): string {
  if (!mask) return value;
  
  if (typeof mask === 'function') {
    return mask(value);
  }
  
  // Máscara simple basada en patrones comunes
  // Soporta tanto "X" como "0" para dígitos
  // Ejemplos: "XX-XXXXXXXX-X" o "00-00000000-0" para CUIT
  if (mask.includes('X') || mask.includes('0')) {
    const cleanValue = value.replace(/[^0-9]/g, '');
    let masked = '';
    let valueIndex = 0;
    
    for (let i = 0; i < mask.length && valueIndex < cleanValue.length; i++) {
      if (mask[i] === 'X' || mask[i] === '0') {
        masked += cleanValue[valueIndex];
        valueIndex++;
      } else {
        masked += mask[i];
      }
    }
    
    return masked;
  }
  
  return value;
}

/**
 * Componente MaskedInput
 * Versión simplificada sin dependencias externas (IMask)
 */
export const MaskedInput = forwardRef<HTMLInputElement, MaskedInputProps>(
  ({ value = '', onChange, mask, placeholder, ...props }, ref) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [displayValue, setDisplayValue] = React.useState(value || '');
    
    // Sincronizar con value externo
    useEffect(() => {
      if (value !== displayValue) {
        setDisplayValue(value || '');
      }
    }, [value]);
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      let processedValue = newValue;
      
      // Aplicar máscara si está definida
      if (mask) {
        processedValue = applyMask(newValue, mask);
      }
      
      setDisplayValue(processedValue);
      
      // Llamar onChange con el valor procesado
      if (onChange) {
        onChange(processedValue);
      }
    };
    
    const handleBlur = () => {
      // Al perder foco, asegurar que el valor esté formateado correctamente
      if (mask && displayValue) {
        const formatted = applyMask(displayValue, mask);
        if (formatted !== displayValue) {
          setDisplayValue(formatted);
          if (onChange) {
            onChange(formatted);
          }
        }
      }
    };
    
    // Combinar refs
    useEffect(() => {
      if (typeof ref === 'function') {
        ref(inputRef.current);
      } else if (ref) {
        (ref as React.MutableRefObject<HTMLInputElement | null>).current = inputRef.current;
      }
    }, [ref]);
    
    return (
      <Input
        ref={inputRef}
        value={displayValue}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        {...props}
      />
    );
  }
);

MaskedInput.displayName = 'MaskedInput';

