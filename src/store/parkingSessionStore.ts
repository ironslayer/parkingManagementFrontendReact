import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ParkingSession, StartSessionRequest, EndSessionRequest, Vehicle, SessionStatus } from '../types'
import { getErrorMessage } from '../utils'

interface ParkingSessionState {
  // Estado
  sessions: ParkingSession[]
  activeSessions: ParkingSession[]
  currentSession: ParkingSession | null
  isLoading: boolean
  error: string | null

  // Acciones
  fetchSessions: () => Promise<void>
  startSession: (sessionData: StartSessionRequest) => Promise<ParkingSession>
  endSession: (sessionData: EndSessionRequest) => Promise<ParkingSession>
  cancelSession: (sessionId: string, reason?: string) => Promise<void>
  getSessionById: (id: string) => Promise<ParkingSession | null>
  getActiveSessionByVehicle: (licensePlate: string) => Promise<ParkingSession | null>
  getActiveSessions: () => Promise<void>
  calculateSessionCost: (sessionId: string) => number
  setCurrentSession: (session: ParkingSession | null) => void
  clearError: () => void
  setLoading: (loading: boolean) => void
}

// Configuración de tarifas por tipo de vehículo (por hora)
const PARKING_RATES = {
  CAR: 2000,        // $2000 COP por hora
  MOTORCYCLE: 1000, // $1000 COP por hora  
  TRUCK: 3000       // $3000 COP por hora
} as const

// Simulación de API - Repository Pattern
class ParkingSessionRepository {
  private static readonly STORAGE_KEY = 'parking_sessions_storage'
  
