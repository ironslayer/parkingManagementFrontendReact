import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import type { UserRole } from '../../types/auth';

// ==========================================
// COMPONENTE PERMISSION GATE
// ==========================================
interface PermissionGateProps {
  permissions?: string[];
  roles?: UserRole[];
  requireAll?: boolean;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const PermissionGate: React.FC<PermissionGateProps> = ({
  permissions = [],
  roles = [],
  requireAll = false,
  children,
  fallback = null
}) => {
  const { hasPermission, hasAnyPermission, hasRole, user } = useAuth();

  // Si no hay usuario autenticado, no mostrar nada
  if (!user) {
    return <>{fallback}</>;
  }

  // Verificar permisos
  let hasRequiredPermissions = true;
  if (permissions.length > 0) {
    if (requireAll) {
      hasRequiredPermissions = permissions.every(permission => hasPermission(permission));
    } else {
      hasRequiredPermissions = hasAnyPermission(permissions);
    }
  }

  // Verificar roles
  let hasRequiredRoles = true;
  if (roles.length > 0) {
    if (requireAll) {
      hasRequiredRoles = roles.every(role => hasRole(role));
    } else {
      hasRequiredRoles = roles.some(role => hasRole(role));
    }
  }

  // Mostrar children solo si tiene todos los permisos/roles requeridos
  const hasAccess = hasRequiredPermissions && hasRequiredRoles;

  return hasAccess ? <>{children}</> : <>{fallback}</>;
};

// ==========================================
// COMPONENTES DE CONVENIENCIA
// ==========================================

// Solo para ADMIN
export const AdminOnly: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ 
  children, 
  fallback = null 
}) => (
  <PermissionGate roles={['ADMIN']} fallback={fallback}>
    {children}
  </PermissionGate>
);

// Solo para ADMIN y OPERATOR
export const StaffOnly: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ 
  children, 
  fallback = null 
}) => (
  <PermissionGate roles={['ADMIN', 'OPERATOR']} fallback={fallback}>
    {children}
  </PermissionGate>
);

// Para eliminar vehículos (solo ADMIN)
export const CanDeleteVehicles: React.FC<{ children: React.ReactNode }> = ({ 
  children
}) => (
  <PermissionGate permissions={['vehicles:delete']}>
    {children}
  </PermissionGate>
);

// Para gestionar usuarios (solo ADMIN)
export const CanManageUsers: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ 
  children, 
  fallback = null 
}) => (
  <PermissionGate permissions={['config:users']} fallback={fallback}>
    {children}
  </PermissionGate>
);

// Para procesar pagos (ADMIN y OPERATOR)
export const CanProcessPayments: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ 
  children, 
  fallback = null 
}) => (
  <PermissionGate permissions={['payments:process']} fallback={fallback}>
    {children}
  </PermissionGate>
);
