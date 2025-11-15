/**
 * Input con máscara simplificado para plugins
 * Nota: Versión básica, el core tiene implementación completa con IMask
 */

import React from 'react';
import { Input } from './input';

export interface MaskedInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: string;
  onChange: (value: string) => void;
  mask?: string | { preset?: string; pattern?: string };
}

export const MaskedInput = React.forwardRef<HTMLInputElement, MaskedInputProps>(
  ({ value, onChange, mask, placeholder, ...props }, ref) => {
    // Versión simplificada: solo pasa el placeholder
    // El core tiene la implementación completa con IMask
    
    return (
      <Input
        ref={ref}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        {...props}
      />
    );
  }
);

MaskedInput.displayName = 'MaskedInput';


