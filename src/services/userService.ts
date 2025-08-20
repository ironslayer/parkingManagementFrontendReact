// ==========================================
// USER SERVICE - GESTIÓN DE USUARIOS
// ==========================================
import { apiService } from './api';
import type { User } from '../types';

// ==========================================
// INTERFACES DE REQUEST/RESPONSE
// ==========================================
export interface CreateUserRequest {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
}

export interface UpdateUserRequest {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  role: 'ADMIN' | 'OPERATOR';
  isActive: boolean;
}

export interface UserProfileUpdateRequest {
  firstname: string;
  lastname: string;
  currentPassword?: string;
  newPassword?: string;
}

export interface UserResponse {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  role: 'ADMIN' | 'OPERATOR';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// CLASE SERVICE
// ==========================================
class UserService {
  private readonly baseUrl = '/users';

  /**
   * Obtener todos los usuarios (ADMIN only)
   */
  async getUsers(): Promise<UserResponse[]> {
    try {
      const users = await apiService.get<UserResponse[]>(this.baseUrl);
      return users || [];
    } catch (error) {
      console.error('Error fetching users:', error);
      throw new Error('Error al obtener la lista de usuarios');
    }
  }

  /**
   * Obtener usuario por ID (ADMIN only)
   */
  async getUserById(id: number): Promise<UserResponse> {
    try {
      const user = await apiService.get<UserResponse>(`${this.baseUrl}/${id}`);
      
      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      return user;
    } catch (error) {
      console.error('Error fetching user by ID:', error);
      throw new Error('Error al obtener el usuario');
    }
  }

  /**
   * Crear nuevo operador (ADMIN only)
   */
  async createOperator(userData: CreateUserRequest): Promise<UserResponse> {
    try {
      // Validar datos de entrada
      this.validateCreateUserData(userData);

      const newUser = await apiService.post<UserResponse>(
        `${this.baseUrl}/register-operator`, 
        userData
      );

      if (!newUser) {
        throw new Error('Error en la respuesta del servidor');
      }

      return newUser;
    } catch (error) {
      console.error('Error creating operator:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Error al crear el operador');
    }
  }

  /**
   * Actualizar usuario (ADMIN only)
   */
  async updateUser(userData: UpdateUserRequest): Promise<void> {
    try {
      // Validar datos de entrada
      this.validateUpdateUserData(userData);

      await apiService.put<void>(this.baseUrl, userData);
    } catch (error) {
      console.error('Error updating user:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Error al actualizar el usuario');
    }
  }

  /**
   * Cambiar estado del usuario - Soft Delete (ADMIN only)
   */
  async updateUserStatus(id: number, isActive: boolean): Promise<void> {
    try {
      if (!id || id <= 0) {
        throw new Error('ID de usuario inválido');
      }

      await apiService.patch<void>(`${this.baseUrl}/${id}/status`, {
        isActive
      });
    } catch (error) {
      console.error('Error updating user status:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Error al actualizar el estado del usuario');
    }
  }

  /**
   * Obtener perfil personal
   */
  async getProfile(): Promise<UserResponse> {
    try {
      const profile = await apiService.get<UserResponse>(`${this.baseUrl}/profile`);

      if (!profile) {
        throw new Error('Error al obtener el perfil');
      }

      return profile;
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw new Error('Error al obtener el perfil del usuario');
    }
  }

  /**
   * Actualizar perfil personal
   */
  async updateProfile(profileData: UserProfileUpdateRequest): Promise<void> {
    try {
      // Validar datos de entrada
      this.validateProfileData(profileData);

      await apiService.put<void>(`${this.baseUrl}/profile`, profileData);
    } catch (error) {
      console.error('Error updating profile:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Error al actualizar el perfil');
    }
  }

  // ==========================================
  // MÉTODOS DE VALIDACIÓN
  // ==========================================
  private validateCreateUserData(userData: CreateUserRequest): void {
    if (!userData.firstname?.trim()) {
      throw new Error('El nombre es requerido');
    }
    if (!userData.lastname?.trim()) {
      throw new Error('El apellido es requerido');
    }
    if (!userData.email?.trim()) {
      throw new Error('El email es requerido');
    }
    if (!this.isValidEmail(userData.email)) {
      throw new Error('El formato del email es inválido');
    }
    if (!userData.password || userData.password.length < 5) {
      throw new Error('La contraseña debe tener al menos 5 caracteres');
    }
  }

  private validateUpdateUserData(userData: UpdateUserRequest): void {
    if (!userData.id || userData.id <= 0) {
      throw new Error('ID de usuario inválido');
    }
    if (!userData.firstname?.trim()) {
      throw new Error('El nombre es requerido');
    }
    if (!userData.lastname?.trim()) {
      throw new Error('El apellido es requerido');
    }
    if (!userData.email?.trim()) {
      throw new Error('El email es requerido');
    }
    if (!this.isValidEmail(userData.email)) {
      throw new Error('El formato del email es inválido');
    }
    if (!['ADMIN', 'OPERATOR'].includes(userData.role)) {
      throw new Error('Rol de usuario inválido');
    }
  }

  private validateProfileData(profileData: UserProfileUpdateRequest): void {
    if (!profileData.firstname?.trim()) {
      throw new Error('El nombre es requerido');
    }
    if (!profileData.lastname?.trim()) {
      throw new Error('El apellido es requerido');
    }
    
    // Validar contraseña solo si se está cambiando
    if (profileData.newPassword) {
      if (!profileData.currentPassword) {
        throw new Error('La contraseña actual es requerida para cambiar la contraseña');
      }
      if (profileData.newPassword.length < 5) {
        throw new Error('La nueva contraseña debe tener al menos 5 caracteres');
      }
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // ==========================================
  // MÉTODOS DE UTILIDAD
  // ==========================================
  
  /**
   * Convertir UserResponse a User type
   */
  mapResponseToUser(userResponse: UserResponse): User {
    return {
      id: userResponse.id.toString(),
      email: userResponse.email,
      firstName: userResponse.firstname,
      lastName: userResponse.lastname,
      role: userResponse.role,
      isActive: userResponse.isActive,
      createdAt: userResponse.createdAt,
      updatedAt: userResponse.updatedAt
    };
  }

  /**
   * Filtrar usuarios por criterios
   */
  filterUsers(users: UserResponse[], filters: {
    search?: string;
    role?: 'ADMIN' | 'OPERATOR' | 'ALL';
    isActive?: boolean;
  }): UserResponse[] {
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
  }

  /**
   * Estadísticas de usuarios
   */
  getUserStats(users: UserResponse[]) {
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
  }
}

// ==========================================
// EXPORT SINGLETON
// ==========================================
export const userService = new UserService();
export default userService;
