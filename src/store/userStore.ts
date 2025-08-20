// ==========================================
// USER STORE - GESTIÓN DE USUARIOS CON ZUSTAND
// ==========================================
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../types';
import { 
  userService, 
  type CreateUserRequest, 
  type UpdateUserRequest,
  type UserProfileUpdateRequest
} from '../services/userService';

// ==========================================
// INTERFAZ DEL STORE
// ==========================================
interface UserState {
  // Estado
  users: User[];
  currentUserProfile: User | null;
  isLoading: boolean;
  error: string | null;

  // Acciones CRUD
  fetchUsers: () => Promise<void>;
  getUserById: (id: string) => Promise<User>;
  createOperator: (userData: CreateUserRequest) => Promise<void>;
  updateUser: (userData: UpdateUserRequest) => Promise<void>;
  updateUserStatus: (id: string, isActive: boolean) => Promise<void>;
  
  // Perfil del usuario
  fetchProfile: () => Promise<void>;
  updateProfile: (profileData: UserProfileUpdateRequest) => Promise<void>;
  
  // Utilidades
  clearError: () => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
  
  // Filtros y búsqueda
  getFilteredUsers: (filters: UserFilters) => User[];
  getUserStats: () => UserStats;
}

// ==========================================
// TIPOS AUXILIARES
// ==========================================
export interface UserFilters {
  search?: string;
  role?: 'ADMIN' | 'OPERATOR' | 'ALL';
  isActive?: boolean;
}

export interface UserStats {
  total: number;
  active: number;
  inactive: number;
  admins: number;
  operators: number;
  activePercentage: number;
  adminPercentage: number;
}

// ==========================================
// REPOSITORIO DE USUARIOS
// ==========================================
class UserRepository {
  /**
   * Obtener todos los usuarios (ADMIN only)
   */
  static async fetchAll(): Promise<User[]> {
    try {
      const userResponses = await userService.getUsers();
      return userResponses.map(userResponse => 
        userService.mapResponseToUser(userResponse)
      );
    } catch (error) {
      console.error('Error in UserRepository.fetchAll:', error);
      throw error;
    }
  }

  /**
   * Obtener usuario por ID
   */
  static async findById(id: string): Promise<User> {
    try {
      const userResponse = await userService.getUserById(parseInt(id));
      return userService.mapResponseToUser(userResponse);
    } catch (error) {
      console.error('Error in UserRepository.findById:', error);
      throw error;
    }
  }

  /**
   * Crear nuevo operador
   */
  static async create(userData: CreateUserRequest): Promise<User> {
    try {
      const userResponse = await userService.createOperator(userData);
      return userService.mapResponseToUser(userResponse);
    } catch (error) {
      console.error('Error in UserRepository.create:', error);
      throw error;
    }
  }

  /**
   * Actualizar usuario
   */
  static async update(userData: UpdateUserRequest): Promise<void> {
    try {
      await userService.updateUser(userData);
    } catch (error) {
      console.error('Error in UserRepository.update:', error);
      throw error;
    }
  }

  /**
   * Cambiar estado del usuario (Soft Delete)
   */
  static async updateStatus(id: string, isActive: boolean): Promise<void> {
    try {
      await userService.updateUserStatus(parseInt(id), isActive);
    } catch (error) {
      console.error('Error in UserRepository.updateStatus:', error);
      throw error;
    }
  }

  /**
   * Obtener perfil personal
   */
  static async fetchProfile(): Promise<User> {
    try {
      const userResponse = await userService.getProfile();
      return userService.mapResponseToUser(userResponse);
    } catch (error) {
      console.error('Error in UserRepository.fetchProfile:', error);
      throw error;
    }
  }

  /**
   * Actualizar perfil personal
   */
  static async updateProfile(profileData: UserProfileUpdateRequest): Promise<void> {
    try {
      await userService.updateProfile(profileData);
    } catch (error) {
      console.error('Error in UserRepository.updateProfile:', error);
      throw error;
    }
  }
}

// ==========================================
// FUNCIONES DE UTILIDAD
// ==========================================

