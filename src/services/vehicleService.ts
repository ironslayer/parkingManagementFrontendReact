// ==========================================
// SERVICIO DE VEHÍCULOS - INTEGRACIÓN BACKEND
// ==========================================
import { apiService } from './api';
import { API_CONFIG } from '../constants';
import type { Vehicle, CreateVehicleRequest, UpdateVehicleRequest, VehicleType } from '../types';

// ==========================================
// TIPOS PARA RESPUESTAS DE API
// ==========================================

export interface VehicleApiResponse {
  id: number;
  licensePlate: string;
  vehicleTypeId: number;  // Solo ID, no objeto completo
  brand: string;
  model: string;
  color: string;
  ownerName?: string;     // Ahora soportado por el backend
  ownerPhone?: string;    // Ahora soportado por el backend
  ownerId?: number;
  isActive?: boolean;     // Incluido en respuesta
  createdAt: string;
  updatedAt?: string;
}

export interface CreateVehicleApiRequest {
  licensePlate: string;
  vehicleTypeId: number;
  brand?: string;         // Opcionales según documentación
  model?: string;         // Opcionales según documentación
  color?: string;         // Opcionales según documentación
  ownerName?: string;     // Soportado por backend
  ownerPhone?: string;    // Soportado por backend
}

export interface UpdateVehicleApiRequest {
  brand?: string;
  model?: string;
  color?: string;
  vehicleTypeId?: number;
  ownerName?: string;     // Soportado por backend para actualizaciones
  ownerPhone?: string;    // Soportado por backend para actualizaciones
}

export interface VehicleTypeResponse {
  id: number;
  name: string;
  description: string;
  createdAt: string;
}

// ==========================================
// SERVICIO DE VEHÍCULOS
// ==========================================
export class VehicleService {
  
  // ==========================================
  // MAPEO DE DATOS BACKEND ↔ FRONTEND
  // ==========================================
  
  /**
   * Mapea ID de tipo de vehículo del backend al nombre para la UI
   */
  private mapVehicleTypeIdToName(vehicleTypeId: number): VehicleType {
    const typeMap: Record<number, VehicleType> = {
      1: 'AUTO',        // AUTO (según documentación)
      2: 'MOTOCICLETA', // MOTOCICLETA (según documentación)
    };
    return typeMap[vehicleTypeId] || 'AUTO'; // Por defecto AUTO
  }

  /**
   * Convierte respuesta del backend a modelo del frontend
   */
  private mapToFrontendVehicle(apiVehicle: VehicleApiResponse): Vehicle {
    return {
      id: apiVehicle.id.toString(),
      licensePlate: apiVehicle.licensePlate,
      vehicleTypeId: apiVehicle.vehicleTypeId,
      vehicleType: this.mapVehicleTypeIdToName(apiVehicle.vehicleTypeId),
      brand: apiVehicle.brand || '',
      model: apiVehicle.model || '',
      color: apiVehicle.color || '',
      ownerName: apiVehicle.ownerName || '',     // Del backend
      ownerPhone: apiVehicle.ownerPhone || '',   // Del backend
      isActive: apiVehicle.isActive ?? true,
      createdAt: apiVehicle.createdAt,
      updatedAt: apiVehicle.updatedAt || apiVehicle.createdAt,
    };
  }

  // ==========================================
  // OPERACIONES CRUD
  // ==========================================

  /**
   * Obtener todos los vehículos del usuario autenticado
   */
  async getVehicles(): Promise<Vehicle[]> {
    try {
      console.log('🚗 Obteniendo vehículos del backend...');
      
      const apiVehicles = await apiService.get<VehicleApiResponse[]>(
        API_CONFIG.ENDPOINTS.VEHICLES.BASE
      );

      const vehicles = apiVehicles.map(vehicle => this.mapToFrontendVehicle(vehicle));
      
      console.log(`✅ ${vehicles.length} vehículos obtenidos del backend`);
      return vehicles;
      
    } catch (error) {
      console.error('❌ Error obteniendo vehículos:', error);
      throw new Error('No se pudieron cargar los vehículos');
    }
  }

  /**
   * Obtener vehículo por ID
   */
  async getVehicleById(id: string): Promise<Vehicle | null> {
    try {
      console.log(`🚗 Obteniendo vehículo ${id} del backend...`);
      
      const apiVehicle = await apiService.get<VehicleApiResponse>(
        API_CONFIG.ENDPOINTS.VEHICLES.BY_ID(id)
      );

      const vehicle = this.mapToFrontendVehicle(apiVehicle);
      
      console.log(`✅ Vehículo ${id} obtenido del backend`);
      return vehicle;
      
    } catch (error) {
      console.error(`❌ Error obteniendo vehículo ${id}:`, error);
      return null;
    }
  }

