import React, { useEffect, useState } from 'react'
import { Play, Square, X, Clock, Car, Eye } from 'lucide-react'
import type { ParkingSession } from '../../types'
import { useParkingSessionStore } from '../../store/parkingSessionStore'
import { Button, SessionStatusBadge, VehicleTypeBadge, LoadingSpinner, Modal } from '../ui'
import { formatCurrency, formatDuration } from '../../utils'
import EndSessionModal from './EndSessionModal'

// ==========================================
// TIPOS DEL COMPONENTE
// ==========================================
interface SessionListProps {
  onStartSession?: () => void
  onEndSession?: (session: ParkingSession) => void
  onViewSession?: (session: ParkingSession) => void
  showOnlyActive?: boolean
  compact?: boolean
  showActions?: boolean
}

// ==========================================
// COMPONENTE SESSION LIST
// ==========================================
export const SessionList: React.FC<SessionListProps> = ({
  onStartSession,
  onEndSession,
  onViewSession,
  showOnlyActive = false,
  compact = false,
  showActions = true
}) => {
  // ==========================================
  // ESTADO Y HOOKS
  // ==========================================
  const {
    sessions,
    activeSessions,
    isLoading,
    error,
    fetchSessions,
    getActiveSessions,
    cancelSession,
    calculateSessionCost,
    clearError
  } = useParkingSessionStore()

  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [sessionToCancel, setSessionToCancel] = useState<ParkingSession | null>(null)
  const [showEndModal, setShowEndModal] = useState(false)
  const [sessionToEnd, setSessionToEnd] = useState<ParkingSession | null>(null)
  const [cancelReason, setCancelReason] = useState('')

  // Timer para actualizar tiempo transcurrido
  const [currentTime, setCurrentTime] = useState(new Date())

  // ==========================================
  // EFECTOS
  // ==========================================
  useEffect(() => {
    if (showOnlyActive) {
      getActiveSessions()
    } else {
      fetchSessions()
    }
  }, [showOnlyActive, fetchSessions, getActiveSessions])

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        clearError()
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [error, clearError])

  // Timer para actualizar tiempo cada minuto
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000) // Actualizar cada minuto

    return () => clearInterval(timer)
  }, [])

  // ==========================================
  // DATOS Y PAGINACIÓN
  // ==========================================
  const dataSource = showOnlyActive ? activeSessions : sessions
  
  const totalItems = dataSource.length
  const totalPages = Math.ceil(totalItems / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedSessions = dataSource.slice(startIndex, endIndex)

  // ==========================================
  // FUNCIONES AUXILIARES
  // ==========================================
  const calculateElapsedTime = (session: ParkingSession): string => {
    const entryTime = new Date(session.entryTime)
    const endTime = session.exitTime ? new Date(session.exitTime) : currentTime
    const durationMs = endTime.getTime() - entryTime.getTime()
    return formatDuration(durationMs)
  }

  const getCurrentCost = (session: ParkingSession): number => {
    if (session.totalAmount) return session.totalAmount
    return calculateSessionCost(session.id)
  }

  // ==========================================
  // MANEJADORES DE EVENTOS
  // ==========================================
  const handleCancelSession = async (session: ParkingSession) => {
    setSessionToCancel(session)
    setShowCancelModal(true)
  }

  const confirmCancelSession = async () => {
    if (sessionToCancel) {
      try {
        await cancelSession(sessionToCancel.id, cancelReason)
        setShowCancelModal(false)
        setSessionToCancel(null)
        setCancelReason('')
      } catch (error) {
        console.error('Error al cancelar sesión:', error)
      }
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  // ==========================================
  // RENDER
  // ==========================================
  if (isLoading && dataSource.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
        <span className="ml-3 text-gray-600">Cargando sesiones...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      {!compact && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Car className="w-6 h-6 text-blue-600" />
              {showOnlyActive ? 'Sesiones Activas' : 'Historial de Sesiones'}
            </h2>
            <p className="text-gray-600">
              {showOnlyActive 
                ? 'Vehículos actualmente en el parqueadero'
                : 'Historial completo de sesiones de parqueo'
              }
            </p>
          </div>
          
          {onStartSession && (
            <Button
              onClick={onStartSession}
              leftIcon={<Play className="w-4 h-4" />}
              className="whitespace-nowrap"
            >
              Iniciar Sesión
            </Button>
          )}
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-1 text-sm text-red-700">{error}</div>
            </div>
            <div className="ml-auto pl-3">
              <div className="-mx-1.5 -my-1.5">
                <button
                  type="button"
                  className="inline-flex bg-red-50 rounded-md p-1.5 text-red-500 hover:bg-red-100"
                  onClick={clearError}
                >
                  <span className="sr-only">Cerrar</span>
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sessions List */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {paginatedSessions.length === 0 ? (
          <div className="text-center py-12">
            <Car className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {showOnlyActive ? 'No hay sesiones activas' : 'No hay sesiones'}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {showOnlyActive 
                ? 'No hay vehículos actualmente en el parqueadero.'
                : 'Comienza iniciando una nueva sesión de parqueo.'
              }
            </p>
            {onStartSession && (
              <div className="mt-6">
                <Button
                  onClick={onStartSession}
                  leftIcon={<Play className="w-4 h-4" />}
                >
                  Iniciar Primera Sesión
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vehículo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Entrada
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tiempo
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Costo
                  </th>
                  {showActions && (
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedSessions.map((session) => (
                  <tr 
                    key={session.id} 
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => onViewSession?.(session)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-mono font-semibold text-blue-600">
                          {session.vehicle?.licensePlate || 'N/A'}
                        </span>
                        <div className="flex items-center gap-2 mt-1">
                          <VehicleTypeBadge type={session.vehicle?.vehicleType || 'AUTO'} />
                          <span className="text-xs text-gray-500">
                            {session.vehicle?.brand || 'N/A'} {session.vehicle?.model || 'N/A'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <SessionStatusBadge status={session.status || 'ACTIVE'} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-sm">
                          {new Date(session.entryTime).toLocaleDateString('es-ES')}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(session.entryTime).toLocaleTimeString('es-ES')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4 text-blue-500" />
                        <span className="text-sm font-medium">
                          {calculateElapsedTime(session)}
                        </span>
                        {session.status === 'ACTIVE' && (
                          <span className="text-xs text-green-600 ml-1">⏰</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex flex-col items-end">
                        <span className="font-semibold text-lg">
                          {formatCurrency(getCurrentCost(session))}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatCurrency(session.rate || 0)}/hora
                        </span>
                      </div>
                    </td>
                    {showActions && (
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-2">
                          {onViewSession && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                onViewSession(session)
                              }}
                              leftIcon={<Eye className="w-3 h-3" />}
                              className="h-8 px-2"
                              title="Ver detalles"
                            >
                              Ver
                            </Button>
                          )}
                          
                          {session.status === 'ACTIVE' && (
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                setSessionToEnd(session)
                                setShowEndModal(true)
                              }}
                              leftIcon={<Square className="w-3 h-3" />}
                              className="h-8 px-2"
                              title="Finalizar sesión"
                            >
                              Finalizar
                            </Button>
                          )}
                          
                          {session.status === 'ACTIVE' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleCancelSession(session)
                              }}
                              leftIcon={<X className="w-3 h-3" />}
                              className="h-8 px-2 text-red-600 hover:text-red-700 hover:border-red-300"
                              title="Cancelar sesión"
                            >
                              Cancelar
                            </Button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <p className="text-sm text-gray-700">
              Mostrando{' '}
              <span className="font-medium">{startIndex + 1}</span>
              {' '}al{' '}
              <span className="font-medium">
                {Math.min(endIndex, totalItems)}
              </span>
              {' '}de{' '}
              <span className="font-medium">{totalItems}</span>
              {' '}resultados
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => handlePageChange(currentPage - 1)}
            >
              Anterior
            </Button>
            
            <span className="text-sm text-gray-700">
              Página {currentPage} de {totalPages}
            </span>
            
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}

      {/* Cancel Session Modal */}
      <Modal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="Cancelar Sesión"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            ¿Estás seguro de que deseas cancelar la sesión del vehículo{' '}
            <span className="font-mono font-semibold text-blue-600">
              {sessionToCancel?.vehicle?.licensePlate || 'N/A'}
            </span>
            ?
          </p>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Motivo de cancelación (opcional)
            </label>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Especifica el motivo de la cancelación..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              rows={3}
            />
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowCancelModal(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="danger"
              onClick={confirmCancelSession}
              loading={isLoading}
            >
              Confirmar Cancelación
            </Button>
          </div>
        </div>
      </Modal>

      {/* End Session Modal */}
      <EndSessionModal
        isOpen={showEndModal}
        onClose={() => {
          setShowEndModal(false)
          setSessionToEnd(null)
        }}
        session={sessionToEnd}
        onSessionEnded={(endedSession) => {
          onEndSession?.(endedSession)
          fetchSessions()
        }}
      />
    </div>
  )
}

export default SessionList