/**
 * Interfaz para errores de API
 */
interface ApiError {
  response?: {
    data?: {
      message?: string;
      details?: string;
    };
    status?: number;
  };
}

/**
 * Extrae el mensaje de error más específico del response del backend
 */
const getErrorMessage = (error: unknown): string => {
  // Si es un error de API que tiene response
  if (error && typeof error === 'object' && 'response' in error) {
    const apiError = error as ApiError;
    
    // Priorizar mensaje específico del backend
    if (apiError.response?.data?.message) {
      return apiError.response.data.message;
    }
    
    // Fallback a detalles específicos
    if (apiError.response?.data?.details) {
      return apiError.response.data.details;
    }
    
    // Mensaje genérico basado en status
    if (apiError.response?.status) {
      switch (apiError.response.status) {
        case 400:
          return 'Datos inválidos. Verifica la información ingresada.';
        case 401:
          return 'Credenciales incorrectas. Verifica tu contraseña actual.';
        case 403:
          return 'No tienes permisos para realizar esta acción.';
        case 404:
          return 'Usuario no encontrado.';
        case 409:
          return 'Conflicto: La operación no se puede completar.';
        case 422:
          return 'Los datos enviados no son válidos.';
        case 500:
          return 'Error interno del servidor. Intenta nuevamente.';
        default:
          return `Error del servidor (${apiError.response.status})`;
      }
    }
  }
  
  // Si es un Error estándar de JavaScript
  if (error instanceof Error) {
    return error.message;
  }
  
  // Si es un string
  if (typeof error === 'string') {
    return error;
  }
  
  // Fallback para errores desconocidos
  return 'Error inesperado. Intenta nuevamente.';
};

const filterUsers = (users: User[], filters: UserFilters): User[] => {
  return users.filter(user => {
    // Filtro de búsqueda
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      const fullName = `${user.firstname} ${user.lastname}`.toLowerCase();
      const matchesSearch = 
        fullName.includes(searchTerm) ||
        user.email.toLowerCase().includes(searchTerm);
      
      if (!matchesSearch) return false;
    }

    // Filtro de rol
    if (filters.role && filters.role !== 'ALL') {
      if (user.role !== filters.role) return false;
    }

    // Filtro de estado activo
    if (filters.isActive !== undefined) {
      if (user.isActive !== filters.isActive) return false;
    }

    return true;
  });
};

const calculateUserStats = (users: User[]): UserStats => {
  const stats = {
    total: users.length,
    active: users.filter(u => u.isActive).length,
    inactive: users.filter(u => !u.isActive).length,
    admins: users.filter(u => u.role === 'ADMIN').length,
    operators: users.filter(u => u.role === 'OPERATOR').length
  };

  return {
    ...stats,
    activePercentage: stats.total > 0 ? (stats.active / stats.total) * 100 : 0,
    adminPercentage: stats.total > 0 ? (stats.admins / stats.total) * 100 : 0
  };
};

// ==========================================
// ESTADO INICIAL
// ==========================================
const initialState = {
  users: [],
  currentUserProfile: null,
  isLoading: false,
  error: null,
};

