// ==========================================
// SERVICIO DE ESPACIOS DE PARQUEO - INTEGRACIÓN BACKEND
// ==========================================
import { apiService } from './api';
import { API_CONFIG } from '../constants';

// ==========================================
// TIPOS PARA RESPUESTAS DE ESPACIOS DE PARQUEO
// ==========================================
export interface ParkingSpaceResponse {
  id: number;
  spaceNumber: string;
  isOccupied: boolean;
  vehicleTypeId: number;
  vehicleType: {
    name: string;
  };
  isActive?: boolean;
  currentSession?: {
    ticketCode: string;
    entryTime: string;
  };
}

export interface ParkingSpaceStatusResponse {
  id: number;
  spaceNumber: string;
  vehicleTypeId: number;
  isOccupied: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  occupiedByVehiclePlate: string | null;
  occupiedAt: string | null;
  isAvailable: boolean;
}

export interface AvailableSpacesResponse {
  availableSpaces: ParkingSpaceResponse[];
  totalCount: number;
  vehicleTypeFilter?: number;
}

export interface OccupySpaceRequest {
  vehiclePlate: string;
}

// ==========================================
// SERVICIO DE ESPACIOS DE PARQUEO
// ==========================================
export class ParkingSpaceService {
  
  /**
   * Obtener todos los espacios de parqueo
   */
  async getParkingSpaces(): Promise<ParkingSpaceResponse[]> {
    try {
      console.log('🅿️ Obteniendo espacios de parqueo...');
      
      const spaces = await apiService.get<ParkingSpaceResponse[]>(
        API_CONFIG.ENDPOINTS.PARKING_SPACES.BASE
      );
      
      console.log(`✅ ${spaces.length} espacios de parqueo obtenidos`);
      return spaces;
      
    } catch (error) {
      console.error('❌ Error obteniendo espacios de parqueo:', error);
      throw new Error('No se pudieron cargar los espacios de parqueo');
    }
  }

  /**
   * Obtener espacios disponibles, opcionalmente filtrados por tipo de vehículo
   */
  async getAvailableSpaces(vehicleTypeId?: number): Promise<AvailableSpacesResponse> {
    try {
      console.log('🅿️ Obteniendo espacios disponibles...', { vehicleTypeId });
      
      const params = new URLSearchParams();
      if (vehicleTypeId) {
        params.append('vehicleTypeId', vehicleTypeId.toString());
      }
      
      const url = params.toString() 
        ? `${API_CONFIG.ENDPOINTS.PARKING_SPACES.AVAILABLE}?${params}`
        : API_CONFIG.ENDPOINTS.PARKING_SPACES.AVAILABLE;
      
      const availableSpaces = await apiService.get<AvailableSpacesResponse>(url);
      
      console.log(`✅ ${availableSpaces.totalCount} espacios disponibles obtenidos`);
      return availableSpaces;
      
    } catch (error) {
      console.error('❌ Error obteniendo espacios disponibles:', error);
      throw new Error('No se pudieron cargar los espacios disponibles');
    }
  }

  /**
   * Obtener estado en tiempo real de todos los espacios de parqueo
   */
  async getParkingSpacesStatus(): Promise<ParkingSpaceStatusResponse[]> {
    try {
      console.log('🅿️ Obteniendo estado en tiempo real de espacios...');
      
      const status = await apiService.get<ParkingSpaceStatusResponse[]>(
        API_CONFIG.ENDPOINTS.PARKING_SPACES.STATUS
      );
      
      console.log(`✅ Estado de ${status.length} espacios obtenido`);
      return status;
      
    } catch (error) {
      console.error('❌ Error obteniendo estado de espacios:', error);
      throw new Error('No se pudo cargar el estado de los espacios');
    }
  }

  /**
   * Ocupar un espacio de parqueo con un vehículo
   */
  async occupySpace(spaceId: number, vehiclePlate: string): Promise<void> {
    try {
      console.log(`🅿️ Ocupando espacio ${spaceId} con vehículo ${vehiclePlate}...`);
      
      const request: OccupySpaceRequest = {
        vehiclePlate: vehiclePlate
      };
      
      await apiService.post<string>(
        API_CONFIG.ENDPOINTS.PARKING_SPACES.OCCUPY(spaceId.toString()),
        request
      );
      
      console.log(`✅ Espacio ${spaceId} ocupado exitosamente`);
      
    } catch (error) {
      console.error(`❌ Error ocupando espacio ${spaceId}:`, error);
      throw new Error('No se pudo ocupar el espacio de parqueo');
    }
  }

  /**
   * Liberar un espacio de parqueo
   */
  async freeSpace(spaceId: number): Promise<void> {
    try {
      console.log(`🅿️ Liberando espacio ${spaceId}...`);
      
      await apiService.post<string>(
        API_CONFIG.ENDPOINTS.PARKING_SPACES.FREE(spaceId.toString())
      );
      
      console.log(`✅ Espacio ${spaceId} liberado exitosamente`);
      
    } catch (error) {
      console.error(`❌ Error liberando espacio ${spaceId}:`, error);
      throw new Error('No se pudo liberar el espacio de parqueo');
    }
  }
}

// ==========================================
// EXPORTAR INSTANCIA SINGLETON
// ==========================================
export const parkingSpaceService = new ParkingSpaceService();
