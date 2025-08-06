import { useState } from 'react'
import type { NotificationProps } from '../components/ui/Notification'

// ==========================================
// HOOK PARA MANEJO DE NOTIFICACIONES
// ==========================================
export const useNotifications = () => {
  const [notifications, setNotifications] = useState<NotificationProps[]>([])

  const addNotification = (notification: Omit<NotificationProps, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newNotification: NotificationProps = {
      ...notification,
      id
    }

    setNotifications(prev => [...prev, newNotification])
    return id
  }

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const clearAll = () => {
    setNotifications([])
  }

  // Métodos de conveniencia
  const success = (title: string, message?: string, options?: Partial<NotificationProps>) => {
    return addNotification({ type: 'success', title, message, ...options })
  }

  const error = (title: string, message?: string, options?: Partial<NotificationProps>) => {
    return addNotification({ type: 'error', title, message, ...options })
  }

  const warning = (title: string, message?: string, options?: Partial<NotificationProps>) => {
    return addNotification({ type: 'warning', title, message, ...options })
  }

  const info = (title: string, message?: string, options?: Partial<NotificationProps>) => {
    return addNotification({ type: 'info', title, message, ...options })
  }

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAll,
    success,
    error,
    warning,
    info
  }
}
