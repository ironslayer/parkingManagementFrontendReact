import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import type { PaymentMethod } from '../types'

// ==========================================
// TIPOS DE PAYMENT
// ==========================================
export interface Payment {
  id: string
  sessionId: string
  amount: number
  method: PaymentMethod
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED'
  transactionId?: string
  notes?: string
  processedAt?: string
  refundedAt?: string
  createdAt: string
  updatedAt: string
}

export interface PaymentSummary {
  totalAmount: number
  totalPayments: number
  byMethod: Record<PaymentMethod, number>
  byStatus: Record<Payment['status'], number>
  todayTotal: number
  weekTotal: number
  monthTotal: number
}

interface CreatePaymentRequest {
  sessionId: string
  amount: number
  method: PaymentMethod
  notes?: string
}

interface ProcessPaymentRequest {
  paymentId: string
  transactionId?: string
  notes?: string
}

interface RefundPaymentRequest {
  paymentId: string
  reason: string
  amount?: number // Para reembolsos parciales
}

// ==========================================
// REPOSITORY PATTERN FOR PAYMENTS
// ==========================================
class PaymentRepository {
  async create(request: CreatePaymentRequest): Promise<Payment> {
    // Simular creación en backend
    return new Promise((resolve) => {
      setTimeout(() => {
        const payment: Payment = {
          id: `payment_${Date.now()}`,
          sessionId: request.sessionId,
          amount: request.amount,
          method: request.method,
          status: 'COMPLETED', // Auto-completado para efectivo
          notes: request.notes,
          processedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }

        // Simular diferentes comportamientos según método
        if (request.method === 'CARD') {
          payment.transactionId = `tx_${Math.random().toString(36).substr(2, 9)}`
        } else if (request.method === 'TRANSFER') {
          payment.transactionId = `tf_${Math.random().toString(36).substr(2, 9)}`
        }

        resolve(payment)
      }, 1000)
    })
  }

  async process(request: ProcessPaymentRequest): Promise<Payment> {
    // Simular procesamiento de pago
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simular 5% de fallos
        if (Math.random() < 0.05) {
          reject(new Error('Error procesando el pago. Intente nuevamente.'))
          return
        }

        const payment: Payment = {
          id: request.paymentId,
          sessionId: 'session_123', // Valor simulado
          amount: 50, // Valor simulado
          method: 'CARD',
          status: 'COMPLETED',
          transactionId: request.transactionId,
          notes: request.notes,
          processedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }

        resolve(payment)
      }, 2000)
    })
  }

  async refund(request: RefundPaymentRequest): Promise<Payment> {
    // Simular reembolso
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (Math.random() < 0.1) {
          reject(new Error('Error procesando el reembolso.'))
          return
        }

        const payment: Payment = {
          id: request.paymentId,
          sessionId: 'session_123',
          amount: 50,
          method: 'CARD',
          status: 'REFUNDED',
          notes: `Reembolso: ${request.reason}`,
          refundedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }

        resolve(payment)
      }, 1500)
    })
  }

  async getPayments(): Promise<Payment[]> {
    // Simular obtención de pagos
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockPayments: Payment[] = [
          {
            id: 'payment_1',
            sessionId: 'session_1',
            amount: 25.50,
            method: 'CASH',
            status: 'COMPLETED',
            processedAt: new Date(Date.now() - 3600000).toISOString(),
            createdAt: new Date(Date.now() - 3600000).toISOString(),
            updatedAt: new Date(Date.now() - 3600000).toISOString()
          },
          {
            id: 'payment_2',
            sessionId: 'session_2',
            amount: 45.00,
            method: 'CARD',
            status: 'COMPLETED',
            transactionId: 'tx_abc123',
            processedAt: new Date(Date.now() - 7200000).toISOString(),
            createdAt: new Date(Date.now() - 7200000).toISOString(),
            updatedAt: new Date(Date.now() - 7200000).toISOString()
          }
        ]
        resolve(mockPayments)
      }, 500)
    })
  }

  async getPaymentSummary(): Promise<PaymentSummary> {
    // Simular obtención de resumen
    return new Promise((resolve) => {
      setTimeout(() => {
        const summary: PaymentSummary = {
          totalAmount: 1250.75,
          totalPayments: 15,
          byMethod: {
            CASH: 8,
            CARD: 5,
            TRANSFER: 2
          },
          byStatus: {
            PENDING: 1,
            COMPLETED: 13,
            FAILED: 1,
            REFUNDED: 0
          },
          todayTotal: 245.50,
          weekTotal: 890.25,
          monthTotal: 1250.75
        }
        resolve(summary)
      }, 300)
    })
  }
}

