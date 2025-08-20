// ==========================================
// HOOKS DE PERMISOS Y CONTROL DE ACCESO
// ==========================================
import { useContext, useMemo } from 'react';
import { PermissionContext, type PermissionContextType } from '../contexts/PermissionsContext';

// ==========================================
// HOOK PRINCIPAL DE PERMISOS
// ==========================================
export const usePermissions = (): PermissionContextType => {
  const context = useContext(PermissionContext);
  
  if (context === undefined) {
    throw new Error('usePermissions debe ser usado dentro de un PermissionProvider');
  }
  
  return context;
};

// ==========================================
// HOOK PARA VERIFICACIÓN ESPECÍFICA
// ==========================================
export const usePermissionGuard = (requiredPermission: string) => {
  const permissions = usePermissions();
  
  return useMemo(() => {
    switch (requiredPermission) {
      case 'MANAGE_USERS':
        return permissions.canManageUsers;
      case 'MANAGE_VEHICLES':
        return permissions.canManageVehicles;
      case 'VIEW_REPORTS':
        return permissions.canViewReports;
      case 'MANAGE_PAYMENTS':
        return permissions.canManagePayments;
      case 'ACCESS_ADMIN_FEATURES':
        return permissions.canAccessAdminFeatures;
      default:
        return false;
    }
  }, [permissions, requiredPermission]);
};

// ==========================================
// HOOK PARA VERIFICACIÓN DE ROL ESPECÍFICO
// ==========================================
export const useRoleCheck = () => {
  const permissions = usePermissions();
  
  return useMemo(() => ({
    isExactlyAdmin: permissions.currentRole === 'ADMIN',
    isExactlyOperator: permissions.currentRole === 'OPERATOR',
    hasMinimumRole: (role: 'ADMIN' | 'OPERATOR') => permissions.hasRole(role),
    canAccess: (feature: string) => {
      const featurePermissions = {
        users: permissions.canManageUsers,
        vehicles: permissions.canManageVehicles,
        reports: permissions.canViewReports,
        payments: permissions.canManagePayments,
        admin: permissions.canAccessAdminFeatures
      };
      
      return featurePermissions[feature as keyof typeof featurePermissions] || false;
    }
  }), [permissions]);
};

// ==========================================
// HOOK PARA DEBUG DE PERMISOS
// ==========================================
export const usePermissionsDebug = () => {
  const permissions = usePermissions();
  
  if (process.env.NODE_ENV === 'development') {
    console.table({
      'Usuario Autenticado': permissions.isAuthenticated,
      'Rol Actual': permissions.currentRole,
      'Es Admin': permissions.isAdmin,
      'Es Operador': permissions.isOperator,
      'Puede Gestionar Usuarios': permissions.canManageUsers,
      'Puede Gestionar Vehículos': permissions.canManageVehicles,
      'Estado de Carga': permissions.isLoading
    });
  }
  
  return permissions;
};
