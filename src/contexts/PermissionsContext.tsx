// ==========================================
// CONTEXTO DE PERMISOS Y CONTROL DE ACCESO
// ==========================================
import React, { createContext, useMemo } from 'react';
import type { ReactNode } from 'react';
import { useAuthStore } from '../store/authStore';

// ==========================================
// TIPOS Y INTERFACES
// ==========================================
export interface PermissionContextType {
  // Verificación de roles
  isAdmin: boolean;
  isOperator: boolean;
  hasRole: (role: 'ADMIN' | 'OPERATOR') => boolean;
  
  // Permisos específicos
  canManageUsers: boolean;
  canManageVehicles: boolean;
  canViewReports: boolean;
  canManagePayments: boolean;
  canAccessAdminFeatures: boolean;
  
  // Estados de carga
  isLoading: boolean;
  isAuthenticated: boolean;
  
  // Datos del usuario
  currentRole: string | null;
  userId: string | null;
}

interface PermissionProviderProps {
  children: ReactNode;
}

// ==========================================
// CONFIGURACIÓN DE ROLES Y JERARQUÍA
// ==========================================
const ROLE_HIERARCHY = {
  OPERATOR: 1,
  ADMIN: 2
} as const;

const ROLE_PERMISSIONS = {
  ADMIN: [
    'MANAGE_USERS',
    'MANAGE_VEHICLES', 
    'VIEW_REPORTS',
    'MANAGE_PAYMENTS',
    'ACCESS_ADMIN_FEATURES',
    'FULL_ACCESS'
  ],
  OPERATOR: [
    'MANAGE_VEHICLES',
    'VIEW_REPORTS', 
    'MANAGE_PAYMENTS'
  ]
} as const;

// ==========================================
// CONTEXTO
// ==========================================
export const PermissionContext = createContext<PermissionContextType | undefined>(undefined);

// ==========================================
// PROVIDER COMPONENT
// ==========================================
export const PermissionProvider: React.FC<PermissionProviderProps> = ({ children }) => {
  const { user, isLoading: authLoading } = useAuthStore();

  // ==========================================
  // FUNCIONES DE VERIFICACIÓN MEMOIZADAS
  // ==========================================
  const permissionValues = useMemo(() => {
    // Estados básicos
    const isAuthenticated = !!user;
    const isLoading = authLoading || (!user && !authLoading);
    const currentRole = user?.role || null;
    const userId = user?.id || null;

    // Log para debugging - solo en desarrollo
    if (process.env.NODE_ENV === 'development') {
      console.log('🔐 Permissions Context Update:', {
        isAuthenticated,
        currentRole,
        userId,
        isLoading,
        user: user ? { id: user.id, role: user.role, email: user.email } : null
      });
    }

    // Si no hay usuario autenticado, devolver permisos vacíos
    if (!user || !currentRole) {
      return {
        isAdmin: false,
        isOperator: false,
        hasRole: () => false,
        canManageUsers: false,
        canManageVehicles: false,
        canViewReports: false,
        canManagePayments: false,
        canAccessAdminFeatures: false,
        isLoading,
        isAuthenticated,
        currentRole,
        userId
      };
    }

    // Verificaciones de rol
    const isAdmin = currentRole === 'ADMIN';
    const isOperator = currentRole === 'OPERATOR';

    // Función para verificar roles con jerarquía
    const hasRole = (requiredRole: 'ADMIN' | 'OPERATOR'): boolean => {
      if (!currentRole || !(currentRole in ROLE_HIERARCHY)) {
        return false;
      }

      const userRoleLevel = ROLE_HIERARCHY[currentRole as keyof typeof ROLE_HIERARCHY];
      const requiredRoleLevel = ROLE_HIERARCHY[requiredRole];
      
      return userRoleLevel >= requiredRoleLevel;
    };

    // Permisos específicos basados en el rol
    const userPermissions = ROLE_PERMISSIONS[currentRole as keyof typeof ROLE_PERMISSIONS] || [];

    return {
      // Verificación de roles
      isAdmin,
      isOperator,
      hasRole,
      
      // Permisos específicos
      canManageUsers: isAdmin, // Solo ADMIN puede gestionar usuarios
      canManageVehicles: userPermissions.includes('MANAGE_VEHICLES'),
      canViewReports: userPermissions.includes('VIEW_REPORTS'),
      canManagePayments: userPermissions.includes('MANAGE_PAYMENTS'),
      canAccessAdminFeatures: isAdmin,
      
      // Estados
      isLoading,
      isAuthenticated,
      currentRole,
      userId
    };
  }, [user, authLoading]);

  return (
    <PermissionContext.Provider value={permissionValues}>
      {children}
    </PermissionContext.Provider>
  );
};

export default PermissionProvider;
