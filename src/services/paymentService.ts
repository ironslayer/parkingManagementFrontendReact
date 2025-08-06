// ==========================================
// SERVICIO DE PAGOS - INTEGRACIÓN BACKEND
// ==========================================
import { apiService } from './api';
import { API_CONFIG } from '../constants';

// ==========================================
// TIPOS PARA RESPUESTAS DE API DE PAGOS
// ==========================================
export interface PaymentCalculationRequest {
  parkingSessionId: number;
}

export interface PaymentCalculationResponse {
  sessionId: number;
  vehicleId: number;
  entryTime: string;
  currentTime: string;
  duration: string;
  hourlyRate: number;
  calculatedAmount: number;
  vehicleType: string;
}

export interface ProcessPaymentRequest {
  parkingSessionId: number;
  paymentMethod: 'CASH' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'TRANSFER';
}

export interface ProcessPaymentResponse {
  id: number;
  parkingSessionId: number;
  totalAmount: number;
  paymentMethod: string;
  paymentDate: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
}

export interface PaymentDetailsResponse {
  id: number;
  parkingSessionId: number;
  totalAmount: number;
  paymentMethod: string;
  paymentDate: string;
  status: string;
  createdAt: string;
  updatedAt?: string;
}

// ==========================================
// TIPOS PARA FRONTEND (MAPEADOS)
// ==========================================
export interface PaymentCalculationFrontend {
  sessionId: string;
  vehicleId: string;
  entryTime: string;
  currentTime: string;
  duration: string;
  hourlyRate: number;
  calculatedAmount: number;
  vehicleType: 'CAR' | 'MOTORCYCLE' | 'TRUCK';
}

export interface PaymentFrontend {
  id: string;
  sessionId: string;
  totalAmount: number;
  paymentMethod: string;
  paymentDate: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  createdAt: string;
  updatedAt?: string;
}

// ==========================================
// SERVICIO DE PAGOS
// ==========================================
export class PaymentService {
  
  // ==========================================
  // MAPEO DE DATOS BACKEND ↔ FRONTEND
  // ==========================================
  
  /**
   * Convierte cálculo del backend a modelo del frontend
   */
  private mapCalculationToFrontend(apiCalc: PaymentCalculationResponse): PaymentCalculationFrontend {
    return {
      sessionId: apiCalc.sessionId.toString(),
      vehicleId: apiCalc.vehicleId.toString(),
      entryTime: apiCalc.entryTime,
      currentTime: apiCalc.currentTime,
      duration: apiCalc.duration,
      hourlyRate: apiCalc.hourlyRate,
      calculatedAmount: apiCalc.calculatedAmount,
      vehicleType: this.mapVehicleType(apiCalc.vehicleType),
    };
  }

