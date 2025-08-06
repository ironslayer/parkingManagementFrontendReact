import React from 'react';
import { cn } from '../../utils';

// ==========================================
// TIPOS DEL COMPONENTE
// ==========================================
export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /**
   * Variante visual del badge
   */
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
  
  /**
   * Tamaño del badge
   */
  size?: 'sm' | 'md' | 'lg';
  
  /**
   * Si el badge debe ser outlined
   */
  outline?: boolean;
  
  /**
   * Icono que aparece antes del texto
   */
  leftIcon?: React.ReactNode;
  
  /**
   * Icono que aparece después del texto
   */
  rightIcon?: React.ReactNode;
  
  /**
   * Si el badge es removible (muestra X)
   */
  removable?: boolean;
  
  /**
   * Función que se ejecuta al remover el badge
   */
  onRemove?: () => void;
  
  /**
   * Contenido del badge
   */
  children: React.ReactNode;
}

// ==========================================
// ESTILOS DEL COMPONENTE
// ==========================================
const badgeVariants = {
  default: {
    solid: 'bg-gray-100 text-gray-800',
    outline: 'border border-gray-300 text-gray-700 bg-transparent',
  },
  primary: {
    solid: 'bg-blue-100 text-blue-800',
    outline: 'border border-blue-300 text-blue-700 bg-transparent',
  },
  secondary: {
    solid: 'bg-gray-100 text-gray-800',
    outline: 'border border-gray-300 text-gray-700 bg-transparent',
  },
  success: {
    solid: 'bg-green-100 text-green-800',
    outline: 'border border-green-300 text-green-700 bg-transparent',
  },
  warning: {
    solid: 'bg-yellow-100 text-yellow-800',
    outline: 'border border-yellow-300 text-yellow-700 bg-transparent',
  },
  danger: {
    solid: 'bg-red-100 text-red-800',
    outline: 'border border-red-300 text-red-700 bg-transparent',
  },
  info: {
    solid: 'bg-cyan-100 text-cyan-800',
    outline: 'border border-cyan-300 text-cyan-700 bg-transparent',
  },
};

const badgeSizes = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
  lg: 'px-3 py-1.5 text-base',
};

// ==========================================
// COMPONENTE BADGE
// ==========================================
export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({
    variant = 'default',
    size = 'md',
    outline = false,
    leftIcon,
    rightIcon,
    removable = false,
    onRemove,
    className,
    children,
    ...props
  }, ref) => {
    const badgeStyle = outline ? badgeVariants[variant].outline : badgeVariants[variant].solid;
    
    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center gap-1 font-medium rounded-full transition-colors',
          badgeStyle,
          badgeSizes[size],
          className
        )}
        {...props}
      >
        {/* Left Icon */}
        {leftIcon && (
          <span className="flex-shrink-0">
            {leftIcon}
          </span>
        )}
        
        {/* Content */}
        <span>
          {children}
        </span>
        
        {/* Right Icon */}
        {rightIcon && !removable && (
          <span className="flex-shrink-0">
            {rightIcon}
          </span>
        )}
        
        {/* Remove Button */}
        {removable && (
          <button
            type="button"
            onClick={onRemove}
            className="flex-shrink-0 hover:bg-black hover:bg-opacity-10 rounded-full p-0.5 transition-colors"
            aria-label="Remover"
          >
            <svg 
              className="w-3 h-3" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M6 18L18 6M6 6l12 12" 
              />
            </svg>
          </button>
        )}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

// ==========================================
// VARIANTES ESPECIALES DEL BADGE
// ==========================================

/**
 * Badge para mostrar estado de vehículos
 */
export const VehicleTypeBadge: React.FC<{ type: 'AUTO' | 'MOTOCICLETA' | 'CAR' | 'MOTORCYCLE' | 'TRUCK' }> = ({ type }) => {
  const getVariantAndText = (vehicleType: string) => {
    switch (vehicleType) {
      case 'AUTO':
      case 'CAR':
        return { variant: 'primary' as const, text: 'Automóvil', icon: '🚗' }
      case 'MOTOCICLETA':
      case 'MOTORCYCLE':
        return { variant: 'secondary' as const, text: 'Motocicleta', icon: '🏍️' }
      case 'TRUCK':
        return { variant: 'warning' as const, text: 'Camión', icon: '🚛' }
      default:
        return { variant: 'default' as const, text: vehicleType, icon: '🚗' }
    }
  }

  const { variant, text, icon } = getVariantAndText(type)
  
  return (
    <Badge variant={variant} className="inline-flex items-center gap-1 font-medium">
      <span>{icon}</span>
      {text}
    </Badge>
  )
}

/**
 * Badge para mostrar estado de sesiones
 */
export const SessionStatusBadge: React.FC<{ status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED' }> = ({ status }) => {
  const getVariantAndText = (sessionStatus: string) => {
    switch (sessionStatus) {
      case 'ACTIVE':
        return { variant: 'success' as const, text: 'Activa' };
      case 'COMPLETED':
        return { variant: 'primary' as const, text: 'Completada' };
      case 'CANCELLED':
        return { variant: 'danger' as const, text: 'Cancelada' };
      default:
        return { variant: 'default' as const, text: 'Desconocido' };
    }
  };

  const { variant, text } = getVariantAndText(status);
  
  return <Badge variant={variant} size="sm">{text}</Badge>;
};

/**
 * Badge para mostrar estado de pagos
 */
export const PaymentStatusBadge: React.FC<{ status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED' }> = ({ status }) => {
  const getVariantAndText = (paymentStatus: string) => {
    switch (paymentStatus) {
      case 'PENDING':
        return { variant: 'warning' as const, text: 'Pendiente' };
      case 'COMPLETED':
        return { variant: 'success' as const, text: 'Completado' };
      case 'FAILED':
        return { variant: 'danger' as const, text: 'Fallido' };
      case 'REFUNDED':
        return { variant: 'info' as const, text: 'Reembolsado' };
      default:
        return { variant: 'default' as const, text: 'Desconocido' };
    }
  };

  const { variant, text } = getVariantAndText(status);
  
  return <Badge variant={variant} size="sm">{text}</Badge>;
};

// ==========================================
// EXPORTACIÓN POR DEFECTO
// ==========================================
export default Badge;
