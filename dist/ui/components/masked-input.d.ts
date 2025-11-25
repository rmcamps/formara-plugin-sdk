/**
 * MaskedInput Component para Plugin SDK
 *
 * Componente de input con máscara para CUIT y otros campos formateados
 * Versión simplificada sin IMask para evitar dependencias pesadas
 */
import React from 'react';
interface MaskedInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
    value?: string;
    onChange?: (value: string) => void;
    mask?: string | ((value: string) => string);
    placeholder?: string;
}
/**
 * Componente MaskedInput
 * Versión simplificada sin dependencias externas (IMask)
 */
export declare const MaskedInput: React.ForwardRefExoticComponent<MaskedInputProps & React.RefAttributes<HTMLInputElement>>;
export {};
//# sourceMappingURL=masked-input.d.ts.map