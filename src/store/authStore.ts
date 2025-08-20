import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, LoginCredentials } from '../types'
import { authService, type AuthResult } from '../services/authService'

interface AuthState {
  // Estado
  user: User | null
  token: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null

  // Acciones
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => Promise<void>
  refreshTokenAsync: () => Promise<void>
  validateSession: () => Promise<void>
  updateUser: (user: User) => void
  clearError: () => void
  setLoading: (loading: boolean) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Estado inicial
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Acciones
      login: async (credentials: LoginCredentials) => {
        set({ isLoading: true, error: null })
        
        try {
          console.log('🔐 Iniciando sesión con backend...')
          const authResult: AuthResult = await authService.login(credentials)
          
          set({
            user: authResult.user,
            token: authResult.token,
            refreshToken: authResult.refreshToken,
            isAuthenticated: true,
            isLoading: false,
            error: null
          })
          
          console.log('✅ Sesión iniciada correctamente:', authResult.user.email)
        } catch (error) {
          console.error('❌ Error al iniciar sesión:', error)
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Error al iniciar sesión'
          })
        }
      },

      logout: async () => {
        set({ isLoading: true })
        
        try {
          console.log('🚪 Cerrando sesión...')
          await authService.logout()
          
          set({
            user: null,
            token: null,
            refreshToken: null,
            isAuthenticated: false,
            isLoading: false,
            error: null
          })
          
          console.log('✅ Sesión cerrada correctamente')
        } catch (error) {
          console.error('❌ Error al cerrar sesión:', error)
          // Aunque falle, limpiar el estado local
          set({
            user: null,
            token: null,
            refreshToken: null,
            isAuthenticated: false,
            isLoading: false,
            error: null
          })
        }
      },

      refreshTokenAsync: async () => {
        try {
          console.log('🔄 Renovando token...')
          const newToken = await authService.refreshToken()
          
          set({
            token: newToken
          })
          
          console.log('✅ Token renovado correctamente')
        } catch (error) {
          console.error('❌ Error al renovar token:', error)
          // Si falla el refresh, cerrar sesión
          get().logout()
        }
      },

      validateSession: async () => {
        const { token } = get()
        
        if (!token) {
          console.log('ℹ️ No hay token para validar')
          return
        }
        
        set({ isLoading: true })
        
        try {
          console.log('🔍 Validando sesión existente...')
          const user = await authService.validateToken()
          
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null
          })
          
          console.log('✅ Sesión válida:', user.email)
        } catch (error) {
          console.error('❌ Sesión inválida:', error)
          // Limpiar sesión si es inválida
          set({
            user: null,
            token: null,
            refreshToken: null,
            isAuthenticated: false,
            isLoading: false,
            error: null
          })
        }
      },

      updateUser: (user: User) => {
        set({ user })
      },

      clearError: () => set({ error: null }),
      
      setLoading: (loading: boolean) => set({ isLoading: loading })
    }),
    {
      name: 'parking-auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
)
