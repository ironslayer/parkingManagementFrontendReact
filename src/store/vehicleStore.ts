import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Vehicle, CreateVehicleRequest, UpdateVehicleRequest } from '../types'
import { getErrorMessage } from '../utils'
import { vehicleService } from '../services/vehicleService'

interface VehicleState {
  // Estado
  vehicles: Vehicle[]
  currentVehicle: Vehicle | null
  isLoading: boolean
  error: string | null

  // Acciones
  fetchVehicles: () => Promise<void>
  createVehicle: (vehicleData: CreateVehicleRequest) => Promise<void>
  updateVehicle: (vehicleData: UpdateVehicleRequest) => Promise<void>
  changeVehicleStatus: (id: string, isActive: boolean) => Promise<void>
  deleteVehicle: (id: string) => Promise<void> // @deprecated - usar changeVehicleStatus
  getVehicleByPlate: (licensePlate: string) => Promise<Vehicle | null>
  setCurrentVehicle: (vehicle: Vehicle | null) => void
  clearError: () => void
  setLoading: (loading: boolean) => void
}

// ==========================================
// REPOSITORIO DE VEHÍCULOS - INTEGRACIÓN BACKEND
// ==========================================
class VehicleRepository {
  /**
   * Obtener todos los vehículos del usuario autenticado
   */
  static async fetchAll(): Promise<Vehicle[]> {
    return await vehicleService.getVehicles();
  }

  /**
   * Crear nuevo vehículo
   */
  static async create(vehicleData: CreateVehicleRequest): Promise<Vehicle> {
    return await vehicleService.createVehicle(vehicleData);
  }

  /**
   * Actualizar vehículo existente
   */
  static async update(vehicleData: UpdateVehicleRequest): Promise<Vehicle> {
    return await vehicleService.updateVehicle(vehicleData);
  }

  /**
   * Cambiar estado del vehículo (activar/desactivar)
   */
  static async changeStatus(id: string, isActive: boolean): Promise<void> {
    return await vehicleService.changeVehicleStatus(id, isActive);
  }

  /**
   * @deprecated Usar changeStatus() en su lugar
   * Eliminar vehículo 
   */
  static async delete(id: string): Promise<void> {
    return await vehicleService.deleteVehicle(id);
  }

  /**
   * Buscar vehículo por placa
   */
  static async findByPlate(licensePlate: string): Promise<Vehicle | null> {
    return await vehicleService.getVehicleByPlate(licensePlate);
  }
}

// Store usando el patrón Repository
export const useVehicleStore = create<VehicleState>()(
  persist(
    (set, get) => ({
      // Estado inicial
      vehicles: [],
      currentVehicle: null,
      isLoading: false,
      error: null,

      // Acciones usando Clean Architecture
      fetchVehicles: async () => {
        set({ isLoading: true, error: null })
        
        try {
          const vehicles = await VehicleRepository.fetchAll()
          set({ vehicles, isLoading: false })
        } catch (error) {
          set({ 
            isLoading: false, 
            error: getErrorMessage(error) 
          })
        }
      },

      createVehicle: async (vehicleData: CreateVehicleRequest) => {
        set({ isLoading: true, error: null })
        
        try {
          const newVehicle = await VehicleRepository.create(vehicleData)
          const currentVehicles = get().vehicles
          
          set({ 
            vehicles: [...currentVehicles, newVehicle],
            isLoading: false 
          })
        } catch (error) {
          set({ 
            isLoading: false, 
            error: getErrorMessage(error) 
          })
          throw error // Re-throw para manejo en componentes
        }
      },

      updateVehicle: async (vehicleData: UpdateVehicleRequest) => {
        set({ isLoading: true, error: null })
        
        try {
          const updatedVehicle = await VehicleRepository.update(vehicleData)
          const currentVehicles = get().vehicles
          
          const updatedVehicles = currentVehicles.map(v => 
            v.id === vehicleData.id ? updatedVehicle : v
          )
          
          set({ 
            vehicles: updatedVehicles,
            currentVehicle: updatedVehicle,
            isLoading: false 
          })
        } catch (error) {
          set({ 
            isLoading: false, 
            error: getErrorMessage(error) 
          })
          throw error
        }
      },

      changeVehicleStatus: async (id: string, isActive: boolean) => {
        set({ isLoading: true, error: null })
        
        try {
          await VehicleRepository.changeStatus(id, isActive)
          const currentVehicles = get().vehicles
          const updatedVehicles = currentVehicles.map(v => 
            v.id === id ? { ...v, isActive } : v
          )
          
          set({ 
            vehicles: updatedVehicles,
            currentVehicle: get().currentVehicle?.id === id 
              ? { ...get().currentVehicle!, isActive } 
              : get().currentVehicle,
            isLoading: false 
          })
        } catch (error) {
          set({ 
            isLoading: false, 
            error: getErrorMessage(error) 
          })
          throw error
        }
      },

      deleteVehicle: async (id: string) => {
        set({ isLoading: true, error: null })
        
        try {
          await VehicleRepository.delete(id)
          const currentVehicles = get().vehicles
          
          set({ 
            vehicles: currentVehicles.filter(v => v.id !== id),
            currentVehicle: get().currentVehicle?.id === id ? null : get().currentVehicle,
            isLoading: false 
          })
        } catch (error) {
          set({ 
            isLoading: false, 
            error: getErrorMessage(error) 
          })
          throw error
        }
      },

      getVehicleByPlate: async (licensePlate: string) => {
        try {
          return await VehicleRepository.findByPlate(licensePlate)
        } catch (error) {
          set({ error: getErrorMessage(error) })
          return null
        }
      },

      setCurrentVehicle: (vehicle: Vehicle | null) => {
        set({ currentVehicle: vehicle })
      },

      clearError: () => set({ error: null }),
      
      setLoading: (loading: boolean) => set({ isLoading: loading })
    }),
    {
      name: 'vehicle-storage',
      partialize: (state) => ({
        vehicles: state.vehicles
      })
    }
  )
)