// ==========================================
// PAYMENT STORE STATE
// ==========================================
interface PaymentStoreState {
  // Data
  payments: Payment[]
  paymentSummary: PaymentSummary | null
  
  // UI State
  isLoading: boolean
  isProcessing: boolean
  error: string | null
  
  // Repository
  repository: PaymentRepository
  
  // Actions
  createPayment: (request: CreatePaymentRequest) => Promise<Payment>
  processPayment: (request: ProcessPaymentRequest) => Promise<Payment>
  refundPayment: (request: RefundPaymentRequest) => Promise<Payment>
  fetchPayments: () => Promise<void>
  fetchPaymentSummary: () => Promise<void>
  clearError: () => void
  reset: () => void
}

// ==========================================
// INITIAL STATE
// ==========================================
const initialState = {
  payments: [],
  paymentSummary: null,
  isLoading: false,
  isProcessing: false,
  error: null,
  repository: new PaymentRepository()
}

// ==========================================
// PAYMENT STORE
// ==========================================
export const usePaymentStore = create<PaymentStoreState>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        createPayment: async (request: CreatePaymentRequest) => {
          const { repository } = get()
          
          set({ isProcessing: true, error: null })
          
          try {
            const payment = await repository.create(request)
            
            set(state => ({
              payments: [payment, ...state.payments],
              isProcessing: false
            }))
            
            // Actualizar resumen después de crear pago
            get().fetchPaymentSummary()
            
            return payment
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error creando el pago'
            set({ 
              error: errorMessage,
              isProcessing: false 
            })
            throw error
          }
        },

        processPayment: async (request: ProcessPaymentRequest) => {
          const { repository } = get()
          
          set({ isProcessing: true, error: null })
          
          try {
            const payment = await repository.process(request)
            
            set(state => ({
              payments: state.payments.map(p => 
                p.id === payment.id ? payment : p
              ),
              isProcessing: false
            }))
            
            get().fetchPaymentSummary()
            
            return payment
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error procesando el pago'
            set({ 
              error: errorMessage,
              isProcessing: false 
            })
            throw error
          }
        },

        refundPayment: async (request: RefundPaymentRequest) => {
          const { repository } = get()
          
          set({ isProcessing: true, error: null })
          
          try {
            const payment = await repository.refund(request)
            
            set(state => ({
              payments: state.payments.map(p => 
                p.id === payment.id ? payment : p
              ),
              isProcessing: false
            }))
            
            get().fetchPaymentSummary()
            
            return payment
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error procesando el reembolso'
            set({ 
              error: errorMessage,
              isProcessing: false 
            })
            throw error
          }
        },

        fetchPayments: async () => {
          const { repository } = get()
          
          set({ isLoading: true, error: null })
          
          try {
            const payments = await repository.getPayments()
            set({ 
              payments,
              isLoading: false 
            })
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error cargando pagos'
            set({ 
              error: errorMessage,
              isLoading: false 
            })
          }
        },

        fetchPaymentSummary: async () => {
          const { repository } = get()
          
          try {
            const paymentSummary = await repository.getPaymentSummary()
            set({ paymentSummary })
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error cargando resumen de pagos'
            set({ error: errorMessage })
          }
        },

        clearError: () => {
          set({ error: null })
        },

        reset: () => {
          set(initialState)
        }
      }),
      {
        name: 'payment-store',
        partialize: (state) => ({
          payments: state.payments,
          paymentSummary: state.paymentSummary
        })
      }
    ),
    { name: 'PaymentStore' }
  )
)

export default usePaymentStore
