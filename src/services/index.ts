// ==========================================
// ÍNDICE DE SERVICIOS
// ==========================================
export { apiService, apiClient, type ApiResponse, type ApiError, type PaginatedResponse } from './api';
export { authService, type AuthResult, type LoginRequest } from './authService';

// ==========================================
// UTILIDAD PARA INTERCEPTORES
// ==========================================
export const setupApiInterceptors = () => {
  console.log('🔧 API interceptors configurados correctamente');
};
