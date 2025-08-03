import React, { useState } from 'react'
import { LogOut, Settings, User, Bell, Menu } from 'lucide-react'
import { Button } from '../ui/Button'
import { Modal, ModalFooter } from '../ui/Modal'
import { useAuthStore } from '../../store/authStore'
import { usePermissions } from '../../hooks/usePermissions'

interface DashboardHeaderProps {
  onMenuToggle?: () => void
  title?: string
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  onMenuToggle,
  title = "Dashboard"
}) => {
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const { user, logout } = useAuthStore()
  const { isAdmin } = usePermissions()

  const handleLogout = () => {
    logout()
    setShowLogoutModal(false)
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-red-100 text-red-800'
      case 'OPERATOR':
        return 'bg-blue-100 text-blue-800'
      case 'USER':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <>
      <header className="flex items-center justify-between h-16 px-6 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center">
          {onMenuToggle && (
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden mr-3"
              onClick={onMenuToggle}
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
          <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
        </div>

        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="h-5 w-5" />
            {/* Notification badge */}
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
          </Button>

          {/* User Menu */}
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-700">
                {user?.firstName} {user?.lastName}
              </p>
              <div className="flex items-center justify-end space-x-2">
                <span 
                  className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getRoleBadgeColor(user?.role || '')}`}
                >
                  {user?.role}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {/* Settings - Solo para admin */}
              {isAdmin && (
                <Button variant="ghost" size="sm">
                  <Settings className="h-5 w-5" />
                </Button>
              )}

              {/* Profile */}
              <Button variant="ghost" size="sm">
                <User className="h-5 w-5" />
              </Button>

              {/* Logout */}
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowLogoutModal(true)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Logout Confirmation Modal */}
      <Modal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        title="Confirmar Cierre de Sesión"
        size="sm"
      >
        <div className="text-center">
          <p className="text-gray-600 mb-6">
            ¿Estás seguro que deseas cerrar tu sesión?
          </p>

          <ModalFooter>
            <Button
              variant="secondary"
              onClick={() => setShowLogoutModal(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="danger"
              onClick={handleLogout}
            >
              Cerrar Sesión
            </Button>
          </ModalFooter>
        </div>
      </Modal>
    </>
  )
}