  /**
   * Convierte pago del backend a modelo del frontend
   */
  private mapPaymentToFrontend(apiPayment: PaymentDetailsResponse): PaymentFrontend {
    return {
      id: apiPayment.id.toString(),
      sessionId: apiPayment.parkingSessionId.toString(),
      totalAmount: apiPayment.totalAmount,
      paymentMethod: apiPayment.paymentMethod,
      paymentDate: apiPayment.paymentDate,
      status: apiPayment.status as PaymentFrontend['status'],
      createdAt: apiPayment.createdAt,
      updatedAt: apiPayment.updatedAt,
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
  // OPERACIONES DE PAGOS
  // ==========================================

  /**
   * Calcular monto a pagar para una sesión
   */
  async calculatePayment(sessionId: string): Promise<PaymentCalculationFrontend> {
    try {
      console.log('💳 Calculando monto a pagar...', { sessionId });

      const apiRequest: PaymentCalculationRequest = {
        parkingSessionId: parseInt(sessionId)
      };

      console.log('📤 Request a API (CALCULATE):', apiRequest);

      const apiResponse = await apiService.post<PaymentCalculationResponse>(
        API_CONFIG.ENDPOINTS.PAYMENTS.CALCULATE,
        apiRequest
      );

      const calculation = this.mapCalculationToFrontend(apiResponse);
      
      console.log('✅ Cálculo realizado exitosamente:', calculation.calculatedAmount);
      return calculation;
      
    } catch (error) {
      console.error('❌ Error calculando pago:', error);
      throw new Error('No se pudo calcular el monto a pagar');
    }
  }

  /**
   * Procesar pago para una sesión
   */
  async processPayment(
    sessionId: string, 
    paymentMethod: ProcessPaymentRequest['paymentMethod']
  ): Promise<PaymentFrontend> {
    try {
      console.log('💳 Procesando pago...', { sessionId, paymentMethod });

      const apiRequest: ProcessPaymentRequest = {
        parkingSessionId: parseInt(sessionId),
        paymentMethod
      };

      console.log('📤 Request a API (PROCESS):', apiRequest);

      const apiResponse = await apiService.post<ProcessPaymentResponse>(
        API_CONFIG.ENDPOINTS.PAYMENTS.PROCESS,
        apiRequest
      );

      const payment: PaymentFrontend = {
        id: apiResponse.id.toString(),
        sessionId: apiResponse.parkingSessionId.toString(),
        totalAmount: apiResponse.totalAmount,
        paymentMethod: apiResponse.paymentMethod,
        paymentDate: apiResponse.paymentDate,
        status: apiResponse.status,
        createdAt: apiResponse.paymentDate,
      };
      
      console.log('✅ Pago procesado exitosamente:', payment.id);
      return payment;
      
    } catch (error) {
      console.error('❌ Error procesando pago:', error);
      throw new Error('No se pudo procesar el pago');
    }
  }

  /**
   * Obtener detalles de un pago por ID
   */
  async getPaymentById(paymentId: string): Promise<PaymentFrontend | null> {
    try {
      console.log(`💳 Obteniendo pago ${paymentId}...`);
      
      const apiPayment = await apiService.get<PaymentDetailsResponse>(
        API_CONFIG.ENDPOINTS.PAYMENTS.BY_ID(paymentId)
      );

      const payment = this.mapPaymentToFrontend(apiPayment);
      
      console.log(`✅ Pago ${paymentId} obtenido`);
      return payment;
      
    } catch (error) {
      if (error && typeof error === 'object' && 'status' in error && error.status === 404) {
        console.log(`ℹ️ No se encontró pago: ${paymentId}`);
        return null;
      }
      
      console.error(`❌ Error obteniendo pago ${paymentId}:`, error);
      throw new Error('Error obteniendo detalles del pago');
    }
  }

  /**
   * Obtener pago por ID de sesión
   */
  async getPaymentBySessionId(sessionId: string): Promise<PaymentFrontend | null> {
    try {
      console.log(`💳 Obteniendo pago por sesión ${sessionId}...`);
      
      const apiPayment = await apiService.get<PaymentDetailsResponse>(
        API_CONFIG.ENDPOINTS.PAYMENTS.BY_SESSION(sessionId)
      );

      const payment = this.mapPaymentToFrontend(apiPayment);
      
      console.log(`✅ Pago por sesión ${sessionId} obtenido`);
      return payment;
      
    } catch (error) {
      if (error && typeof error === 'object' && 'status' in error && error.status === 404) {
        console.log(`ℹ️ No se encontró pago para sesión: ${sessionId}`);
        return null;
      }
      
      console.error(`❌ Error obteniendo pago por sesión ${sessionId}:`, error);
      throw new Error('Error obteniendo pago por sesión');
    }
  }

  /**
   * Cancelar pago pendiente
   */
  async cancelPayment(paymentId: string): Promise<void> {
    try {
      console.log(`💳 Cancelando pago ${paymentId}...`);

      await apiService.put(
        API_CONFIG.ENDPOINTS.PAYMENTS.CANCEL(paymentId),
        {}
      );
      
      console.log(`✅ Pago ${paymentId} cancelado exitosamente`);
      
    } catch (error) {
      console.error(`❌ Error cancelando pago ${paymentId}:`, error);
      throw new Error('No se pudo cancelar el pago');
    }
  }

  /**
   * Validar si una sesión ya tiene pago procesado
   */
  async hasPayment(sessionId: string): Promise<boolean> {
    try {
      const payment = await this.getPaymentBySessionId(sessionId);
      return payment !== null && payment.status === 'COMPLETED';
    } catch (error) {
      console.error('Error validando pago:', error);
      return false;
    }
  }
}

// ==========================================
// EXPORTAR INSTANCIA SINGLETON
// ==========================================
export const paymentService = new PaymentService();