// ==========================================
// STORE PRINCIPAL
// ==========================================
export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      ...initialState,

      // ==========================================
      // ACCIONES CRUD
      // ==========================================
      fetchUsers: async () => {
        set({ isLoading: true, error: null });
        
        try {
          const users = await UserRepository.fetchAll();
          set({ users, isLoading: false });
        } catch (error) {
          const errorMessage = getErrorMessage(error);
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      getUserById: async (id: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const user = await UserRepository.findById(id);
          set({ isLoading: false });
          return user;
        } catch (error) {
          const errorMessage = getErrorMessage(error);
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      createOperator: async (userData: CreateUserRequest) => {
        set({ isLoading: true, error: null });
        
        try {
          const newUser = await UserRepository.create(userData);
          
          // Agregar el nuevo usuario a la lista
          const currentUsers = get().users;
          set({ 
            users: [...currentUsers, newUser],
            isLoading: false 
          });
        } catch (error) {
          const errorMessage = getErrorMessage(error);
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      updateUser: async (userData: UpdateUserRequest) => {
        set({ isLoading: true, error: null });
        
        try {
          await UserRepository.update(userData);
          
          // Actualizar el usuario en la lista local
          const currentUsers = get().users;
          const updatedUsers = currentUsers.map(user => 
            user.id === userData.id.toString() 
              ? {
                  ...user,
                  firstname: userData.firstname,
                  lastname: userData.lastname,
                  email: userData.email,
                  role: userData.role,
                  ...(userData.isActive !== undefined && { isActive: userData.isActive }),
                  updatedAt: new Date().toISOString()
                }
              : user
          );
          
          set({ 
            users: updatedUsers,
            isLoading: false 
          });
        } catch (error) {
          const errorMessage = getErrorMessage(error);
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      updateUserStatus: async (id: string, isActive: boolean) => {
        set({ isLoading: true, error: null });
        
        try {
          await UserRepository.updateStatus(id, isActive);
          
          // Actualizar el usuario en la lista local
          const currentUsers = get().users;
          const updatedUsers = currentUsers.map(user => 
            user.id === id 
              ? { ...user, isActive, updatedAt: new Date().toISOString() }
              : user
          );
          
          set({ 
            users: updatedUsers,
            isLoading: false 
          });
        } catch (error) {
          const errorMessage = getErrorMessage(error);
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      // ==========================================
      // PERFIL DE USUARIO
      // ==========================================
      fetchProfile: async () => {
        set({ isLoading: true, error: null });
        
        try {
          const profile = await UserRepository.fetchProfile();
          set({ 
            currentUserProfile: profile,
            isLoading: false 
          });
        } catch (error) {
          const errorMessage = getErrorMessage(error);
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      updateProfile: async (profileData: UserProfileUpdateRequest) => {
        set({ isLoading: true, error: null });
        
        try {
          await UserRepository.updateProfile(profileData);
          
          // Actualizar el perfil local si existe
          const currentProfile = get().currentUserProfile;
          if (currentProfile) {
            set({
              currentUserProfile: {
                ...currentProfile,
                ...(profileData.firstname !== undefined && { firstname: profileData.firstname }),
                ...(profileData.lastname !== undefined && { lastname: profileData.lastname }),
                ...(profileData.email !== undefined && { email: profileData.email }),
                updatedAt: new Date().toISOString()
              },
              isLoading: false
            });
          } else {
            set({ isLoading: false });
          }
        } catch (error) {
          const errorMessage = getErrorMessage(error);
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      // ==========================================
      // UTILIDADES
      // ==========================================
      clearError: () => {
        set({ error: null });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      reset: () => {
        set(initialState);
      },

      // ==========================================
      // FILTROS Y ESTADÍSTICAS
      // ==========================================
      getFilteredUsers: (filters: UserFilters) => {
        const users = get().users;
        return filterUsers(users, filters);
      },

      getUserStats: () => {
        const users = get().users;
        return calculateUserStats(users);
      },
    }),
    {
      name: 'parking-user-store',
      partialize: (state) => ({
        // Solo persistir datos esenciales, no el estado de loading/error
        users: state.users,
        currentUserProfile: state.currentUserProfile,
      }),
    }
  )
);

// ==========================================
// HOOKS AUXILIARES
// ==========================================

/**
 * Hook para obtener usuarios filtrados
 */
export const useFilteredUsers = (filters: UserFilters) => {
  const getFilteredUsers = useUserStore(state => state.getFilteredUsers);
  return getFilteredUsers(filters);
};

/**
 * Hook para obtener estadísticas de usuarios
 */
export const useUserStats = () => {
  const getUserStats = useUserStore(state => state.getUserStats);
  return getUserStats();
};

/**
 * Hook para operaciones de usuario específicas
 */
export const useUserOperations = () => {
  const {
    createOperator,
    updateUser,
    updateUserStatus,
    isLoading,
    error,
    clearError
  } = useUserStore();

  return {
    createOperator,
    updateUser,
    updateUserStatus,
    isLoading,
    error,
    clearError
  };
};

export default useUserStore;
