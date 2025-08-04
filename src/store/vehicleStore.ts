import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Vehicle, CreateVehicleRequest, UpdateVehicleRequest } from '../types'
import { getErrorMessage } from '../utils'

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
  deleteVehicle: (id: string) => Promise<void>
  getVehicleByPlate: (licensePlate: string) => Promise<Vehicle | null>
  setCurrentVehicle: (vehicle: Vehicle | null) => void
  clearError: () => void
  setLoading: (loading: boolean) => void
}

// Simulación de API - Repository Pattern
class VehicleRepository {
  private static readonly STORAGE_KEY = 'vehicles_storage'
  
  // Simulamos base de datos local para demo
  private static getStoredVehicles(): Vehicle[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      return stored ? JSON.parse(stored) : this.getDefaultVehicles()
    } catch (error) {
      console.error('Error reading vehicles from storage:', error)
      return this.getDefaultVehicles()
    }
  }

  private static saveVehicles(vehicles: Vehicle[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(vehicles))
    } catch (error) {
      console.error('Error saving vehicles to storage:', error)
    }
  }

  private static getDefaultVehicles(): Vehicle[] {
    return [
      {
        id: '1',
        licensePlate: 'ABC-123',
        vehicleType: 'CAR',
        brand: 'Toyota',
        model: 'Corolla',
        color: 'Blanco',
        ownerName: 'Juan Pérez',
        ownerPhone: '+57 300 123 4567',
        ownerEmail: 'juan.perez@email.com',
        isActive: true,
        createdAt: new Date('2024-01-15').toISOString(),
        updatedAt: new Date('2024-01-15').toISOString()
      },
      {
        id: '2',
        licensePlate: 'XYZ-789',
        vehicleType: 'MOTORCYCLE',
        brand: 'Honda',
        model: 'CB600F',
        color: 'Negro',
        ownerName: 'Ana García',
        ownerPhone: '+57 310 987 6543',
        ownerEmail: 'ana.garcia@email.com',
        isActive: true,
        createdAt: new Date('2024-01-20').toISOString(),
        updatedAt: new Date('2024-01-20').toISOString()
      },
      {
        id: '3',
        licensePlate: 'DEF-456',
        vehicleType: 'TRUCK',
        brand: 'Ford',
        model: 'F-150',
        color: 'Azul',
        ownerName: 'Carlos López',
        ownerPhone: '+57 320 555 7890',
        ownerEmail: 'carlos.lopez@email.com',
        isActive: true,
        createdAt: new Date('2024-02-01').toISOString(),
        updatedAt: new Date('2024-02-01').toISOString()
      }
    ]
  }

  static async fetchAll(): Promise<Vehicle[]> {
    // Simulamos latencia de red
    await new Promise(resolve => setTimeout(resolve, 800))
    return this.getStoredVehicles()
  }

  static async create(vehicleData: CreateVehicleRequest): Promise<Vehicle> {
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const vehicles = this.getStoredVehicles()
    
    // Validar placa única
    if (vehicles.some(v => v.licensePlate.toLowerCase() === vehicleData.licensePlate.toLowerCase())) {
      throw new Error('Ya existe un vehículo con esta placa')
    }

    const newVehicle: Vehicle = {
      id: Date.now().toString(),
      ...vehicleData,
      licensePlate: vehicleData.licensePlate.toUpperCase(),
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    vehicles.push(newVehicle)
    this.saveVehicles(vehicles)
    
    return newVehicle
  }

  static async update(vehicleData: UpdateVehicleRequest): Promise<Vehicle> {
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const vehicles = this.getStoredVehicles()
    const index = vehicles.findIndex(v => v.id === vehicleData.id)
    
    if (index === -1) {
      throw new Error('Vehículo no encontrado')
    }

    // Validar placa única (excluyendo el vehículo actual)
    if (vehicleData.licensePlate) {
      const plateExists = vehicles.some(v => 
        v.id !== vehicleData.id && 
        v.licensePlate.toLowerCase() === vehicleData.licensePlate!.toLowerCase()
      )
      if (plateExists) {
        throw new Error('Ya existe un vehículo con esta placa')
      }
    }

    const updatedVehicle: Vehicle = {
      ...vehicles[index],
      ...vehicleData,
      licensePlate: vehicleData.licensePlate?.toUpperCase() || vehicles[index].licensePlate,
      updatedAt: new Date().toISOString()
    }

    vehicles[index] = updatedVehicle
    this.saveVehicles(vehicles)
    
    return updatedVehicle
  }

  static async delete(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 800))
    
    const vehicles = this.getStoredVehicles()
    const filteredVehicles = vehicles.filter(v => v.id !== id)
    
    if (filteredVehicles.length === vehicles.length) {
      throw new Error('Vehículo no encontrado')
    }

    this.saveVehicles(filteredVehicles)
  }

  static async findByPlate(licensePlate: string): Promise<Vehicle | null> {
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const vehicles = this.getStoredVehicles()
    return vehicles.find(v => 
      v.licensePlate.toLowerCase() === licensePlate.toLowerCase() && v.isActive
    ) || null
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
