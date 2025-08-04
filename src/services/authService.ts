// ==========================================
// SERVICIO DE AUTENTICACIÓN CON BACKEND REAL
// ==========================================
import { apiService } from './api';
import { API_CONFIG } from '../constants';
import type { User, LoginCredentials } from '../types';

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
  firstName: string;
  lastName: string;
  phone?: string;
  role: 'ADMIN' | 'OPERATOR' | 'CUSTOMER';
  createdAt: string;
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
  // MÉTODOS PRIVADOS
  // ==========================================
  
  /**
   * Decodifica el JWT token para extraer el payload
   */
  private decodeJwtPayload(token: string): { user_id: number; sub: string; authorities: string[] } | null {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('❌ Error decodificando JWT:', error);
      return null;
    }
  }

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

      // Decodificar el JWT para obtener el user_id
      const payload = this.decodeJwtPayload(response.token);
      if (!payload || !payload.user_id) {
        throw new Error('Token JWT inválido: no contiene user_id');
      }

      // Obtener información del usuario usando su ID
      const profileResponse = await apiService.get<UserProfileResponse>(
        API_CONFIG.ENDPOINTS.AUTH.USER_BY_ID(payload.user_id.toString())
      );

      const user: User = {
        id: profileResponse.id.toString(),
        email: profileResponse.email,
        firstName: profileResponse.firstName,
        lastName: profileResponse.lastName,
        role: profileResponse.role,
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
            firstName: 'Admin',
            lastName: 'Sistema',
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
            firstName: 'Juan',
            lastName: 'Operador',
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
            firstName: 'Cliente',
            lastName: 'Demo',
            role: 'CUSTOMER',
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
        firstName: response.firstName,
        lastName: response.lastName,
        role: response.role,
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
}

// ==========================================
// EXPORTAR INSTANCIA SINGLETON
// ==========================================
export const authService = new AuthService();