  // Simulamos base de datos local para demo
  private static getStoredSessions(): ParkingSession[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      return stored ? JSON.parse(stored) : this.getDefaultSessions()
    } catch (error) {
      console.error('Error reading sessions from storage:', error)
      return this.getDefaultSessions()
    }
  }

  private static saveSessions(sessions: ParkingSession[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(sessions))
    } catch (error) {
      console.error('Error saving sessions to storage:', error)
    }
  }

  private static getDefaultSessions(): ParkingSession[] {
    return [
      {
        id: '1',
        vehicle: {
          id: '1',
          licensePlate: 'ABC-123',
          vehicleType: 'CAR',
          brand: 'Toyota',
          model: 'Corolla',
          color: 'Blanco',
          ownerName: 'Juan Pérez',
          ownerPhone: '+57 300 123 4567',
          ownerEmail: 'juan@ejemplo.com',
          isActive: true,
          createdAt: '2025-08-01T08:00:00Z',
          updatedAt: '2025-08-01T08:00:00Z'
        },
        entryTime: '2025-08-03T10:00:00Z',
        exitTime: '2025-08-03T14:30:00Z',
        status: 'COMPLETED',
        parkingSpot: 'A-01',
        rate: PARKING_RATES.CAR,
        totalAmount: 9000, // 4.5 horas * 2000
        payment: {
          id: '1',
          amount: 9000,
          paymentMethod: 'CASH',
          status: 'COMPLETED',
          transactionId: 'TXN-001',
          parkingSession: {} as ParkingSession,
          processedBy: {
            id: '1',
            email: 'operator@parking.com',
            firstName: 'María',
            lastName: 'García',
            role: 'OPERATOR',
            isActive: true,
            createdAt: '2025-08-01T08:00:00Z',
            updatedAt: '2025-08-01T08:00:00Z'
          },
          processedAt: '2025-08-03T14:30:00Z',
          createdAt: '2025-08-03T14:30:00Z',
          updatedAt: '2025-08-03T14:30:00Z'
        },
        operator: {
          id: '1',
          email: 'operator@parking.com',
          firstName: 'María',
          lastName: 'García',
          role: 'OPERATOR',
          isActive: true,
          createdAt: '2025-08-01T08:00:00Z',
          updatedAt: '2025-08-01T08:00:00Z'
        },
        notes: 'Sesión completada exitosamente',
        createdAt: '2025-08-03T10:00:00Z',
        updatedAt: '2025-08-03T14:30:00Z'
      },
      {
        id: '2',
        vehicle: {
          id: '2',
          licensePlate: 'DEF-456',
          vehicleType: 'MOTORCYCLE',
          brand: 'Honda',
          model: 'CBR',
          color: 'Rojo',
          ownerName: 'Ana López',
          ownerPhone: '+57 301 987 6543',
          ownerEmail: 'ana@ejemplo.com',
          isActive: true,
          createdAt: '2025-08-02T08:00:00Z',
          updatedAt: '2025-08-02T08:00:00Z'
        },
        entryTime: new Date().toISOString(), // Sesión activa actual
        status: 'ACTIVE',
        parkingSpot: 'M-05',
        rate: PARKING_RATES.MOTORCYCLE,
        operator: {
          id: '1',
          email: 'operator@parking.com',
          firstName: 'María',
          lastName: 'García',
          role: 'OPERATOR',
          isActive: true,
          createdAt: '2025-08-01T08:00:00Z',
          updatedAt: '2025-08-01T08:00:00Z'
        },
        notes: 'Motocicleta en espacio M-05',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]
  }

  // Simular delay de red
  private static async delay(ms: number = 300): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // CRUD Operations
  static async fetchAll(): Promise<ParkingSession[]> {
    await this.delay()
    return this.getStoredSessions()
  }

  static async fetchActive(): Promise<ParkingSession[]> {
    await this.delay()
    const sessions = this.getStoredSessions()
    return sessions.filter(session => session.status === 'ACTIVE')
  }

  static async create(sessionData: StartSessionRequest): Promise<ParkingSession> {
    await this.delay()
    
    const sessions = this.getStoredSessions()
    
    // Verificar si ya existe una sesión activa para este vehículo
    const existingActiveSession = sessions.find(
      session => session.vehicle.licensePlate === sessionData.vehicleLicensePlate && 
                 session.status === 'ACTIVE'
    )
    
    if (existingActiveSession) {
      throw new Error(`Ya existe una sesión activa para el vehículo ${sessionData.vehicleLicensePlate}`)
    }

    // Buscar el vehículo (simulado - en realidad vendría de vehicleStore)
    const vehicleData = this.getVehicleByPlate(sessionData.vehicleLicensePlate)
    if (!vehicleData) {
      throw new Error(`No se encontró el vehículo con placa ${sessionData.vehicleLicensePlate}`)
    }

    const now = new Date().toISOString()
    const newSession: ParkingSession = {
      id: (sessions.length + 1).toString(),
      vehicle: vehicleData,
      entryTime: now,
      status: 'ACTIVE',
      parkingSpot: sessionData.parkingSpot,
      rate: PARKING_RATES[vehicleData.vehicleType],
      operator: {
        id: '1',
        email: 'operator@parking.com',
        firstName: 'María',
        lastName: 'García',
        role: 'OPERATOR',
        isActive: true,
        createdAt: '2025-08-01T08:00:00Z',
        updatedAt: '2025-08-01T08:00:00Z'
      },
      notes: sessionData.notes,
      createdAt: now,
      updatedAt: now
    }

    sessions.push(newSession)
    this.saveSessions(sessions)
    return newSession
  }

  static async endSession(sessionData: EndSessionRequest): Promise<ParkingSession> {
    await this.delay()
    
    const sessions = this.getStoredSessions()
    const sessionIndex = sessions.findIndex(s => s.id === sessionData.sessionId)
    
    if (sessionIndex === -1) {
      throw new Error('Sesión no encontrada')
    }

    const session = sessions[sessionIndex]
    
    if (session.status !== 'ACTIVE') {
      throw new Error('La sesión no está activa')
    }

    // Calcular tiempo y costo
    const entryTime = new Date(session.entryTime)
    const exitTime = new Date(sessionData.exitTime)
    const durationMs = exitTime.getTime() - entryTime.getTime()
    const durationHours = Math.ceil(durationMs / (1000 * 60 * 60)) // Redondear hacia arriba
    const totalAmount = durationHours * session.rate

    // Crear payment
    const payment = {
      id: (sessions.length + 10).toString(),
      amount: totalAmount,
      paymentMethod: sessionData.paymentMethod,
      status: 'COMPLETED' as const,
      transactionId: `TXN-${Date.now()}`,
      parkingSession: session,
      processedBy: session.operator,
      processedAt: sessionData.exitTime,
      createdAt: sessionData.exitTime,
      updatedAt: sessionData.exitTime
    }

    // Actualizar sesión
    const updatedSession: ParkingSession = {
      ...session,
      exitTime: sessionData.exitTime,
      status: 'COMPLETED',
      totalAmount,
      payment,
      notes: sessionData.notes || session.notes,
      updatedAt: new Date().toISOString()
    }

    sessions[sessionIndex] = updatedSession
    this.saveSessions(sessions)
    return updatedSession
  }

  static async cancel(sessionId: string, reason?: string): Promise<void> {
    await this.delay()
    
    const sessions = this.getStoredSessions()
    const sessionIndex = sessions.findIndex(s => s.id === sessionId)
    
    if (sessionIndex === -1) {
      throw new Error('Sesión no encontrada')
    }

    const session = sessions[sessionIndex]
    
    if (session.status !== 'ACTIVE') {
      throw new Error('Solo se pueden cancelar sesiones activas')
    }

    sessions[sessionIndex] = {
      ...session,
      status: 'CANCELLED',
      exitTime: new Date().toISOString(),
      notes: reason ? `Cancelada: ${reason}` : 'Sesión cancelada',
      updatedAt: new Date().toISOString()
    }

    this.saveSessions(sessions)
  }

  static async findById(id: string): Promise<ParkingSession | null> {
    await this.delay()
    const sessions = this.getStoredSessions()
    return sessions.find(session => session.id === id) || null
  }

  static async findActiveByVehicle(licensePlate: string): Promise<ParkingSession | null> {
    await this.delay()
    const sessions = this.getStoredSessions()
    return sessions.find(
      session => session.vehicle.licensePlate === licensePlate && session.status === 'ACTIVE'
    ) || null
  }

  // Función auxiliar para obtener vehículo por placa (integración con vehicleStore)
  private static getVehicleByPlate(licensePlate: string): Vehicle | null {
    // En la implementación real, esto vendría del vehicleStore
    // Por ahora simulamos algunos vehículos
    const mockVehicles: Vehicle[] = [
      {
        id: '1',
        licensePlate: 'ABC-123',
        vehicleType: 'CAR',
        brand: 'Toyota',
        model: 'Corolla',
        color: 'Blanco',
        ownerName: 'Juan Pérez',
        ownerPhone: '+57 300 123 4567',
        ownerEmail: 'juan@ejemplo.com',
        isActive: true,
        createdAt: '2025-08-01T08:00:00Z',
        updatedAt: '2025-08-01T08:00:00Z'
      },
      {
        id: '3',
        licensePlate: 'GHI-789',
        vehicleType: 'TRUCK',
        brand: 'Ford',
        model: 'F-150',
        color: 'Azul',
        ownerName: 'Carlos Ruiz',
        ownerPhone: '+57 302 555 7890',
        ownerEmail: 'carlos@ejemplo.com',
        isActive: true,
        createdAt: '2025-08-02T08:00:00Z',
        updatedAt: '2025-08-02T08:00:00Z'
      }
    ]

    return mockVehicles.find(v => v.licensePlate === licensePlate) || null
  }
}

