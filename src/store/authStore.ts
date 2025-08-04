import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, LoginCredentials, AuthResponse } from '../types'

interface AuthState {
  // Estado
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null

  // Acciones
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => void
  register: (userData: RegisterData) => Promise<void>
  refreshToken: () => Promise<void>
  clearError: () => void
  setLoading: (loading: boolean) => void
}

interface RegisterData {
  email: string
  password: string
  firstName: string
  lastName: string
  role?: 'ADMIN' | 'OPERATOR' | 'USER'
}

// Simulación de API - En producción esto conectaría con tu backend Spring Boot
const authAPI = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    // Simulamos una llamada a la API
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Usuario demo para testing
    if (credentials.email === 'admin@parking.com' && credentials.password === 'admin123') {
      return {
        success: true,
        data: {
          user: {
            id: '1',
            email: 'admin@parking.com',
            firstName: 'Admin',
            lastName: 'Sistema',
            role: 'ADMIN',
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.demo.token',
          refreshToken: 'refresh.token.demo'
        }
      }
    }
    
    // Usuario operador demo
    if (credentials.email === 'operador@parking.com' && credentials.password === 'op123') {
      return {
        success: true,
        data: {
          user: {
            id: '2',
            email: 'operador@parking.com',
            firstName: 'Juan',
            lastName: 'Operador',
            role: 'OPERATOR',
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.demo.token.operator',
          refreshToken: 'refresh.token.demo.operator'
        }
      }
    }

    // Credenciales inválidas
    return {
      success: false,
      error: 'Credenciales inválidas'
    }
  },

  async register(userData: RegisterData): Promise<AuthResponse> {
    await new Promise(resolve => setTimeout(resolve, 1200))
    
    // Simulamos registro exitoso
    return {
      success: true,
      data: {
        user: {
          id: Date.now().toString(),
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          role: userData.role || 'USER',
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.demo.new.user',
        refreshToken: 'refresh.token.new.user'
      }
    }
  },

  async refreshToken(): Promise<AuthResponse> {
    await new Promise(resolve => setTimeout(resolve, 500))
    
    return {
      success: true,
      data: {
        user: undefined, // El usuario ya está en el store
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.refreshed.token',
        refreshToken: 'new.refresh.token'
      }
    }
  }
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Estado inicial
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Acciones
      login: async (credentials: LoginCredentials) => {
        set({ isLoading: true, error: null })
        
        try {
          const response = await authAPI.login(credentials)
          
          if (response.success && response.data) {
            set({
              user: response.data.user,
              token: response.data.token,
              isAuthenticated: true,
              isLoading: false,
              error: null
            })
          } else {
            set({
              isLoading: false,
              error: response.error || 'Error al iniciar sesión'
            })
          }
        } catch (error) {
          set({
            isLoading: false,
            error: 'Error de conexión. Intenta nuevamente.'
          })
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null
        })
      },

      register: async (userData: RegisterData) => {
        set({ isLoading: true, error: null })
        
        try {
          const response = await authAPI.register(userData)
          
          if (response.success && response.data) {
            set({
              user: response.data.user,
              token: response.data.token,
              isAuthenticated: true,
              isLoading: false,
              error: null
            })
          } else {
            set({
              isLoading: false,
              error: response.error || 'Error al registrar usuario'
            })
          }
        } catch (error) {
          set({
            isLoading: false,
            error: 'Error de conexión. Intenta nuevamente.'
          })
        }
      },

      refreshToken: async () => {
        try {
          const response = await authAPI.refreshToken()
          
          if (response.success && response.data) {
            set({
              token: response.data.token
            })
          }
        } catch (error) {
          // Si falla el refresh, cerramos sesión
          get().logout()
        }
      },

      clearError: () => set({ error: null }),
      
      setLoading: (loading: boolean) => set({ isLoading: loading })
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
)
