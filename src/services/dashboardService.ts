// ==========================================
// SERVICIO DE DASHBOARD - INTEGRACIÓN BACKEND
// ==========================================
import { apiService } from './api';
import { API_CONFIG } from '../constants';

// ==========================================
// TIPOS PARA RESPUESTAS DE DASHBOARD
// ==========================================
export interface DashboardSummaryResponse {
  generatedAt: string;
  totalSpaces: number;
  occupiedSpaces: number;
  availableSpaces: number;
  currentOccupancyPercentage: number;
  occupancyStatus: 'LOW' | 'MEDIUM' | 'HIGH' | 'FULL';
  todayEntries: number;
  todayExits: number;
  totalMovements: number;
  todayRevenue: number;
  todayPayments: number;
  averageStayDuration: number;
  activeSessions: number;
  systemHealthy: boolean;
}

export interface DashboardStatsResponse {
  generatedAt: string;
  totalSpaces: number;
  occupiedSpaces: number;
  availableSpaces: number;
  currentOccupancyPercentage: number;
  occupancyStatus: 'LOW' | 'MEDIUM' | 'HIGH' | 'FULL';
  todayEntries: number;
  todayExits: number;
  totalMovements: number;
  todayRevenue: number;
  todayPayments: number;
  averageStayDuration: number;
  activeSessions: number;
  systemHealthy: boolean;
}

export interface OccupancyHistoryResponse {
  date: string;
  maxOccupancy: number;
  averageOccupancy: number;
  totalSessions: number;
}

export interface RevenueReportResponse {
  startDate: string;
  endDate: string;
  totalRevenue: number;
  totalTransactions: number;
  averageTransaction: number;
  dailyBreakdown: Array<{
    date: string;
    revenue: number;
    transactions: number;
  }>;
}

export interface RecentSessionResponse {
  id: number;
  ticketCode: string;
  vehicle: {
    licensePlate: string;
    vehicleType: string;
  };
  parkingSpace: {
    spaceNumber: string;
  };
  entryTime: string;
  isActive: boolean;
}

// ==========================================
// SERVICIO DE DASHBOARD
// ==========================================
export class DashboardService {
  
  /**
   * Obtener resumen del dashboard con métricas en tiempo real
   */
  async getSummary(): Promise<DashboardSummaryResponse> {
    try {
      console.log('📊 Obteniendo resumen del dashboard...');
      
      const summary = await apiService.get<DashboardSummaryResponse>(
        API_CONFIG.ENDPOINTS.DASHBOARD.SUMMARY
      );
      
      console.log('✅ Resumen del dashboard obtenido');
      return summary;
      
    } catch (error) {
      console.error('❌ Error obteniendo resumen del dashboard:', error);
      throw new Error('No se pudo cargar el resumen del dashboard');
    }
  }

  /**
   * Obtener estadísticas del dashboard con filtros de fecha
   */
  async getStats(filters?: { dateFrom?: string; dateTo?: string }): Promise<DashboardStatsResponse> {
    try {
      console.log('📊 Obteniendo estadísticas del dashboard...', filters);
      
      const params = new URLSearchParams();
      if (filters?.dateFrom) {
        params.append('dateFrom', filters.dateFrom);
      }
      if (filters?.dateTo) {
        params.append('dateTo', filters.dateTo);
      }
      
      const url = params.toString() 
        ? `${API_CONFIG.ENDPOINTS.DASHBOARD.STATS}?${params}`
        : API_CONFIG.ENDPOINTS.DASHBOARD.STATS;
      
      const stats = await apiService.get<DashboardStatsResponse>(url);
      
      console.log('✅ Estadísticas del dashboard obtenidas');
      return stats;
      
    } catch (error) {
      console.error('❌ Error obteniendo estadísticas del dashboard:', error);
      throw new Error('No se pudieron cargar las estadísticas');
    }
  }

