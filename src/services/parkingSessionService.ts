// ==========================================
// SERVICIO DE SESIONES DE PARQUEO - INTEGRACIÓN BACKEND
// ==========================================
import { apiService } from './api';
import { API_CONFIG } from '../constants';

// ==========================================
// TIPOS PARA RESPUESTAS DE API DE SESIONES
// ==========================================
export interface ParkingSessionApiResponse {
  id: number;
  ticketCode: string;
  vehicleId: number;
  parkingSpaceId: number;
  entryTime: string;
  exitTime?: string;
  isActive: boolean;
  vehicle: {
    licensePlate: string;
    vehicleType: string;
  };
  parkingSpace: {
    id: number;
    spaceNumber: string;
    isOccupied: boolean;
  };
}

export interface StartSessionApiRequest {
  licensePlate: string;
}

export interface EndSessionApiRequest {
  licensePlate: string;
}

export interface EndSessionApiResponse {
  sessionId: number;
  vehicleId: number;
  entryTime: string;
  exitTime: string;
  duration: string;
  calculatedAmount: number;
  parkingSpace: {
    spaceNumber: string;
    isOccupied: boolean;
  };
}

export interface ActiveSessionApiResponse {
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
// TIPOS PARA FRONTEND (HÍBRIDO - COMPATIBILIDAD)
// ==========================================
export interface ParkingSessionFrontend {
  id: string;
  ticketCode: string;
  vehicleId: string;
  parkingSpaceId: string;
  licensePlate: string;
  vehicleType: 'CAR' | 'MOTORCYCLE' | 'TRUCK';
  spaceNumber: string;
  entryTime: string;
  exitTime?: string;
  isActive: boolean;
  duration?: string;
  calculatedAmount?: number;
  
  // Campos legacy para compatibilidad
  vehicle?: {
    licensePlate: string;
    vehicleType: 'CAR' | 'MOTORCYCLE' | 'TRUCK';
    brand?: string;
    model?: string;
  };
  status?: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  parkingSpot?: string;
  rate?: number;
  totalAmount?: number;
}

// ==========================================
// SERVICIO DE SESIONES DE PARQUEO
// ==========================================
export class ParkingSessionService {
  
  // ==========================================
  // MAPEO DE DATOS BACKEND ↔ FRONTEND
  // ==========================================
  
  /**
   * Convierte respuesta del backend a modelo del frontend
   */
  private mapToFrontendSession(apiSession: ParkingSessionApiResponse): ParkingSessionFrontend {
    const frontendVehicleType = this.mapVehicleType(apiSession.vehicle.vehicleType);
    
    return {
      id: apiSession.id.toString(),
      ticketCode: apiSession.ticketCode,
      vehicleId: apiSession.vehicleId.toString(),
      parkingSpaceId: apiSession.parkingSpaceId.toString(),
      licensePlate: apiSession.vehicle.licensePlate,
      vehicleType: frontendVehicleType,
      spaceNumber: apiSession.parkingSpace.spaceNumber,
      entryTime: apiSession.entryTime,
      exitTime: apiSession.exitTime,
      isActive: apiSession.isActive,
      
      // Compatibilidad legacy
      vehicle: {
        licensePlate: apiSession.vehicle.licensePlate,
        vehicleType: frontendVehicleType,
      },
      status: apiSession.isActive ? 'ACTIVE' : 'COMPLETED',
      parkingSpot: apiSession.parkingSpace.spaceNumber,
      rate: 10000, // Valor por defecto - se debe obtener de rate config
      totalAmount: undefined, // Se calcula dinámicamente
    };
  }

  /**
   * Mapea tipos de vehículos del backend al frontend
   */
  private mapVehicleType(backendType: string): 'CAR' | 'MOTORCYCLE' | 'TRUCK' {
    const typeMap: Record<string, 'CAR' | 'MOTORCYCLE' | 'TRUCK'> = {
      'AUTO': 'CAR',
      'MOTOCICLETA': 'MOTORCYCLE', 
      'MOTORCYCLE': 'MOTORCYCLE',
      'CAR': 'CAR',
      'TRUCK': 'TRUCK',
    };
    return typeMap[backendType] || 'CAR';
  }

  // ==========================================
  // OPERACIONES DE SESIONES
  // ==========================================

