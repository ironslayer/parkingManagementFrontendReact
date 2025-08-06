import { useAuthStore } from '../store/authStore'

// Hook para verificar permisos específicos
export const usePermissions = () => {
  const { user } = useAuthStore()

  const hasRole = (role: 'ADMIN' | 'OPERATOR') => {
    if (!user) return false

    const roleHierarchy = {
      'OPERATOR': 1,
      'ADMIN': 2
    }
  
    const userRoleLevel = roleHierarchy[user.role]
    const requiredRoleLevel = roleHierarchy[role]

    return userRoleLevel >= requiredRoleLevel
  }

  const canManageUsers = () => hasRole('ADMIN')
  const canManageVehicles = () => hasRole('OPERATOR')
  const canViewReports = () => hasRole('OPERATOR')
  const canManagePayments = () => hasRole('OPERATOR')

  return {
    hasRole,
    canManageUsers,
    canManageVehicles,
    canViewReports,
    canManagePayments,
    isAdmin: user?.role === 'ADMIN',
    isOperator: user?.role === 'OPERATOR'
  }
}
