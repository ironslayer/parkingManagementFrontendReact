// ==========================================
// CLIENTE HTTP PARA INTEGRACIÓN CON BACKEND
// ==========================================
import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { API_CONFIG } from '../constants';

// ==========================================
// CONFIGURACIÓN BASE DEL CLIENTE HTTP
// ==========================================
const createApiClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: API_CONFIG.BASE_URL,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  });

  // ==========================================
  // INTERCEPTOR DE PETICIONES (REQUEST)
  // ==========================================
  client.interceptors.request.use(
    (config) => {
      // No agregar token JWT en el endpoint de autenticación
      const isAuthEndpoint = config.url?.includes('/authenticate');
      
      // Agregar token JWT si existe y no es endpoint de auth
      if (!isAuthEndpoint) {
        const token = localStorage.getItem('parking_auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }

      // Log de la petición en desarrollo
      if (import.meta.env.DEV) {
        console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
          data: config.data,
          params: config.params,
          hasAuth: !!config.headers.Authorization,
        });
      }

      return config;
    },
    (error) => {
      console.error('❌ Request interceptor error:', error);
      return Promise.reject(error);
    }
  );

  // ==========================================
  // INTERCEPTOR DE RESPUESTAS (RESPONSE)
  // ==========================================
  client.interceptors.response.use(
    (response: AxiosResponse) => {
      // Log de la respuesta en desarrollo
      if (import.meta.env.DEV) {
        console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, {
          status: response.status,
          data: response.data,
        });
      }

      return response;
    },
    (error) => {
      // Log del error
      console.error('❌ API Error:', {
        status: error.response?.status,
        message: error.response?.data?.message || error.message,
        url: error.config?.url,
        method: error.config?.method,
      });

      // Manejar errores de autenticación
      if (error.response?.status === 401) {
        // Token expirado o inválido - limpiar storage y redirigir al login
        localStorage.removeItem('parking_auth_token');
        localStorage.removeItem('parking_auth_user');
        
        // Solo redirigir si no estamos ya en login
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }

      // Manejar errores de autorización
      if (error.response?.status === 403) {
        console.warn('🚫 Access denied - insufficient permissions');
      }

      // Formatear error para consistencia
      const apiError = {
        message: error.response?.data?.message || error.message || 'Error desconocido',
        status: error.response?.status || 0,
        timestamp: error.response?.data?.timestamp || new Date().toISOString(),
        originalError: error,
      };

      return Promise.reject(apiError);
    }
  );

  return client;
};

// ==========================================
// INSTANCIA PRINCIPAL DEL CLIENTE HTTP
// ==========================================
export const apiClient = createApiClient();

// ==========================================
// TIPOS PARA RESPUESTAS DE API
// ==========================================
export interface ApiResponse<T = unknown> {
  data: T;
  message?: string;
  status: number;
  timestamp?: string;
}

export interface ApiError {
  message: string;
  status: number;
  timestamp: string;
  originalError: Error;
}

export interface PaginatedResponse<T> {
  content: T[];
  page: {
    total_elements: number;
    total_pages: number;
    current_page: number;
    page_size: number;
  };
}

// ==========================================
// UTILIDADES HTTP
// ==========================================
export class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = apiClient;
  }

  // GET request
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  // POST request
  async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  // PUT request
  async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  // DELETE request
  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }

  // PATCH request
  async patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.patch<T>(url, data, config);
    return response.data;
  }

  // Método para actualizar token
  setAuthToken(token: string): void {
    this.client.defaults.headers.Authorization = `Bearer ${token}`;
    localStorage.setItem('parking_auth_token', token);
  }

  // Método para limpiar token
  clearAuthToken(): void {
    delete this.client.defaults.headers.Authorization;
    localStorage.removeItem('parking_auth_token');
  }
}

// ==========================================
// EXPORTAR INSTANCIA SINGLETON
// ==========================================
export const apiService = new ApiService();