  /**
   * Obtener historial de ocupación
   */
  async getOccupancyHistory(days = 7): Promise<OccupancyHistoryResponse[]> {
    try {
      console.log(`📊 Obteniendo historial de ocupación (${days} días)...`);
      
      const params = new URLSearchParams();
      params.append('days', days.toString());
      
      const history = await apiService.get<OccupancyHistoryResponse[]>(
        `${API_CONFIG.ENDPOINTS.DASHBOARD.OCCUPANCY_HISTORY}?${params}`
      );
      
      console.log(`✅ Historial de ocupación obtenido (${history.length} registros)`);
      return history;
      
    } catch (error) {
      console.error('❌ Error obteniendo historial de ocupación:', error);
      throw new Error('No se pudo cargar el historial de ocupación');
    }
  }

  /**
   * Obtener reporte de ingresos
   */
  async getRevenueReport(filters?: { startDate?: string; endDate?: string }): Promise<RevenueReportResponse> {
    try {
      console.log('📊 Obteniendo reporte de ingresos...', filters);
      
      const params = new URLSearchParams();
      if (filters?.startDate) {
        params.append('startDate', filters.startDate);
      }
      if (filters?.endDate) {
        params.append('endDate', filters.endDate);
      }
      
      const url = params.toString() 
        ? `${API_CONFIG.ENDPOINTS.DASHBOARD.REVENUE_REPORT}?${params}`
        : API_CONFIG.ENDPOINTS.DASHBOARD.REVENUE_REPORT;
      
      const report = await apiService.get<RevenueReportResponse>(url);
      
      console.log('✅ Reporte de ingresos obtenido');
      return report;
      
    } catch (error) {
      console.error('❌ Error obteniendo reporte de ingresos:', error);
      throw new Error('No se pudo cargar el reporte de ingresos');
    }
  }

  /**
   * Obtener sesiones recientes
   */
  async getRecentSessions(limit = 10): Promise<RecentSessionResponse[]> {
    try {
      console.log(`📊 Obteniendo sesiones recientes (${limit})...`);
      
      const params = new URLSearchParams();
      params.append('limit', limit.toString());
      
      const sessions = await apiService.get<RecentSessionResponse[]>(
        `${API_CONFIG.ENDPOINTS.DASHBOARD.RECENT_SESSIONS}?${params}`
      );
      
      console.log(`✅ Sesiones recientes obtenidas (${sessions.length} registros)`);
      return sessions;
      
    } catch (error) {
      console.error('❌ Error obteniendo sesiones recientes:', error);
      throw new Error('No se pudieron cargar las sesiones recientes');
    }
  }

  /**
   * Obtener horas más populares
   */
  async getPopularHours(): Promise<Array<{ hour: string; count: number; percentage: number }>> {
    try {
      console.log('📊 Obteniendo horas más populares...');
      
      const popularHours = await apiService.get<Array<{ hour: string; count: number; percentage: number }>>(
        API_CONFIG.ENDPOINTS.DASHBOARD.POPULAR_HOURS
      );
      
      console.log('✅ Horas más populares obtenidas');
      return popularHours;
      
    } catch (error) {
      console.error('❌ Error obteniendo horas populares:', error);
      throw new Error('No se pudieron cargar las horas populares');
    }
  }

  /**
   * Obtener estadísticas por tipo de vehículo
   */
  async getVehicleTypeStats(): Promise<Array<{ 
    vehicleType: string; 
    count: number; 
    percentage: number; 
    revenue: number 
  }>> {
    try {
      console.log('📊 Obteniendo estadísticas por tipo de vehículo...');
      
      const stats = await apiService.get<Array<{ 
        vehicleType: string; 
        count: number; 
        percentage: number; 
        revenue: number 
      }>>(
        API_CONFIG.ENDPOINTS.DASHBOARD.VEHICLE_TYPE_STATS
      );
      
      console.log('✅ Estadísticas por tipo de vehículo obtenidas');
      return stats;
      
    } catch (error) {
      console.error('❌ Error obteniendo estadísticas por tipo de vehículo:', error);
      throw new Error('No se pudieron cargar las estadísticas por tipo de vehículo');
    }
  }
}

// ==========================================
// EXPORTAR INSTANCIA SINGLETON
// ==========================================
export const dashboardService = new DashboardService();
