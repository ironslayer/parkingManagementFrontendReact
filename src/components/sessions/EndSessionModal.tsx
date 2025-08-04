import React, { useState, useEffect, useCallback } from 'react'
import { X, Calculator, Clock, DollarSign, CreditCard, Banknote, Smartphone } from 'lucide-react'
import type { ParkingSession, PaymentMethod } from '../../types'
import { useParkingSessionStore } from '../../store/parkingSessionStore'
import { usePaymentStore } from '../../store/paymentStore'
import { Button, Modal, LoadingSpinner } from '../ui'
import { formatCurrency, formatDuration } from '../../utils'

// ==========================================
// TIPOS DEL COMPONENTE
// ==========================================
interface EndSessionModalProps {
  isOpen: boolean
  onClose: () => void
  session: ParkingSession | null
  onSessionEnded?: (session: ParkingSession) => void
}

interface PaymentCalculation {
  sessionId: string
  entryTime: string
  exitTime: string
  duration: number // en minutos
  hourlyRate: number
  totalAmount: number
  durationFormatted: string
  vehicle: {
    licensePlate: string
    type: string
  }
  parkingSpot?: string
}

// ==========================================
// COMPONENTE END SESSION MODAL
// ==========================================
export const EndSessionModal: React.FC<EndSessionModalProps> = ({
  isOpen,
  onClose,
  session,
  onSessionEnded
}) => {
  // ==========================================
  // ESTADO Y HOOKS
  // ==========================================
  const { endSession, isLoading, error, clearError } = useParkingSessionStore()
  const { createPayment, isProcessing } = usePaymentStore()
  
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH')
  const [paymentCalculation, setPaymentCalculation] = useState<PaymentCalculation | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)
  const [notes, setNotes] = useState('')

  // ==========================================
  // FUNCIONES AUXILIARES
  // ==========================================
  const calculatePayment = useCallback(() => {
    if (!session) return

    setIsCalculating(true)
    
    // Simular cálculo del backend
    setTimeout(() => {
      const now = new Date()
      const entryTime = new Date(session.entryTime)
      const durationMs = now.getTime() - entryTime.getTime()
      const durationMinutes = Math.floor(durationMs / (1000 * 60))
      const durationHours = durationMinutes / 60
      
      // Calcular monto redondeando hacia arriba (mínimo 1 hora)
      const billableHours = Math.max(1, Math.ceil(durationHours))
      const totalAmount = billableHours * session.rate

      const calculation: PaymentCalculation = {
        sessionId: session.id,
        entryTime: session.entryTime,
        exitTime: now.toISOString(),
        duration: durationMinutes,
        hourlyRate: session.rate,
        totalAmount,
        durationFormatted: formatDuration(durationMs),
        vehicle: {
          licensePlate: session.vehicle.licensePlate,
          type: session.vehicle.vehicleType
        },
        parkingSpot: session.parkingSpot
      }

      setPaymentCalculation(calculation)
      setIsCalculating(false)
    }, 1000) // Simular delay del servidor
  }, [session])

  // ==========================================
  // EFECTOS
  // ==========================================
  useEffect(() => {
    if (isOpen && session) {
      calculatePayment()
      clearError()
    }
  }, [isOpen, session, clearError, calculatePayment])

  useEffect(() => {
    if (!isOpen) {
      // Reset state when modal closes
      setPaymentMethod('CASH')
      setPaymentCalculation(null)
      setNotes('')
    }
  }, [isOpen])

  const handleEndSession = async () => {
    if (!session || !paymentCalculation) return

    try {
      // Primero crear el pago
      await createPayment({
        sessionId: session.id,
        amount: paymentCalculation.totalAmount,
        method: paymentMethod,
        notes: notes || undefined
      })

      // Luego finalizar la sesión
      const endedSession = await endSession({
        sessionId: session.id,
        exitTime: paymentCalculation.exitTime,
        paymentMethod,
        notes: notes || undefined
      })

      onSessionEnded?.(endedSession)
      onClose()
    } catch (error) {
      console.error('Error ending session:', error)
    }
  }

  const handleClose = () => {
    if (!isLoading && !isProcessing) {
      onClose()
    }
  }

  // ==========================================
  // OPCIONES DE MÉTODO DE PAGO
  // ==========================================
  const paymentMethods = [
    {
      id: 'CASH' as PaymentMethod,
      name: 'Efectivo',
      icon: <Banknote className="w-5 h-5" />,
      description: 'Pago en efectivo'
    },
    {
      id: 'CARD' as PaymentMethod,
      name: 'Tarjeta',
      icon: <CreditCard className="w-5 h-5" />,
      description: 'Tarjeta débito/crédito'
    },
    {
      id: 'TRANSFER' as PaymentMethod,
      name: 'Transferencia',
      icon: <Smartphone className="w-5 h-5" />,
      description: 'Transferencia bancaria'
    }
  ]

  // ==========================================
  // RENDER
  // ==========================================
  if (!session) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Finalizar Sesión de Parqueo"
      size="lg"
    >
      <div className="space-y-6">
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
                <button
                  type="button"
                  className="inline-flex bg-red-50 rounded-md p-1.5 text-red-500 hover:bg-red-100"
                  onClick={clearError}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Información del Vehículo */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-blue-900">
                {session.vehicle.licensePlate}
              </h3>
              <p className="text-sm text-blue-700">
                {session.vehicle.brand} {session.vehicle.model} • {session.vehicle.vehicleType}
              </p>
              {session.parkingSpot && (
                <p className="text-xs text-blue-600">
                  Espacio: {session.parkingSpot}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Cálculo del Pago */}
        {isCalculating ? (
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner size="lg" />
            <span className="ml-3 text-gray-600">Calculando pago...</span>
          </div>
        ) : paymentCalculation ? (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <Calculator className="w-5 h-5 text-gray-600" />
              <h3 className="font-semibold text-gray-900">Resumen de Pago</h3>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Entrada:</span>
                <span className="font-medium">
                  {new Date(paymentCalculation.entryTime).toLocaleString('es-ES')}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Salida:</span>
                <span className="font-medium">
                  {new Date(paymentCalculation.exitTime).toLocaleString('es-ES')}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600 flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  Tiempo total:
                </span>
                <span className="font-medium">
                  {paymentCalculation.durationFormatted}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Tarifa:</span>
                <span className="font-medium">
                  {formatCurrency(paymentCalculation.hourlyRate)}/hora
                </span>
              </div>
              
              <div className="border-t border-gray-300 pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-900 flex items-center gap-1">
                    <DollarSign className="w-5 h-5" />
                    Total a pagar:
                  </span>
                  <span className="text-2xl font-bold text-green-600">
                    {formatCurrency(paymentCalculation.totalAmount)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {/* Método de Pago */}
        {paymentCalculation && (
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Método de Pago</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {paymentMethods.map((method) => (
                <button
                  key={method.id}
                  onClick={() => setPaymentMethod(method.id)}
                  className={`p-4 border rounded-lg text-left transition-colors ${
                    paymentMethod === method.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      paymentMethod === method.id
                        ? 'bg-blue-100 text-blue-600'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {method.icon}
                    </div>
                    <div>
                      <div className="font-medium">{method.name}</div>
                      <div className="text-sm text-gray-500">{method.description}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Notas adicionales */}
        {paymentCalculation && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notas adicionales (opcional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Agregar observaciones sobre el pago o la sesión..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              rows={3}
            />
          </div>
        )}

        {/* Botones de acción */}
        <div className="flex justify-end gap-3 pt-4">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isLoading || isProcessing}
          >
            Cancelar
          </Button>
          {paymentCalculation && (
            <Button
              onClick={handleEndSession}
              loading={isLoading || isProcessing}
              className="min-w-[120px]"
            >
              {isProcessing ? 'Procesando Pago...' : 'Finalizar y Cobrar'}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  )
}

export default EndSessionModal