  /**
   * Buscar vehículo por placa (OPTIMIZADO - usa endpoint específico)
   */
  async getVehicleByPlate(licensePlate: string): Promise<Vehicle | null> {
    try {
      console.log(`🔍 Buscando vehículo con placa ${licensePlate} (optimizado)...`);
      
      // Usar el endpoint específico para búsqueda por placa
      const apiVehicle = await apiService.get<VehicleApiResponse>(
        `${API_CONFIG.ENDPOINTS.VEHICLES.SEARCH}?licensePlate=${encodeURIComponent(licensePlate)}`
      );

      if (apiVehicle) {
        const vehicle = this.mapToFrontendVehicle(apiVehicle);
        console.log(`✅ Vehículo encontrado: ${licensePlate}`);
        return vehicle;
      } else {
        console.log(`ℹ️ No se encontró vehículo con placa: ${licensePlate}`);
        return null;
      }
      
    } catch (error) {
      if (error && typeof error === 'object' && 'status' in error && error.status === 404) {
        console.log(`ℹ️ No se encontró vehículo con placa: ${licensePlate}`);
        return null;
      }
      
      console.error(`❌ Error buscando vehículo por placa ${licensePlate}:`, error);
      
      // Fallback: usar el método alternativo si el nuevo endpoint falla
      console.log('🔄 Usando método de búsqueda alternativo...');
      return await this.getVehicleByPlateAlternative(licensePlate);
    }
  }

  /**
   * Método de búsqueda alternativo usando path parameter
   */
  private async getVehicleByPlateAlternative(licensePlate: string): Promise<Vehicle | null> {
    try {
      console.log(`🔍 Búsqueda alternativa: ${licensePlate}`);
      
      // Usar el endpoint alternativo con path parameter
      const apiVehicle = await apiService.get<VehicleApiResponse>(
        API_CONFIG.ENDPOINTS.VEHICLES.BY_PLATE(licensePlate)
      );

      if (apiVehicle) {
        const vehicle = this.mapToFrontendVehicle(apiVehicle);
        console.log(`✅ Vehículo encontrado (alternativo): ${licensePlate}`);
        return vehicle;
      } else {
        console.log(`ℹ️ No se encontró vehículo (alternativo): ${licensePlate}`);
        return null;
      }
      
    } catch (error) {
      if (error && typeof error === 'object' && 'status' in error && error.status === 404) {
        console.log(`ℹ️ No se encontró vehículo (alternativo): ${licensePlate}`);
        return null;
      }
      
      console.error(`❌ Error en búsqueda alternativa:`, error);
      
      // Último recurso: usar el método de obtener todos y filtrar
      return await this.getVehicleByPlateOldMethod(licensePlate);
    }
  }

  /**
   * Método de búsqueda anterior (fallback)
   */
  private async getVehicleByPlateOldMethod(licensePlate: string): Promise<Vehicle | null> {
    try {
      // Obtener todos los vehículos y filtrar por placa
      const vehicles = await this.getVehicles();
      const vehicle = vehicles.find(v => 
        v.licensePlate.toLowerCase() === licensePlate.toLowerCase()
      );

      return vehicle || null;
    } catch (error) {
      console.error(`❌ Error en búsqueda alternativa:`, error);
      return null;
    }
  }

  /**
   * Crear nuevo vehículo
   */
  async createVehicle(vehicleData: CreateVehicleRequest): Promise<Vehicle> {
    try {
      console.log('🚗 Creando vehículo en backend...', vehicleData);

      const apiRequest: CreateVehicleApiRequest = {
        licensePlate: vehicleData.licensePlate,
        vehicleTypeId: vehicleData.vehicleTypeId,
      };

      // Agregar campos opcionales solo si están presentes
      if (vehicleData.brand) apiRequest.brand = vehicleData.brand;
      if (vehicleData.model) apiRequest.model = vehicleData.model;
      if (vehicleData.color) apiRequest.color = vehicleData.color;
      if (vehicleData.ownerName) apiRequest.ownerName = vehicleData.ownerName;
      if (vehicleData.ownerPhone) apiRequest.ownerPhone = vehicleData.ownerPhone;

      console.log('📤 Request a API:', apiRequest);

      const apiVehicle = await apiService.post<VehicleApiResponse>(
        API_CONFIG.ENDPOINTS.VEHICLES.BASE,
        apiRequest
      );

      const vehicle = this.mapToFrontendVehicle(apiVehicle);
      
      console.log('✅ Vehículo creado exitosamente:', vehicle.licensePlate);
      return vehicle;
      
    } catch (error) {
      console.error('❌ Error creando vehículo:', error);
      throw new Error('No se pudo crear el vehículo');
    }
  }

