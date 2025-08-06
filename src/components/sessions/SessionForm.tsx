import React, { useState, useEffect } from 'react'
import { X, Car, MapPin, DollarSign, Clock } from 'lucide-react'
import type { Vehicle } from '../../types'
import { useVehicleStore } from '../../store/vehicleStore'
import { useParkingSessionStore } from '../../store/parkingSessionStore'
import { Button, Modal, Input, VehicleTypeBadge } from '../ui'
import { formatCurrency } from '../../utils'

// ==========================================
// TIPOS DEL COMPONENTE
// ==========================================
interface SessionFormProps {
  isOpen: boolean
  onClose: () => void
  onSessionCreated?: () => void
  preselectedVehicle?: Vehicle | null
}

// Tarifas por hora según tipo de vehículo
const HOURLY_RATES = {
  AUTO: 3000,
  MOTOCICLETA: 2000,
  // Compatibilidad con nombres anteriores
  CAR: 3000,
  MOTORCYCLE: 2000,
  TRUCK: 5000
} as const

// ==========================================
// COMPONENTE SESSION FORM
// ==========================================
export const SessionForm: React.FC<SessionFormProps> = ({
  isOpen,
  onClose,
  onSessionCreated,
  preselectedVehicle = null
}) => {
  // ==========================================
  // ESTADO Y HOOKS
  // ==========================================
  const { vehicles, fetchVehicles } = useVehicleStore()
  const { startSession, isLoading, error, clearError } = useParkingSessionStore()

  const [selectedVehicleId, setSelectedVehicleId] = useState('')
  const [parkingSpot, setParkingSpot] = useState('')
  const [customRate, setCustomRate] = useState('')
  const [useCustomRate, setUseCustomRate] = useState(false)

  // ==========================================
  // EFECTOS
  // ==========================================
  useEffect(() => {
    if (isOpen) {
      fetchVehicles()
      clearError()
      
      // Si hay un vehículo preseleccionado, establecerlo
      if (preselectedVehicle) {
        setSelectedVehicleId(preselectedVehicle.id)
      }
    }
  }, [isOpen, fetchVehicles, clearError, preselectedVehicle])

  useEffect(() => {
    if (!isOpen) {
      // Limpiar form cuando se cierra
      setSelectedVehicleId('')
      setParkingSpot('')
      setCustomRate('')
      setUseCustomRate(false)
    }
  }, [isOpen])

  // ==========================================
  // DATOS CALCULADOS
  // ==========================================
  const selectedVehicle = vehicles.find(v => v.id === selectedVehicleId)
  const defaultRate = selectedVehicle ? HOURLY_RATES[selectedVehicle.vehicleType] : 0
  const finalRate = useCustomRate && customRate ? Number(customRate) : defaultRate

  // Generar opciones de espacios de parqueo
  const parkingSpots = Array.from({ length: 50 }, (_, i) => ({
    value: `A${String(i + 1).padStart(2, '0')}`,
    label: `Espacio A${String(i + 1).padStart(2, '0')}`
  }))

  // ==========================================
  // MANEJADORES DE EVENTOS
  // ==========================================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedVehicleId) {
      return
    }

    try {
      await startSession({
        licensePlate: selectedVehicle?.licensePlate || '',
        parkingSpot: parkingSpot || undefined,
        notes: useCustomRate && customRate ? `Tarifa personalizada: ${formatCurrency(Number(customRate))}/hora` : undefined
      })
      
      onSessionCreated?.()
      onClose()
    } catch (error) {
      // El error ya está manejado en el store
      console.error('Error al crear sesión:', error)
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      onClose()
    }
  }

  // ==========================================
  // RENDER
  // ==========================================
  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Iniciar Sesión de Parqueo"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
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

        {/* Selección de Vehículo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Car className="inline w-4 h-4 mr-1" />
            Vehículo *
          </label>
          <select
            value={selectedVehicleId}
            onChange={(e) => setSelectedVehicleId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            required
            disabled={!!preselectedVehicle}
          >
            <option value="">Selecciona un vehículo</option>
            {vehicles.map((vehicle) => (
              <option key={vehicle.id} value={vehicle.id}>
                {vehicle.licensePlate} - {vehicle.brand} {vehicle.model} ({vehicle.vehicleType})
              </option>
            ))}
          </select>
          
          {selectedVehicle && (
            <div className="mt-2 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-semibold text-blue-600">
                      {selectedVehicle.licensePlate}
                    </span>
                    <VehicleTypeBadge type={selectedVehicle.vehicleType} />
                  </div>
                  <p className="text-sm text-gray-600">
                    {selectedVehicle.brand} {selectedVehicle.model}
                  </p>
                  {selectedVehicle.ownerName && (
                    <p className="text-xs text-gray-500">
                      Propietario: {selectedVehicle.ownerName}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Espacio de Parqueo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <MapPin className="inline w-4 h-4 mr-1" />
            Espacio de Parqueo (opcional)
          </label>
          <select
            value={parkingSpot}
            onChange={(e) => setParkingSpot(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Selecciona un espacio</option>
            {parkingSpots.map((spot) => (
              <option key={spot.value} value={spot.value}>
                {spot.label}
              </option>
            ))}
          </select>
        </div>

        {/* Configuración de Tarifa */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <DollarSign className="inline w-4 h-4 mr-1" />
            Tarifa por Hora
          </label>
          
          <div className="space-y-3">
            {/* Tarifa por defecto */}
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div>
                <span className="text-sm font-medium text-blue-900">
                  Tarifa estándar
                </span>
                <p className="text-xs text-blue-700">
                  Según tipo de vehículo
                </p>
              </div>
              <span className="text-lg font-bold text-blue-900">
                {formatCurrency(defaultRate)}/hora
              </span>
            </div>

            {/* Toggle para tarifa personalizada */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="customRate"
                checked={useCustomRate}
                onChange={(e) => setUseCustomRate(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="customRate" className="ml-2 text-sm text-gray-700">
                Usar tarifa personalizada
              </label>
            </div>

            {/* Input para tarifa personalizada */}
            {useCustomRate && (
              <div>
                <Input
                  type="number"
                  value={customRate}
                  onChange={(e) => setCustomRate(e.target.value)}
                  placeholder="Ingresa la tarifa personalizada"
                  min="0"
                  step="100"
                  leftIcon={<DollarSign className="w-4 h-4" />}
                />
              </div>
            )}

            {/* Resumen de tarifa final */}
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-900">
                  Tarifa final
                </span>
              </div>
              <span className="text-lg font-bold text-green-900">
                {formatCurrency(finalRate)}/hora
              </span>
            </div>
          </div>
        </div>

        {/* Información adicional */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Información importante
              </h3>
              <div className="mt-1 text-sm text-yellow-700">
                <ul className="list-disc pl-5 space-y-1">
                  <li>La sesión comenzará inmediatamente al confirmar</li>
                  <li>El tiempo se calculará desde el momento de inicio</li>
                  <li>Puedes finalizar la sesión desde el listado de sesiones activas</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            loading={isLoading}
            disabled={!selectedVehicleId}
          >
            Iniciar Sesión
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default SessionForm
