import { useAuthStore } from '../store/authStore'

// Hook para verificar permisos específicos
export const usePermissions = () => {
  const { user } = useAuthStore()

  const hasRole = (role: 'ADMIN' | 'OPERATOR' | 'USER') => {
    if (!user) return false

    const roleHierarchy = {
      'USER': 1,
      'OPERATOR': 2,
      'ADMIN': 3
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
    isOperator: user?.role === 'OPERATOR',
    isUser: user?.role === 'USER'
  }
}
