// ==========================================
// SERVICIO DE AUTENTICACIÓN CON BACKEND REAL
// ==========================================
import { apiService } from './api';
import { API_CONFIG } from '../constants';
import type { User, LoginCredentials } from '../types';
import { PERMISSIONS_MATRIX } from '../types/auth';

// ==========================================
// TIPOS ESPECÍFICOS PARA AUTENTICACIÓN
// ==========================================
export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthApiResponse {
  token: string;
}

export interface UserProfileResponse {
  id: number;
  email: string;
  firstName?: string;  // Frontend standard
  lastName?: string;   // Frontend standard
  firstname?: string;  // Backend format
  lastname?: string;   // Backend format
  phone?: string;
  role: 'ADMIN' | 'OPERATOR' | 'CUSTOMER';
  createdAt: string;
  updatedAt?: string;
  isActive?: boolean;
}

export interface RefreshTokenResponse {
  access_token: string;
  expires_in: number;
}

export interface AuthResult {
  user: User;
  token: string;
  refreshToken: string;
  expiresIn: number;
}

// ==========================================
// SERVICIO DE AUTENTICACIÓN
// ==========================================
export class AuthService {
  // ==========================================
  // AUTENTICACIÓN
  // ==========================================
  async login(credentials: LoginCredentials): Promise<AuthResult> {
    try {
      console.log('🔐 Intentando autenticación con backend...');
      
      // Limpiar cualquier token anterior antes del login
      localStorage.removeItem('parking_auth_token');
      apiService.clearAuthToken();
      
      const response = await apiService.post<AuthApiResponse>(
        API_CONFIG.ENDPOINTS.AUTH.LOGIN,
        {
          email: credentials.email,
          password: credentials.password,
        }
      );

      console.log('✅ Autenticación exitosa');

      // Configurar token en el cliente HTTP
      apiService.setAuthToken(response.token);

      // Obtener información del usuario desde el perfil
      const profileResponse = await apiService.get<UserProfileResponse>(
        API_CONFIG.ENDPOINTS.AUTH.PROFILE
      );
      
      console.log('✅ Perfil obtenido del backend');

      const user: User = {
        id: profileResponse.id.toString(),
        email: profileResponse.email,
        firstname: profileResponse.firstname || profileResponse.firstName || '',
        lastname: profileResponse.lastname || profileResponse.lastName || '',
        role: (profileResponse.role === 'CUSTOMER') ? 'OPERATOR' : profileResponse.role as 'ADMIN' | 'OPERATOR',
        isActive: true,
        createdAt: profileResponse.createdAt,
        updatedAt: profileResponse.createdAt,
      };

      const authResult: AuthResult = {
        user,
        token: response.token,
        refreshToken: response.token, // Backend no usa refresh token separado
        expiresIn: 3600, // 1 hora por defecto
      };

      return authResult;
    } catch (error) {
      console.error('❌ Error en autenticación:', error);
      
      // FALLBACK: Si el backend no está disponible, usar datos demo
      if (credentials.email === 'admin@parking.com' && credentials.password === 'admin123') {
        console.log('🔄 Backend no disponible, usando modo demo...');
        
        const demoUser: AuthResult = {
          user: {
            id: '1',
            email: 'admin@parking.com',
            firstname: 'Admin',
            lastname: 'User',
            role: 'ADMIN',
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          token: 'demo-jwt-token-admin',
          refreshToken: 'demo-refresh-token',
          expiresIn: 3600,
        };
        
        // Configurar token demo
        apiService.setAuthToken(demoUser.token);
        return demoUser;
      }
      
      if (credentials.email === 'operator@parking.com' && credentials.password === 'operator123') {
        console.log('🔄 Backend no disponible, usando modo demo...');
        
        const demoUser: AuthResult = {
          user: {
            id: '2',
            email: 'operator@parking.com',
            firstname: 'Juan',
            lastname: 'Operador',
            role: 'OPERATOR',
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          token: 'demo-jwt-token-operator',
          refreshToken: 'demo-refresh-token',
          expiresIn: 3600,
        };
        
        // Configurar token demo
        apiService.setAuthToken(demoUser.token);
        return demoUser;
      }

      if (credentials.email === 'customer@parking.com' && credentials.password === 'customer123') {
        console.log('🔄 Backend no disponible, usando modo demo...');
        
        const demoUser: AuthResult = {
          user: {
            id: '3',
            email: 'customer@parking.com',
                        firstname: 'Cliente',
            lastname: 'Test',
            role: 'OPERATOR', // Cambiamos CUSTOMER por OPERATOR
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          token: 'demo-jwt-token-customer',
          refreshToken: 'demo-refresh-token',
          expiresIn: 3600,
        };
        
        // Configurar token demo
        apiService.setAuthToken(demoUser.token);
        return demoUser;
      }
      
      throw new Error('Credenciales inválidas o error del servidor');
    }
  }

  // ==========================================
  // CERRAR SESIÓN
  // ==========================================
  async logout(): Promise<void> {
    try {
      console.log('🚪 Cerrando sesión...');
      
      // Notificar al backend del logout
      try {
        await apiService.post(API_CONFIG.ENDPOINTS.AUTH.LOGOUT, {});
        console.log('✅ Logout notificado al backend');
      } catch (error) {
        console.warn('⚠️ No se pudo notificar logout al backend:', error);
      }

      // Limpiar token local
      apiService.clearAuthToken();
      
      console.log('✅ Sesión cerrada exitosamente');
    } catch (error) {
      console.error('❌ Error al cerrar sesión:', error);
      // Aunque falle el logout en backend, limpiar localmente
      apiService.clearAuthToken();
    }
  }

  // ==========================================
  // RENOVAR TOKEN
  // ==========================================
  async refreshToken(): Promise<string> {
    try {
      console.log('🔄 Backend no implementa refresh token, re-validando sesión...');
      
      // Como no hay endpoint de refresh, validamos que el token actual siga siendo válido
      await this.validateToken();
      
      const currentToken = this.getCurrentToken();
      if (!currentToken) {
        throw new Error('No hay token para renovar');
      }
      
      console.log('✅ Token validado exitosamente');
      return currentToken;
    } catch (error) {
      console.error('❌ Error al validar token:', error);
      throw new Error('No se pudo renovar el token de autenticación');
    }
  }

  // ==========================================
  // VALIDAR TOKEN ACTUAL
  // ==========================================
  async validateToken(): Promise<User> {
    try {
      console.log('🔍 Validando token actual...');
      
      // Hacer una petición al perfil para validar el token
      const response = await apiService.get<UserProfileResponse>(
        API_CONFIG.ENDPOINTS.AUTH.PROFILE
      );
      
      const user: User = {
        id: response.id.toString(),
        email: response.email,
        firstname: response.firstname || response.firstName || '',
        lastname: response.lastname || response.lastName || '',
        role: (response.role === 'CUSTOMER') ? 'OPERATOR' : response.role as 'ADMIN' | 'OPERATOR',
        isActive: true,
        createdAt: response.createdAt,
        updatedAt: response.createdAt,
      };

      console.log('✅ Token válido para usuario:', user.email);
      return user;
    } catch (error) {
      console.error('❌ Token inválido:', error);
      throw new Error('Token de autenticación inválido');
    }
  }

  // ==========================================
  // OBTENER TOKEN ACTUAL
  // ==========================================
  getCurrentToken(): string | null {
    return localStorage.getItem('parking_auth_token');
  }

  // ==========================================
  // VERIFICAR SI HAY SESIÓN ACTIVA
  // ==========================================
  hasValidSession(): boolean {
    const token = this.getCurrentToken();
    return !!token;
  }

  // ==========================================
  // SISTEMA DE PERMISOS
  // ==========================================
  hasPermission(permission: string, currentUser?: User): boolean {
    const user = currentUser || this.getCurrentUserFromStorage();
    
    if (!user) return false;

    // Admin tiene todos los permisos
    if (user.role === 'ADMIN') {
      return true;
    }

    // Verificar en la matriz de permisos
    const allowedRoles = PERMISSIONS_MATRIX[permission];
    const hasAccess = allowedRoles?.includes(user.role) || false;
    console.log('🔍 Verificando matriz:', { permission, allowedRoles, userRole: user.role, hasAccess });
    
    return hasAccess;
  }

  hasAnyPermission(permissions: string[], currentUser?: User): boolean {
    return permissions.some(permission => this.hasPermission(permission, currentUser));
  }

  hasRole(role: string, currentUser?: User): boolean {
    const user = currentUser || this.getCurrentUserFromStorage();
    return user?.role === role;
  }

  canDeleteVehicles(currentUser?: User): boolean {
    return this.hasPermission('vehicles:delete', currentUser);
  }

  canManageUsers(currentUser?: User): boolean {
    return this.hasPermission('config:users', currentUser);
  }

  canViewReports(currentUser?: User): boolean {
    return this.hasPermission('reports:revenue', currentUser);
  }

  // ==========================================
  // OBTENER USUARIO ACTUAL DESDE STORAGE
  // ==========================================
  getCurrentUserFromStorage(): User | null {
    // Por simplicidad, extraemos del token o storage local
    // En un escenario real esto vendría del token JWT decodificado
    const token = this.getCurrentToken();
    if (!token) return null;

    // Demo usuarios basados en el token
    if (token === 'demo-jwt-token-admin') {
      return {
        id: '1',
        email: 'admin@parking.com',
        firstname: 'Admin',
        lastname: 'Sistema',
        role: 'ADMIN',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }

    if (token === 'demo-jwt-token-operator') {
      return {
        id: '2',
        email: 'operator@parking.com',
        firstname: 'Juan',
        lastname: 'Operador',
        role: 'OPERATOR',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }

    if (token === 'demo-jwt-token-customer') {
      return {
        id: '3',
        email: 'customer@parking.com',
        firstname: 'Cliente',
        lastname: 'Demo',
        role: 'OPERATOR', // Cambiamos por OPERATOR ya que no hay CUSTOMER
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }

    // Fallback para tokens reales del backend
    try {
      // En producción aquí decodificarías el JWT
      return null;
    } catch {
      return null;
    }
  }
}

// ==========================================
// EXPORTAR INSTANCIA SINGLETON
// ==========================================
export const authService = new AuthService();