  /**
   * Iniciar nueva sesión de parqueo
   */
  async startSession(licensePlate: string): Promise<ParkingSessionFrontend> {
    try {
      console.log('🅿️ Iniciando sesión de parqueo...', { licensePlate });

      const apiRequest: StartSessionApiRequest = {
        licensePlate: licensePlate.toUpperCase()
      };

      console.log('📤 Request a API (START):', apiRequest);

      const apiResponse = await apiService.post<ParkingSessionApiResponse>(
        API_CONFIG.ENDPOINTS.SESSIONS.START,
        apiRequest
      );

      const session = this.mapToFrontendSession(apiResponse);
      
      console.log('✅ Sesión iniciada exitosamente:', session.ticketCode);
      return session;
      
    } catch (error) {
      console.error('❌ Error iniciando sesión:', error);
      throw new Error('No se pudo iniciar la sesión de parqueo');
    }
  }

  /**
   * Finalizar sesión de parqueo
   */
  async endSession(licensePlate: string): Promise<EndSessionApiResponse> {
    try {
      console.log('🅿️ Finalizando sesión de parqueo...', { licensePlate });

      const apiRequest: EndSessionApiRequest = {
        licensePlate: licensePlate.toUpperCase()
      };

      console.log('📤 Request a API (END):', apiRequest);

      const apiResponse = await apiService.post<EndSessionApiResponse>(
        API_CONFIG.ENDPOINTS.SESSIONS.END,
        apiRequest
      );
      
      console.log('✅ Sesión finalizada exitosamente:', apiResponse.sessionId);
      return apiResponse;
      
    } catch (error) {
      console.error('❌ Error finalizando sesión:', error);
      throw new Error('No se pudo finalizar la sesión de parqueo');
    }
  }

  /**
   * Obtener sesiones activas
   */
  async getActiveSessions(): Promise<ParkingSessionFrontend[]> {
    try {
      console.log('🅿️ Obteniendo sesiones activas...');
      
      const apiSessions = await apiService.get<ActiveSessionApiResponse[]>(
        API_CONFIG.ENDPOINTS.SESSIONS.ACTIVE
      );

      const sessions = apiSessions.map(session => {
        const frontendVehicleType = this.mapVehicleType(session.vehicle.vehicleType);
        
        return {
          id: session.id.toString(),
          ticketCode: session.ticketCode,
          vehicleId: '0', // No disponible en active sessions
          parkingSpaceId: '0', // No disponible en active sessions
          licensePlate: session.vehicle.licensePlate,
          vehicleType: frontendVehicleType,
          spaceNumber: session.parkingSpace.spaceNumber,
          entryTime: session.entryTime,
          isActive: session.isActive,
          
          // Compatibilidad legacy
          vehicle: {
            licensePlate: session.vehicle.licensePlate,
            vehicleType: frontendVehicleType,
          },
          status: session.isActive ? 'ACTIVE' : 'COMPLETED',
          parkingSpot: session.parkingSpace.spaceNumber,
          rate: 10000, // Valor por defecto
          totalAmount: undefined,
        } as ParkingSessionFrontend;
      });
      
      console.log(`✅ ${sessions.length} sesiones activas obtenidas`);
      return sessions;
      
    } catch (error) {
      console.error('❌ Error obteniendo sesiones activas:', error);
      throw new Error('No se pudieron cargar las sesiones activas');
    }
  }

  /**
   * Obtener sesión por placa de vehículo
   */
  async getSessionByVehiclePlate(licensePlate: string): Promise<ParkingSessionFrontend | null> {
    try {
      console.log(`🅿️ Buscando sesión por placa: ${licensePlate}`);
      
      const apiSession = await apiService.get<ParkingSessionApiResponse>(
        API_CONFIG.ENDPOINTS.SESSIONS.BY_VEHICLE(licensePlate)
      );

      if (apiSession) {
        const session = this.mapToFrontendSession(apiSession);
        console.log(`✅ Sesión encontrada: ${session.ticketCode}`);
        return session;
      } else {
        console.log(`ℹ️ No se encontró sesión activa para: ${licensePlate}`);
        return null;
      }
      
    } catch (error) {
      if (error && typeof error === 'object' && 'status' in error && error.status === 404) {
        console.log(`ℹ️ No se encontró sesión activa para: ${licensePlate}`);
        return null;
      }
      
      console.error(`❌ Error buscando sesión por placa ${licensePlate}:`, error);
      throw new Error('Error buscando sesión de parqueo');
    }
  }

  /**
   * Validar si hay sesión activa para una placa
   */
  async hasActiveSession(licensePlate: string): Promise<boolean> {
    try {
      const session = await this.getSessionByVehiclePlate(licensePlate);
      return session !== null && session.isActive;
    } catch (error) {
      console.error('Error validando sesión activa:', error);
      return false;
    }
  }
}

// ==========================================
// EXPORTAR INSTANCIA SINGLETON
// ==========================================
export const parkingSessionService = new ParkingSessionService();
