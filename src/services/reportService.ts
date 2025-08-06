// ==========================================
// SERVICIO DE REPORTES - INTEGRACIÓN BACKEND
// ==========================================
import { apiService } from './api';
import { API_CONFIG } from '../constants';

// ==========================================
// TIPOS PARA RESPUESTAS DE REPORTES
// ==========================================
export interface OccupancyReportResponse {
  date: string;
  occupancyPercentage: number;
  totalSpaces: number;
  occupiedSpaces: number;
  availableSpaces: number;
  hourlyOccupancy?: Array<{
    hour: string;
    occupiedSpaces: number;
    percentage: number;
  }>;
}

export interface RevenueReportResponse {
  date: string;
  totalRevenue: number;
  totalTransactions: number;
  averageTransaction: number;
  revenueByVehicleType?: Array<{
    vehicleType: string;
    revenue: number;
    transactions: number;
  }>;
  hourlyRevenue?: Array<{
    hour: string;
    revenue: number;
    transactions: number;
  }>;
}

export interface OccupancyRangeReportResponse {
  date: string;
  occupancyPercentage: number;
  totalSpaces: number;
  occupiedSpaces: number;
  availableSpaces: number;
}

export interface RevenueRangeReportResponse {
  date: string;
  totalRevenue: number;
  totalTransactions: number;
  averageTransaction: number;
}

// ==========================================
// SERVICIO DE REPORTES
// ==========================================
export class ReportService {
  
  /**
   * Generar reporte de ocupación para fecha específica
   */
  async getOccupancyReport(date: string): Promise<OccupancyReportResponse> {
    try {
      console.log(`📊 Generando reporte de ocupación para ${date}...`);
      
      const params = new URLSearchParams();
      params.append('date', date);
      
      const report = await apiService.get<OccupancyReportResponse>(
        `${API_CONFIG.ENDPOINTS.REPORTS.OCCUPANCY}?${params}`
      );
      
      console.log(`✅ Reporte de ocupación generado para ${date}`);
      return report;
      
    } catch (error) {
      console.error(`❌ Error generando reporte de ocupación para ${date}:`, error);
      throw new Error('No se pudo generar el reporte de ocupación');
    }
  }

  /**
   * Generar reportes de ocupación para rango de fechas (máximo 90 días)
   */
  async getOccupancyRangeReport(startDate: string, endDate: string): Promise<OccupancyRangeReportResponse[]> {
    try {
      console.log(`📊 Generando reporte de ocupación del ${startDate} al ${endDate}...`);
      
      const params = new URLSearchParams();
      params.append('startDate', startDate);
      params.append('endDate', endDate);
      
      const reports = await apiService.get<OccupancyRangeReportResponse[]>(
        `${API_CONFIG.ENDPOINTS.REPORTS.OCCUPANCY_RANGE}?${params}`
      );
      
      console.log(`✅ Reporte de ocupación generado (${reports.length} días)`);
      return reports;
      
    } catch (error) {
      console.error(`❌ Error generando reporte de ocupación del rango:`, error);
      throw new Error('No se pudo generar el reporte de ocupación para el rango de fechas');
    }
  }

  /**
   * Generar reporte de ingresos para fecha específica
   */
  async getRevenueReport(date: string): Promise<RevenueReportResponse> {
    try {
      console.log(`📊 Generando reporte de ingresos para ${date}...`);
      
      const params = new URLSearchParams();
      params.append('date', date);
      
      const report = await apiService.get<RevenueReportResponse>(
        `${API_CONFIG.ENDPOINTS.REPORTS.REVENUE}?${params}`
      );
      
      console.log(`✅ Reporte de ingresos generado para ${date}`);
      return report;
      
    } catch (error) {
      console.error(`❌ Error generando reporte de ingresos para ${date}:`, error);
      throw new Error('No se pudo generar el reporte de ingresos');
    }
  }

  /**
   * Generar reportes de ingresos para rango de fechas (máximo 90 días)
   */
  async getRevenueRangeReport(startDate: string, endDate: string): Promise<RevenueRangeReportResponse[]> {
    try {
      console.log(`📊 Generando reporte de ingresos del ${startDate} al ${endDate}...`);
      
      const params = new URLSearchParams();
      params.append('startDate', startDate);
      params.append('endDate', endDate);
      
      const reports = await apiService.get<RevenueRangeReportResponse[]>(
        `${API_CONFIG.ENDPOINTS.REPORTS.REVENUE_RANGE}?${params}`
      );
      
      console.log(`✅ Reporte de ingresos generado (${reports.length} días)`);
      return reports;
      
    } catch (error) {
      console.error(`❌ Error generando reporte de ingresos del rango:`, error);
      throw new Error('No se pudo generar el reporte de ingresos para el rango de fechas');
    }
  }

  /**
   * Validar rango de fechas (máximo 90 días)
   */
  validateDateRange(startDate: string, endDate: string): void {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays > 90) {
      throw new Error('El rango de fechas no puede ser mayor a 90 días');
    }
    
    if (start > end) {
      throw new Error('La fecha de inicio no puede ser mayor a la fecha final');
    }
  }

  /**
   * Formatear fecha para la API (YYYY-MM-DD)
   */
  formatDateForApi(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  /**
   * Obtener fecha de hoy formateada
   */
  getTodayFormatted(): string {
    return this.formatDateForApi(new Date());
  }

  /**
   * Obtener fecha de hace N días formateada
   */
  getDaysAgoFormatted(days: number): string {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return this.formatDateForApi(date);
  }
}

// ==========================================
// EXPORTAR INSTANCIA SINGLETON
// ==========================================
export const reportService = new ReportService();
