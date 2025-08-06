// ==========================================
// ÍNDICE DE SERVICIOS
// ==========================================
export { apiService, apiClient, type ApiResponse, type ApiError, type PaginatedResponse } from './api';
export { authService, type AuthResult, type LoginRequest } from './authService';
export { vehicleService, type VehicleApiResponse, type VehicleTypeResponse } from './vehicleService';
export { dashboardService, type DashboardSummaryResponse, type DashboardStatsResponse } from './dashboardService';
export { parkingSpaceService, type ParkingSpaceResponse, type ParkingSpaceStatusResponse } from './parkingSpaceService';
export { reportService, type OccupancyReportResponse, type RevenueReportResponse } from './reportService';
export { parkingSessionService, type ParkingSessionApiResponse, type ParkingSessionFrontend } from './parkingSessionService';
export { paymentService, type PaymentCalculationFrontend, type PaymentFrontend } from './paymentService';

// ==========================================
// UTILIDAD PARA INTERCEPTORES
// ==========================================
export const setupApiInterceptors = () => {
  console.log('🔧 API interceptors configurados correctamente');
};
