import React, { useState } from 'react'
import { Play, Clock, Car, Calendar } from 'lucide-react'
import { SessionList, SessionForm } from '../components/sessions'
import { PaymentStats } from '../components/payments/PaymentStats'
import { Button, Card, CardHeader, CardContent } from '../components/ui'
import { useParkingSessionStore } from '../store/parkingSessionStore'
import type { ParkingSession } from '../types'

export const SessionsPage: React.FC = () => {
  const [showStartForm, setShowStartForm] = useState(false)
  const [showActiveOnly, setShowActiveOnly] = useState(false)
  const { activeSessions, sessions } = useParkingSessionStore()

  const handleSessionCreated = () => {
    // Optionally show a success message or refresh data
  }

  const handleEndSession = (session: ParkingSession) => {
    // TODO: Implement end session logic
    console.log('End session:', session)
  }

  const handleViewSession = (session: ParkingSession) => {
    // TODO: Implement view session details
    console.log('View session:', session)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Calendar className="w-8 h-8 text-blue-600" />
            Gestión de Sesiones
          </h1>
          <p className="text-gray-600 mt-1">
            Administra las sesiones de parqueo activas e historial completo
          </p>
        </div>
        
        <Button
          onClick={() => setShowStartForm(true)}
          leftIcon={<Play className="w-4 h-4" />}
          size="lg"
        >
          Iniciar Nueva Sesión
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium text-gray-700">Sesiones Activas</h3>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{activeSessions.length}</div>
            <p className="text-xs text-gray-600">
              Vehículos actualmente parqueados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium text-gray-700">Total Sesiones</h3>
            <Car className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{sessions.length}</div>
            <p className="text-xs text-gray-600">
              Sesiones registradas en total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium text-gray-700">Disponibilidad</h3>
            <Car className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {Math.max(0, 50 - activeSessions.length)}
            </div>
            <p className="text-xs text-gray-600">
              Espacios disponibles de 50
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Payment Statistics */}
      <PaymentStats />

      {/* Filter Tabs */}
      <div className="flex items-center gap-4">
        <h2 className="text-xl font-semibold text-gray-800">Sesiones</h2>
        <div className="flex bg-gray-100 rounded-lg p-1">
          <Button
            variant={!showActiveOnly ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setShowActiveOnly(false)}
            className="rounded-md"
          >
            Todas
          </Button>
          <Button
            variant={showActiveOnly ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setShowActiveOnly(true)}
            className="rounded-md"
          >
            Solo Activas
          </Button>
        </div>
      </div>

      {/* Sessions List */}
      <Card>
        <CardContent className="p-0">
          <SessionList
            showOnlyActive={showActiveOnly}
            onStartSession={() => setShowStartForm(true)}
            onEndSession={handleEndSession}
            onViewSession={handleViewSession}
            showActions={true}
          />
        </CardContent>
      </Card>

      {/* Start Session Modal */}
      <SessionForm
        isOpen={showStartForm}
        onClose={() => setShowStartForm(false)}
        onSessionCreated={handleSessionCreated}
      />
    </div>
  )
}

export default SessionsPage
