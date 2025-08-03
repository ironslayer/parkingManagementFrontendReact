import React from 'react'
import { useAuthStore } from '../../store/authStore'
import { LoginForm } from './LoginForm'
import { LoadingSpinner } from '../ui/LoadingSpinner'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: 'ADMIN' | 'OPERATOR' | 'USER'
  fallback?: React.ReactNode
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  fallback
}) => {
  const { isAuthenticated, user, isLoading } = useAuthStore()

  // Mostrar loading mientras verificamos autenticación
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  // Si no está autenticado, mostrar login
  if (!isAuthenticated || !user) {
    return fallback || <LoginForm />
  }

  // Verificar rol si es requerido
  if (requiredRole) {
    const roleHierarchy = {
      'USER': 1,
      'OPERATOR': 2,
      'ADMIN': 3
    }

    const userRoleLevel = roleHierarchy[user.role]
    const requiredRoleLevel = roleHierarchy[requiredRole]

    if (userRoleLevel < requiredRoleLevel) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Acceso Denegado
            </h2>
            <p className="text-gray-600 mb-4">
              No tienes permisos suficientes para acceder a esta sección.
            </p>
            <p className="text-sm text-gray-500">
              Rol requerido: <span className="font-medium">{requiredRole}</span> | 
              Tu rol: <span className="font-medium">{user.role}</span>
            </p>
          </div>
        </div>
      )
    }
  }

  // Usuario autenticado y con permisos
  return <>{children}</>
}