// Hook de Zustand
export const useParkingSessionStore = create<ParkingSessionState>()(
  persist(
    (set, get) => ({
      // Estado inicial
      sessions: [],
      activeSessions: [],
      currentSession: null,
      isLoading: false,
      error: null,

      // Acciones
      fetchSessions: async () => {
        try {
          set({ isLoading: true, error: null })
          const sessions = await ParkingSessionRepository.fetchAll()
          set({ sessions, isLoading: false })
        } catch (error) {
          set({ error: getErrorMessage(error), isLoading: false })
        }
      },

      getActiveSessions: async () => {
        try {
          set({ isLoading: true, error: null })
          const activeSessions = await ParkingSessionRepository.fetchActive()
          set({ activeSessions, isLoading: false })
        } catch (error) {
          set({ error: getErrorMessage(error), isLoading: false })
        }
      },

      startSession: async (sessionData: StartSessionRequest) => {
        try {
          set({ isLoading: true, error: null })
          const newSession = await ParkingSessionRepository.create(sessionData)
          
          const { sessions, activeSessions } = get()
          set({
            sessions: [...sessions, newSession],
            activeSessions: [...activeSessions, newSession],
            currentSession: newSession,
            isLoading: false
          })
          
          return newSession
        } catch (error) {
          set({ error: getErrorMessage(error), isLoading: false })
          throw error
        }
      },

      endSession: async (sessionData: EndSessionRequest) => {
        try {
          set({ isLoading: true, error: null })
          const completedSession = await ParkingSessionRepository.endSession(sessionData)
          
          const { sessions, activeSessions } = get()
          const updatedSessions = sessions.map(s => 
            s.id === completedSession.id ? completedSession : s
          )
          const updatedActiveSessions = activeSessions.filter(s => s.id !== completedSession.id)
          
          set({
            sessions: updatedSessions,
            activeSessions: updatedActiveSessions,
            currentSession: null,
            isLoading: false
          })
          
          return completedSession
        } catch (error) {
          set({ error: getErrorMessage(error), isLoading: false })
          throw error
        }
      },

      cancelSession: async (sessionId: string, reason?: string) => {
        try {
          set({ isLoading: true, error: null })
          await ParkingSessionRepository.cancel(sessionId, reason)
          
          const { sessions, activeSessions } = get()
          const updatedSessions = sessions.map(s => 
            s.id === sessionId ? { ...s, status: 'CANCELLED' as SessionStatus } : s
          )
          const updatedActiveSessions = activeSessions.filter(s => s.id !== sessionId)
          
          set({
            sessions: updatedSessions,
            activeSessions: updatedActiveSessions,
            isLoading: false
          })
        } catch (error) {
          set({ error: getErrorMessage(error), isLoading: false })
          throw error
        }
      },

      getSessionById: async (id: string) => {
        try {
          return await ParkingSessionRepository.findById(id)
        } catch (error) {
          set({ error: getErrorMessage(error) })
          return null
        }
      },

      getActiveSessionByVehicle: async (licensePlate: string) => {
        try {
          return await ParkingSessionRepository.findActiveByVehicle(licensePlate)
        } catch (error) {
          set({ error: getErrorMessage(error) })
          return null
        }
      },

      calculateSessionCost: (sessionId: string) => {
        const session = get().sessions.find(s => s.id === sessionId)
        if (!session) return 0

        if (session.totalAmount) return session.totalAmount

        const entryTime = new Date(session.entryTime)
        const currentTime = new Date()
        const durationMs = currentTime.getTime() - entryTime.getTime()
        const durationHours = Math.ceil(durationMs / (1000 * 60 * 60))
        
        return durationHours * session.rate
      },

      setCurrentSession: (session: ParkingSession | null) => {
        set({ currentSession: session })
      },

      clearError: () => {
        set({ error: null })
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading })
      }
    }),
    {
      name: 'parking-session-storage',
      partialize: (state) => ({
        sessions: state.sessions,
        activeSessions: state.activeSessions
      })
    }
  )
)
