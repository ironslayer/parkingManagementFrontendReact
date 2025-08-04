import React, { useEffect, useState, useCallback } from 'react'
import { 
  BarChart3, 
  DollarSign, 
  Car, 
  Clock, 
  Users, 
  AlertTriangle,
  CheckCircle,
  RefreshCw
} from 'lucide-react'
import { useParkingSessionStore } from '../store/parkingSessionStore'
import { usePaymentStore } from '../store/paymentStore'
import { useVehicleStore } from '../store/vehicleStore'
import { PaymentStats } from '../components/payments/PaymentStats'
import { MetricWidget } from '../components/dashboard/MetricWidget'
import { Button, Card, CardHeader, CardContent } from '../components/ui'
import { formatCurrency, formatDuration } from '../utils'

// ==========================================
// TIPOS DEL COMPONENTE
// ==========================================
interface DashboardMetrics {
  totalSessions: number
  activeSessions: number
  totalRevenue: number
  todayRevenue: number
  avgSessionDuration: number
  occupancyRate: number
  totalVehicles: number
  alertsCount: number
}

interface QuickAction {
  id: string
  label: string
  icon: React.ReactNode
  onClick: () => void
  variant?: 'primary' | 'secondary' | 'success' | 'warning'
}

// ==========================================
// COMPONENTE DASHBOARD PAGE
// ==========================================
export const DashboardPage: React.FC = () => {
  // ==========================================
  // ESTADO Y HOOKS
  // ==========================================
  const { 
    sessions, 
    fetchSessions, 
    isLoading: sessionsLoading 
  } = useParkingSessionStore()
  
  const { 
    paymentSummary, 
    fetchPaymentSummary, 
    isLoading: paymentsLoading 
  } = usePaymentStore()
  
  const { 
    vehicles, 
    fetchVehicles, 
    isLoading: vehiclesLoading 
  } = useVehicleStore()

  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  // ==========================================
  // FUNCIONES AUXILIARES
  // ==========================================
  const loadAllData = useCallback(async () => {
    try {
      await Promise.all([
        fetchSessions(),
        fetchPaymentSummary(),
        fetchVehicles()
      ])
      setLastUpdated(new Date())
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    }
  }, [fetchSessions, fetchPaymentSummary, fetchVehicles])

  const calculateMetrics = useCallback(() => {
    const activeSessions = sessions.filter(s => s.status === 'ACTIVE')
    const completedSessions = sessions.filter(s => s.status === 'COMPLETED')
    
    // Calcular duración promedio
    const totalDuration = completedSessions.reduce((acc, session) => {
      if (session.exitTime) {
        const duration = new Date(session.exitTime).getTime() - new Date(session.entryTime).getTime()
        return acc + duration
      }
      return acc
    }, 0)
    
    const avgDuration = completedSessions.length > 0 ? totalDuration / completedSessions.length : 0
    
    // Calcular tasa de ocupación (asumiendo 50 espacios máximos)
    const maxSpaces = 50
    const occupancyRate = (activeSessions.length / maxSpaces) * 100

    // Contar alertas (ocupación > 80%, sesiones muy largas, etc.)
    let alertsCount = 0
    if (occupancyRate > 80) alertsCount++
    
    // Sesiones de más de 8 horas
    const longSessions = activeSessions.filter(session => {
      const duration = Date.now() - new Date(session.entryTime).getTime()
      return duration > 8 * 60 * 60 * 1000 // 8 horas
    })
    alertsCount += longSessions.length

    const calculatedMetrics: DashboardMetrics = {
      totalSessions: sessions.length,
      activeSessions: activeSessions.length,
      totalRevenue: paymentSummary?.totalAmount || 0,
      todayRevenue: paymentSummary?.todayTotal || 0,
      avgSessionDuration: avgDuration,
      occupancyRate,
      totalVehicles: vehicles.length,
      alertsCount
    }

    setMetrics(calculatedMetrics)
  }, [sessions, paymentSummary, vehicles])

  // ==========================================
  // EFECTOS
  // ==========================================
  useEffect(() => {
    loadAllData()
    
    // Actualizar cada 30 segundos
    const interval = setInterval(() => {
      loadAllData()
    }, 30000)

    return () => clearInterval(interval)
  }, [loadAllData])

  useEffect(() => {
    if (sessions.length > 0 && paymentSummary && vehicles.length > 0) {
      calculateMetrics()
    }
  }, [sessions, paymentSummary, vehicles, calculateMetrics])

  const handleRefresh = () => {
    loadAllData()
  }

  // ==========================================
  // ACCIONES RÁPIDAS
  // ==========================================
  const quickActions: QuickAction[] = [
    {
      id: 'new-session',
      label: 'Nueva Sesión',
      icon: <Car className="w-4 h-4" />,
      onClick: () => window.location.href = '/sessions',
      variant: 'primary'
    },
    {
      id: 'add-vehicle',
      label: 'Registrar Vehículo',
      icon: <Users className="w-4 h-4" />,
      onClick: () => window.location.href = '/vehicles',
      variant: 'secondary'
    },
    {
      id: 'view-reports',
      label: 'Ver Reportes',
      icon: <BarChart3 className="w-4 h-4" />,
      onClick: () => console.log('Reportes - Próximamente'),
      variant: 'success'
    }
  ]

  // ==========================================
  // RENDER
  // ==========================================
  const isLoading = sessionsLoading || paymentsLoading || vehiclesLoading

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="mx-auto space-y-6 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="flex items-center gap-3 text-3xl font-bold text-gray-900">
              <BarChart3 className="w-8 h-8 text-blue-600" />
              Dashboard Principal
            </h1>
            <p className="mt-1 text-gray-600">
              Vista general del sistema de gestión de parqueadero
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Última actualización: {lastUpdated.toLocaleTimeString('es-ES')}
            </p>
          </div>
          
          <Button
            onClick={handleRefresh}
            leftIcon={<RefreshCw className="w-4 h-4" />}
            variant="outline"
            loading={isLoading}
          >
            Actualizar
          </Button>
        </div>

        {/* Métricas Principales */}
        {metrics && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {/* Sesiones Activas */}
            <MetricWidget
              title="Sesiones Activas"
              value={metrics.activeSessions}
              subtitle={`de ${metrics.totalSessions} sesiones totales`}
              icon={Clock}
              iconColor="text-blue-600"
              progress={{
                value: metrics.activeSessions,
                max: 50, // Capacidad máxima
                color: 'bg-blue-600'
              }}
              onClick={() => window.location.href = '/sessions'}
            />

            {/* Ingresos de Hoy */}
            <MetricWidget
              title="Ingresos Hoy"
              value={formatCurrency(metrics.todayRevenue)}
              subtitle={`Total: ${formatCurrency(metrics.totalRevenue)}`}
              icon={DollarSign}
              iconColor="text-green-600"
              trend={{
                value: 12.5,
                label: 'vs ayer',
                isPositive: true
              }}
            />

            {/* Tiempo Promedio */}
            <MetricWidget
              title="Tiempo Promedio"
              value={formatDuration(metrics.avgSessionDuration)}
              subtitle="Por sesión completada"
              icon={Clock}
              iconColor="text-purple-600"
            />

            {/* Vehículos Registrados */}
            <MetricWidget
              title="Vehículos"
              value={metrics.totalVehicles}
              subtitle="Registrados en total"
              icon={Car}
              iconColor="text-orange-600"
              trend={metrics.alertsCount > 0 ? {
                value: metrics.alertsCount,
                label: 'alertas',
                isPositive: false
              } : undefined}
              onClick={() => window.location.href = '/vehicles'}
            />
          </div>
        )}

        {/* Acciones Rápidas */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">Acciones Rápidas</h3>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {quickActions.map((action) => (
                <Button
                  key={action.id}
                  onClick={action.onClick}
                  variant={action.variant || 'outline'}
                  leftIcon={action.icon}
                  size="lg"
                  className="flex-col h-16 gap-2"
                >
                  {action.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Estadísticas de Pagos */}
        <PaymentStats showDetails={true} />

        {/* Estado del Sistema */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">Estado del Sistema</h3>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-8 h-8 text-green-600" />
                <div>
                  <p className="font-medium text-gray-900">Sistema Operativo</p>
                  <p className="text-sm text-gray-600">Todos los servicios funcionando</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Clock className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="font-medium text-gray-900">Actualización Automática</p>
                  <p className="text-sm text-gray-600">Cada 30 segundos</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                {metrics && metrics.alertsCount > 0 ? (
                  <AlertTriangle className="w-8 h-8 text-yellow-600" />
                ) : (
                  <CheckCircle className="w-8 h-8 text-green-600" />
                )}
                <div>
                  <p className="font-medium text-gray-900">
                    {metrics && metrics.alertsCount > 0 ? 'Alertas Activas' : 'Sin Alertas'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {metrics ? `${metrics.alertsCount} alertas pendientes` : 'Sistema estable'}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default DashboardPage
