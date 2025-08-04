import React, { useEffect } from 'react'
import { DollarSign, TrendingUp, CreditCard, Banknote, Smartphone } from 'lucide-react'
import { usePaymentStore } from '../../store/paymentStore'
import { Card, LoadingSpinner } from '../ui'
import { formatCurrency } from '../../utils'

// ==========================================
// TIPOS DEL COMPONENTE
// ==========================================
interface PaymentStatsProps {
  className?: string
  showDetails?: boolean
}

// ==========================================
// COMPONENTE PAYMENT STATS
// ==========================================
export const PaymentStats: React.FC<PaymentStatsProps> = ({
  className = '',
  showDetails = true
}) => {
  // ==========================================
  // ESTADO Y HOOKS
  // ==========================================
  const { 
    paymentSummary, 
    isLoading, 
    error, 
    fetchPaymentSummary,
    clearError
  } = usePaymentStore()

  // ==========================================
  // EFECTOS
  // ==========================================
  useEffect(() => {
    fetchPaymentSummary()
  }, [fetchPaymentSummary])

  // ==========================================
  // HANDLERS
  // ==========================================
  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'CASH':
        return <Banknote className="w-5 h-5" />
      case 'CARD':
        return <CreditCard className="w-5 h-5" />
      case 'TRANSFER':
        return <Smartphone className="w-5 h-5" />
      default:
        return <DollarSign className="w-5 h-5" />
    }
  }

  const getMethodName = (method: string) => {
    switch (method) {
      case 'CASH':
        return 'Efectivo'
      case 'CARD':
        return 'Tarjeta'
      case 'TRANSFER':
        return 'Transferencia'
      default:
        return method
    }
  }

  // ==========================================
  // RENDER
  // ==========================================
  if (isLoading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <LoadingSpinner size="lg" />
        <span className="ml-3 text-gray-600">Cargando estadísticas...</span>
      </div>
    )
  }

  if (error) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="text-center">
          <div className="text-red-600 mb-2">Error cargando estadísticas de pagos</div>
          <p className="text-sm text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => {
              clearError()
              fetchPaymentSummary()
            }}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Reintentar
          </button>
        </div>
      </Card>
    )
  }

  if (!paymentSummary) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="text-center text-gray-500">
          No hay datos de pagos disponibles
        </div>
      </Card>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total General */}
        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total General</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(paymentSummary.totalAmount)}
              </p>
            </div>
          </div>
        </Card>

        {/* Hoy */}
        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Hoy</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(paymentSummary.todayTotal)}
              </p>
            </div>
          </div>
        </Card>

        {/* Esta Semana */}
        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Esta Semana</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(paymentSummary.weekTotal)}
              </p>
            </div>
          </div>
        </Card>

        {/* Total Pagos */}
        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 bg-orange-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Pagos</p>
              <p className="text-2xl font-bold text-gray-900">
                {paymentSummary.totalPayments}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {showDetails && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Por Método de Pago */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Por Método de Pago
            </h3>
            <div className="space-y-4">
              {Object.entries(paymentSummary.byMethod).map(([method, count]) => (
                <div key={method} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      {getMethodIcon(method)}
                    </div>
                    <span className="font-medium text-gray-900">
                      {getMethodName(method)}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-gray-900">{count}</div>
                    <div className="text-sm text-gray-500">pagos</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Por Estado */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Por Estado
            </h3>
            <div className="space-y-4">
              {Object.entries(paymentSummary.byStatus).map(([status, count]) => {
                let statusColor = 'bg-gray-100 text-gray-600'
                let statusName = status

                switch (status) {
                  case 'COMPLETED':
                    statusColor = 'bg-green-100 text-green-600'
                    statusName = 'Completados'
                    break
                  case 'PENDING':
                    statusColor = 'bg-yellow-100 text-yellow-600'
                    statusName = 'Pendientes'
                    break
                  case 'FAILED':
                    statusColor = 'bg-red-100 text-red-600'
                    statusName = 'Fallidos'
                    break
                  case 'REFUNDED':
                    statusColor = 'bg-orange-100 text-orange-600'
                    statusName = 'Reembolsados'
                    break
                }

                return (
                  <div key={status} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColor}`}>
                        {statusName}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-gray-900">{count}</div>
                      <div className="text-sm text-gray-500">pagos</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}

export default PaymentStats