  /**
   * Actualizar vehículo existente
   */
  async updateVehicle(vehicleData: UpdateVehicleRequest): Promise<Vehicle> {
    try {
      console.log(`🚗 Actualizando vehículo ${vehicleData.id} en backend...`);

      const apiRequest: UpdateVehicleApiRequest = {};

      // Solo incluir campos que se están actualizando
      if (vehicleData.brand) {
        apiRequest.brand = vehicleData.brand;
      }
      if (vehicleData.model) {
        apiRequest.model = vehicleData.model;
      }
      if (vehicleData.color) {
        apiRequest.color = vehicleData.color;
      }
      if (vehicleData.ownerName) {
        apiRequest.ownerName = vehicleData.ownerName;
      }
      if (vehicleData.ownerPhone) {
        apiRequest.ownerPhone = vehicleData.ownerPhone;
      }

      // Si se cambió el tipo de vehículo, incluirlo
      if (vehicleData.vehicleTypeId) {
        apiRequest.vehicleTypeId = vehicleData.vehicleTypeId;
      }

      console.log('📤 Request a API (PATCH):', apiRequest);

      // PATCH devuelve 204 No Content, necesitamos hacer GET después
      await apiService.patch(
        API_CONFIG.ENDPOINTS.VEHICLES.BY_ID(vehicleData.id),
        apiRequest
      );

      console.log('✅ Vehículo actualizado en backend, obteniendo datos actualizados...');

      // Obtener el vehículo actualizado con GET
      const apiVehicle = await apiService.get<VehicleApiResponse>(
        API_CONFIG.ENDPOINTS.VEHICLES.BY_ID(vehicleData.id)
      );

      const vehicle = this.mapToFrontendVehicle(apiVehicle);
      
      console.log('✅ Vehículo actualizado exitosamente:', vehicle.licensePlate);
      return vehicle;
      
    } catch (error) {
      console.error(`❌ Error actualizando vehículo ${vehicleData.id}:`, error);
      throw new Error('No se pudo actualizar el vehículo');
    }
  }

  /**
   * Cambiar estado del vehículo (activar/desactivar)
   * Solo ADMIN puede realizar esta operación según la documentación
   */
  async changeVehicleStatus(id: string, isActive: boolean): Promise<void> {
    try {
      console.log(`🚗 Cambiando estado del vehículo ${id} a ${isActive ? 'activo' : 'inactivo'}...`);

      await apiService.patch(
        API_CONFIG.ENDPOINTS.VEHICLES.BY_ID(id) + '/status',
        { isActive }
      );
      
      console.log(`✅ Estado del vehículo ${id} cambiado exitosamente a ${isActive ? 'activo' : 'inactivo'}`);
      
    } catch (error) {
      console.error(`❌ Error cambiando estado del vehículo ${id}:`, error);
      throw new Error(`No se pudo ${isActive ? 'activar' : 'desactivar'} el vehículo`);
    }
  }

  /**
   * @deprecated Usar changeVehicleStatus() en su lugar
   * El endpoint DELETE fue removido del backend
   */
  async deleteVehicle(id: string): Promise<void> {
    console.warn('⚠️ deleteVehicle() está deprecado. Usar changeVehicleStatus(id, false) en su lugar');
    return this.changeVehicleStatus(id, false);
  }

  /**
   * Obtener tipos de vehículos disponibles
   */
  async getVehicleTypes(): Promise<VehicleTypeResponse[]> {
    try {
      console.log('📋 Obteniendo tipos de vehículos del backend...');
      
      const vehicleTypes = await apiService.get<VehicleTypeResponse[]>(
        '/vehicle-types' // Endpoint de configuración
      );
      
      console.log(`✅ ${vehicleTypes.length} tipos de vehículos obtenidos`);
      return vehicleTypes;
      
    } catch (error) {
      console.error('❌ Error obteniendo tipos de vehículos:', error);
      // Fallback con tipos por defecto
      return [
        { id: 1, name: 'AUTO', description: 'Automóvil estándar', createdAt: new Date().toISOString() },
        { id: 2, name: 'MOTOCICLETA', description: 'Motocicleta o ciclomotor', createdAt: new Date().toISOString() }
      ];
    }
  }
}

// ==========================================
// EXPORTAR INSTANCIA SINGLETON
// ==========================================
export const vehicleService = new VehicleService();
