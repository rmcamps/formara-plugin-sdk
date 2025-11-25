/**
 * Componente Input básico para plugins
 * Versión simplificada del Input del core
 */

import * as React from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    const baseClasses = "flex h-9 w-full rounded-md border border-gray-300 bg-white px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500 focus-visible:border-indigo-500 disabled:cursor-not-allowed disabled:opacity-50";
    
    return (
      <input
        type={type}
        className={className ? `${baseClasses} ${className}` : baseClasses}
        ref={ref}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";

export { Input };


