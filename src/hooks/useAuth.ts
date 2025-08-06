import { useMemo } from 'react';
import { useAuthStore } from '../store/authStore';
import { authService } from '../services/authService';
import type { UserRole } from '../types/auth';

// ==========================================
// HOOK DE AUTENTICACIÓN Y PERMISOS
// ==========================================
export const useAuth = () => {
  // Conectar con el store de autenticación
  const { user, isAuthenticated, login: storeLogin, logout: storeLogout } = useAuthStore();

  // ==========================================
  // MÉTODOS DE PERMISOS
  // ==========================================
  const hasPermission = useMemo(() => (permission: string): boolean => {
    return authService.hasPermission(permission, user || undefined);
  }, [user]);

  const hasAnyPermission = useMemo(() => (permissions: string[]): boolean => {
    return authService.hasAnyPermission(permissions, user || undefined);
  }, [user]);

  const hasRole = useMemo(() => (role: UserRole): boolean => {
    return authService.hasRole(role, user || undefined);
  }, [user]);

  // ==========================================
  // PERMISOS ESPECÍFICOS
  // ==========================================
  const canDeleteVehicles = useMemo(() => {
    return authService.canDeleteVehicles(user || undefined);
  }, [user]);

  const canManageUsers = useMemo(() => {
    return authService.canManageUsers(user || undefined);
  }, [user]);

  const canViewReports = useMemo(() => {
    return authService.canViewReports(user || undefined);
  }, [user]);

  const isAdmin = useMemo(() => {
    return user?.role === 'ADMIN';
  }, [user]);

  const isOperator = useMemo(() => {
    return user?.role === 'OPERATOR';
  }, [user]);

  // ==========================================
  // MÉTODOS DE AUTENTICACIÓN (Delegados al store)
  // ==========================================
  const login = async (email: string, password: string) => {
    await storeLogin({ email, password });
  };

  const logout = async () => {
    await storeLogout();
  };

  return {
    // Estado
    user,
    loading: false, // Ya no usamos loading local
    isAuthenticated,
    
    // Roles
    isAdmin,
    isOperator,
    
    // Permisos generales
    hasPermission,
    hasAnyPermission,
    hasRole,
    
    // Permisos específicos
    canDeleteVehicles,
    canManageUsers,
    canViewReports,
    
    // Métodos de autenticación
    login,
    logout
  };
};
