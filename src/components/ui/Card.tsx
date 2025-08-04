import React from 'react';
import { cn } from '../../utils';

// ==========================================
// TIPOS DEL COMPONENTE
// ==========================================
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Variante visual de la tarjeta
   */
  variant?: 'default' | 'outlined' | 'elevated' | 'flat';
  
  /**
   * Tamaño del padding interno
   */
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  
  /**
   * Si la tarjeta es clickeable
   */
  clickable?: boolean;
  
  /**
   * Contenido de la tarjeta
    */
  children: React.ReactNode;
}

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Título de la tarjeta
   */
  title?: string;
  
  /**
   * Subtítulo de la tarjeta
   */
  subtitle?: string;
  
  /**
   * Acciones del header (botones, iconos, etc.)
   */
  actions?: React.ReactNode;
  
  /**
   * Contenido personalizado del header
   */
  children?: React.ReactNode;
}

export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Contenido del cuerpo de la tarjeta
   */
  children: React.ReactNode;
}

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Contenido del pie de la tarjeta
   */
  children: React.ReactNode;
}

// ==========================================
// ESTILOS DEL COMPONENTE
// ==========================================
const cardVariants = {
  default: 'bg-white border border-gray-200 shadow-sm',
  outlined: 'bg-white border-2 border-gray-300',
  elevated: 'bg-white border border-gray-200 shadow-lg',
  flat: 'bg-white',
};

const cardPadding = {
  none: 'p-0',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
  xl: 'p-8',
};

const clickableStyles = 'cursor-pointer hover:shadow-md transition-shadow duration-200';

// ==========================================
// COMPONENTE CARD PRINCIPAL
// ==========================================
export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({
    variant = 'default',
    padding = 'lg',
    clickable = false,
    className,
    children,
    ...props
  }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'rounded-lg',
          cardVariants[variant],
          cardPadding[padding],
          clickable && clickableStyles,
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

// ==========================================
// COMPONENTE CARD HEADER
// ==========================================
export const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ title, subtitle, actions, className, children, ...props }, ref) => {
    if (children) {
      return (
        <div
          ref={ref}
          className={cn('mb-4', className)}
          {...props}
        >
          {children}
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn('flex items-start justify-between mb-4', className)}
        {...props}
      >
        <div className="flex-1">
          {title && (
            <h3 className="mb-1 text-lg font-semibold text-gray-900">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="text-sm text-gray-600">
              {subtitle}
            </p>
          )}
        </div>
        
        {actions && (
          <div className="flex-shrink-0 ml-4">
            {actions}
          </div>
        )}
      </div>
    );
  }
);

CardHeader.displayName = 'CardHeader';

// ==========================================
// COMPONENTE CARD CONTENT
// ==========================================
export const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('text-gray-700', className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardContent.displayName = 'CardContent';

// ==========================================
// COMPONENTE CARD FOOTER
// ==========================================
export const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('mt-4 pt-4 border-t border-gray-200', className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardFooter.displayName = 'CardFooter';

// ==========================================
// EXPORTACIÓN POR DEFECTO
// ==========================================
export default Card;
