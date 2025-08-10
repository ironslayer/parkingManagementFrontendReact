import React from 'react';
import { cn } from '../../utils';

// ==========================================
// TIPOS DEL COMPONENTE
// ==========================================
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Variante visual del botón
   */
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning' | 'ghost' | 'outline';
  
  /**
   * Tamaño del botón
   */
  size?: 'sm' | 'md' | 'lg';
  
  /**
   * Estado de carga
   */
  loading?: boolean;
  
  
  /**
   * Icono que aparece antes del texto
   */
  leftIcon?: React.ReactNode;

  /**
   * Icono que aparece después del texto
   */
  rightIcon?: React.ReactNode;
  
  /**
   * Si el botón debe ocupar todo el ancho disponible
   */
  fullWidth?: boolean;
  
  /**
   * Contenido del botón
   */
  children: React.ReactNode;
}

// ==========================================
// ESTILOS DEL COMPONENTE
// ==========================================
const buttonVariants = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
  secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500',
  danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
  warning: 'bg-yellow-500 text-white hover:bg-yellow-600 focus:ring-yellow-500',
  ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
  outline: 'border border-gray-300 bg-transparent text-gray-700 hover:bg-gray-50 focus:ring-gray-500',
};

const buttonSizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base', 
  lg: 'px-6 py-3 text-lg',
};

const disabledStyles = 'opacity-50 cursor-not-allowed pointer-events-none';
const loadingStyles = 'cursor-wait';

// ==========================================
// COMPONENTE BUTTON
// ==========================================
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    leftIcon,
    rightIcon,
    fullWidth = false,
    className,
    children,
    ...props
  }, ref) => {
    const isDisabled = disabled || loading;
    
    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={cn(
          // Estilos base
          'inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-offset-2',
          
          // Variante
          buttonVariants[variant],
          
          // Tamaño
          buttonSizes[size],
          
          // Estados
          isDisabled && disabledStyles,
          loading && loadingStyles,
          
          // Ancho completo
          fullWidth && 'w-full',
          
          // Clases personalizadas
          className
        )}
        {...props}
      >
        {/* Icono izquierdo */}
        {leftIcon && !loading && (
          <span className="flex-shrink-0">
            {leftIcon}
          </span>
        )}
        
        {/* Spinner de carga */}
        {loading && (
          <span className="flex-shrink-0">
            <svg 
              className="w-4 h-4 animate-spin" 
              fill="none" 
              viewBox="0 0 24 24"
            >
              <circle 
                className="opacity-25" 
                cx="12" 
                cy="12" 
                r="10" 
                stroke="currentColor" 
                strokeWidth="4"
              />
              <path 
                className="opacity-75" 
                fill="currentColor" 
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </span>
        )}
        
        {/* Contenido del botón */}
        <span>
          {children}
        </span>
        
        {/* Icono derecho */}
        {rightIcon && !loading && (
          <span className="flex-shrink-0">
            {rightIcon}
          </span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

// ==========================================
// EXPORTACIÓN POR DEFECTO
// ==========================================
export default Button;
