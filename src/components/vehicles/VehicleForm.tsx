import React, { useState, useEffect } from 'react'
import { Car, Save, X } from 'lucide-react'
import type { Vehicle, CreateVehicleRequest, UpdateVehicleRequest } from '../../types'
import type { VehicleTypeAPI } from '../../services/vehicleTypeService'
import { useVehicleStore } from '../../store/vehicleStore'
import { vehicleTypeService } from '../../services/vehicleTypeService'
import { Button, Input, Modal } from '../ui'

// ==========================================
// TIPOS DEL COMPONENTE
// ==========================================
interface VehicleFormProps {
  isOpen: boolean
  onClose: () => void
  vehicle?: Vehicle
  mode: 'create' | 'edit'
  onSuccess?: (vehicle: Vehicle) => void
}

interface FormData {
  licensePlate: string
  vehicleTypeId: number
  brand: string
  model: string
  color: string
  ownerName: string
  ownerPhone: string
}

interface FormErrors {
  licensePlate?: string
  vehicleTypeId?: string
  brand?: string
  model?: string
  color?: string
  ownerName?: string
  ownerPhone?: string
}

// ==========================================
// COMPONENTE VEHICLE FORM
// ==========================================
export const VehicleForm: React.FC<VehicleFormProps> = ({
  isOpen,
  onClose,
  vehicle,
  mode,
  onSuccess
}) => {
  // ==========================================
  // ESTADO Y HOOKS
  // ==========================================
  const { createVehicle, updateVehicle, isLoading, error, clearError } = useVehicleStore()

  const [vehicleTypes, setVehicleTypes] = useState<VehicleTypeAPI[]>([])
  const [formData, setFormData] = useState<FormData>({
    licensePlate: '',
    vehicleTypeId: 1, // Por defecto AUTO
    brand: '',
    model: '',
    color: '',
    ownerName: '',
    ownerPhone: ''
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [touched, setTouched] = useState<Record<keyof FormData, boolean>>({
    licensePlate: false,
    vehicleTypeId: false,
    brand: false,
    model: false,
    color: false,
    ownerName: false,
    ownerPhone: false
  })

  // ==========================================
  // EFECTOS
  // ==========================================
  useEffect(() => {
    if (isOpen) {
      // Cargar tipos de vehículos
      vehicleTypeService.getVehicleTypes()
        .then(setVehicleTypes)
        .catch(console.error)

      if (mode === 'edit' && vehicle) {
        setFormData({
          licensePlate: vehicle.licensePlate,
          vehicleTypeId: vehicle.vehicleTypeId,
          brand: vehicle.brand || '',
          model: vehicle.model || '',
          color: vehicle.color || '',
          ownerName: vehicle.ownerName || '',
          ownerPhone: vehicle.ownerPhone || ''
        })
      } else {
        setFormData({
          licensePlate: '',
          vehicleTypeId: 1, // Por defecto AUTO
          brand: '',
          model: '',
          color: '',
          ownerName: '',
          ownerPhone: ''
        })
      }
      setErrors({})
      setTouched({
        licensePlate: false,
        vehicleTypeId: false,
        brand: false,
        model: false,
        color: false,
        ownerName: false,
        ownerPhone: false
      })
      clearError()
    }
  }, [isOpen, mode, vehicle, clearError])

  // ==========================================
  // VALIDACIÓN
  // ==========================================
  const validateField = (name: keyof FormData, value: string | number): string | undefined => {
    switch (name) {
      case 'licensePlate':
        if (typeof value === 'string') {
          if (!value.trim()) return 'La placa es requerida'
          if (value.length < 3) return 'La placa debe tener al menos 3 caracteres'
          if (!/^[A-Z0-9-]+$/i.test(value)) return 'La placa solo puede contener letras, números y guiones'
        }
        break
      
      case 'vehicleTypeId':
        if (typeof value === 'number') {
          if (!value || value <= 0) return 'El tipo de vehículo es requerido'
        }
        break
      
      case 'ownerPhone':
        if (typeof value === 'string' && value && !/^\+?[\d\s-()]+$/.test(value)) {
          return 'El teléfono no es válido'
        }
        break
    }
    return undefined
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}
    
    Object.keys(formData).forEach(key => {
      const fieldKey = key as keyof FormData
      const error = validateField(fieldKey, formData[fieldKey])
      if (error) {
        newErrors[fieldKey] = error
      }
    })
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // ==========================================
  // MANEJADORES DE EVENTOS
  // ==========================================
  const handleInputChange = (name: keyof FormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Validar en tiempo real si el campo ya fue tocado
    if (touched[name]) {
      const error = validateField(name, value)
      setErrors(prev => ({ ...prev, [name]: error }))
    }
  }

  const handleInputBlur = (name: keyof FormData) => {
    setTouched(prev => ({ ...prev, [name]: true }))
    const error = validateField(name, formData[name])
    setErrors(prev => ({ ...prev, [name]: error }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    try {
      if (mode === 'create') {
        const request: CreateVehicleRequest = {
          licensePlate: formData.licensePlate.toUpperCase(),
          vehicleTypeId: formData.vehicleTypeId,
          brand: formData.brand || undefined,
          model: formData.model || undefined,
          color: formData.color || undefined,
          ownerName: formData.ownerName || undefined,
          ownerPhone: formData.ownerPhone || undefined,
        }
        console.log('📤 Datos a enviar (CREATE):', request)
        await createVehicle(request)
      } else if (vehicle) {
        const request: UpdateVehicleRequest = {
          id: vehicle.id,
          // NOTA: licensePlate NO se puede cambiar en actualizaciones (inmutable)
          vehicleTypeId: formData.vehicleTypeId,
          brand: formData.brand || undefined,
          model: formData.model || undefined,
          color: formData.color || undefined,
          ownerName: formData.ownerName || undefined,
          ownerPhone: formData.ownerPhone || undefined,
        }
        console.log('📤 Datos a enviar (UPDATE):', request)
        await updateVehicle(request)
      }
      
      onSuccess?.(vehicle!)
      onClose()
    } catch (error) {
      console.error('Error al guardar vehículo:', error)
    }
  }

  const handleClose = () => {
    setFormData({
      licensePlate: '',
      vehicleTypeId: 1,
      brand: '',
      model: '',
      color: '',
      ownerName: '',
      ownerPhone: ''
    })
    setErrors({})
    setTouched({
      licensePlate: false,
      vehicleTypeId: false,
      brand: false,
      model: false,
      color: false,
      ownerName: false,
      ownerPhone: false
    })
    clearError()
    onClose()
  }

  // ==========================================
  // RENDER
  // ==========================================
  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={mode === 'create' ? 'Agregar Vehículo' : 'Editar Vehículo'}
      size="lg"
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
            </div>
          </div>
        )}

        {/* Información del Vehículo */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
            <Car className="w-5 h-5 text-blue-600" />
            Información del Vehículo
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Placa */}
            <div className="md:col-span-1">
              <Input
                label="Placa *"
                placeholder="ABC-123"
                value={formData.licensePlate}
                onChange={(e) => handleInputChange('licensePlate', e.target.value.toUpperCase())}
                onBlur={() => handleInputBlur('licensePlate')}
                error={errors.licensePlate}
                disabled={isLoading || mode === 'edit'} // Deshabilitar en modo edición
                className="font-mono"
              />
              {mode === 'edit' && (
                <p className="text-xs text-gray-500 mt-1">
                  La placa no se puede modificar
                </p>
              )}
            </div>

            {/* Tipo de Vehículo */}
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Vehículo *
              </label>
              <select
                value={formData.vehicleTypeId}
                onChange={(e) => handleInputChange('vehicleTypeId', Number(e.target.value))}
                onBlur={() => handleInputBlur('vehicleTypeId')}
                disabled={isLoading}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                {vehicleTypes.map(type => (
                  <option key={type.id} value={type.id}>
                    {type.name} - {type.description}
                  </option>
                ))}
              </select>
              {errors.vehicleTypeId && (
                <p className="mt-1 text-sm text-red-600">{errors.vehicleTypeId}</p>
              )}
            </div>

            {/* Marca */}
            <div className="md:col-span-1">
              <Input
                label="Marca"
                placeholder="Toyota"
                value={formData.brand}
                onChange={(e) => handleInputChange('brand', e.target.value)}
                onBlur={() => handleInputBlur('brand')}
                error={errors.brand}
                disabled={isLoading}
              />
            </div>

            {/* Modelo */}
            <div className="md:col-span-1">
              <Input
                label="Modelo"
                placeholder="Corolla"
                value={formData.model}
                onChange={(e) => handleInputChange('model', e.target.value)}
                onBlur={() => handleInputBlur('model')}
                error={errors.model}
                disabled={isLoading}
              />
            </div>

            {/* Color */}
            <div className="md:col-span-1">
              <Input
                label="Color"
                placeholder="Blanco"
                value={formData.color}
                onChange={(e) => handleInputChange('color', e.target.value)}
                onBlur={() => handleInputBlur('color')}
                error={errors.color}
                disabled={isLoading}
              />
            </div>
          </div>
        </div>

        {/* Información del Propietario */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Información del Propietario
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nombre del Propietario */}
            <div className="md:col-span-2">
              <Input
                label="Nombre del Propietario"
                placeholder="Juan Pérez"
                value={formData.ownerName}
                onChange={(e) => handleInputChange('ownerName', e.target.value)}
                onBlur={() => handleInputBlur('ownerName')}
                error={errors.ownerName}
                disabled={isLoading}
              />
            </div>

            {/* Teléfono */}
            <div className="md:col-span-2">
              <Input
                label="Teléfono"
                placeholder="+57 300 123 4567"
                value={formData.ownerPhone}
                onChange={(e) => handleInputChange('ownerPhone', e.target.value)}
                onBlur={() => handleInputBlur('ownerPhone')}
                error={errors.ownerPhone}
                disabled={isLoading}
              />
            </div>
          </div>
        </div>

        {/* Botones */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
            leftIcon={<X className="w-4 h-4" />}
          >
            Cancelar
          </Button>
          
          <Button
            type="submit"
            disabled={isLoading}
            loading={isLoading}
            leftIcon={<Save className="w-4 h-4" />}
          >
            {mode === 'create' ? 'Crear Vehículo' : 'Guardar Cambios'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default VehicleForm
