import { apiClient } from './api'

// ============================================================================
// TYPES
// ============================================================================

export interface VehicleTypeAPI {
  id: number
  name: string
  description: string
  createdAt: string
}

// ============================================================================
// VEHICLE TYPE SERVICE
// ============================================================================

class VehicleTypeService {
  /**
   * Obtener todos los tipos de vehículos disponibles
   */
  async getVehicleTypes(): Promise<VehicleTypeAPI[]> {
    try {
      console.log('🚗 Obteniendo tipos de vehículos...')
      
      const response = await apiClient.get('/vehicle-types')
      console.log('✅ Tipos de vehículos obtenidos:', response.data)
      
      return response.data
    } catch (error) {
      console.error('❌ Error al obtener tipos de vehículos:', error)
      throw error
    }
  }

  /**
   * Obtener un tipo de vehículo específico por ID
   */
  async getVehicleTypeById(id: number): Promise<VehicleTypeAPI> {
    try {
      console.log('🚗 Obteniendo tipo de vehículo por ID:', id)
      
      const response = await apiClient.get(`/vehicle-types/${id}`)
      console.log('✅ Tipo de vehículo obtenido:', response.data)
      
      return response.data
    } catch (error) {
      console.error('❌ Error al obtener tipo de vehículo:', error)
      throw error
    }
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

export const vehicleTypeService = new VehicleTypeService()
export default vehicleTypeService
