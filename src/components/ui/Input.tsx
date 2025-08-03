import React from 'react';
import { cn } from '../../utils';

// ==========================================
// TIPOS DEL COMPONENTE
// ==========================================
export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /**
   * Etiqueta del campo
   */
  label?: string;
  
  /**
   * Mensaje de error
   */
  error?: string;
  
  /**
   * Texto de ayuda
   */
  helperText?: string;
  
  /**
   * Icono que aparece antes del input
   */
  leftIcon?: React.ReactNode;
  
  /**
   * Icono que aparece después del input
   */
  rightIcon?: React.ReactNode;
  
  /**
   * Si el campo es requerido
   */
  required?: boolean;
  
  /**
   * Tamaño del input
   */
  size?: 'sm' | 'md' | 'lg';
}

// ==========================================
// ESTILOS DEL COMPONENTE
// ==========================================
const inputSizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-3 py-2 text-base',
  lg: 'px-4 py-3 text-lg',
};

const baseInputStyles = [
  'w-full rounded-md border border-gray-300 transition-colors',
  'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
  'disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed',
  'placeholder:text-gray-400'
];

const errorInputStyles = [
  'border-red-300 focus:ring-red-500 focus:border-red-500'
];

// ==========================================
// COMPONENTE INPUT
// ==========================================
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({
    label,
    error,
    helperText,
    leftIcon,
    rightIcon,
    required = false,
    size = 'md',
    className,
    id,
    ...props
  }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const hasError = !!error;
    
    return (
      <div className="w-full">
        {/* Label */}
        {label && (
          <label 
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        
        {/* Input Container */}
        <div className="relative">
          {/* Left Icon */}
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-400">
                {leftIcon}
              </span>
            </div>
          )}
          
          {/* Input Field */}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              baseInputStyles,
              inputSizes[size],
              hasError && errorInputStyles,
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              className
            )}
            {...props}
          />
          
          {/* Right Icon */}
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="text-gray-400">
                {rightIcon}
              </span>
            </div>
          )}
        </div>
        
        {/* Error Message */}
        {error && (
          <p className="mt-1 text-sm text-red-600">
            {error}
          </p>
        )}
        
        {/* Helper Text */}
        {helperText && !error && (
          <p className="mt-1 text-sm text-gray-500">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

// ==========================================
// EXPORTACIÓN POR DEFECTO
// ==========================================
export default Input;
