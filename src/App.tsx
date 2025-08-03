import { useState } from 'react'
import { Car, Users, Calendar } from 'lucide-react'
import './App.css'
import { Button } from './components/ui/Button'
import { Card, CardHeader, CardContent } from './components/ui/Card'
import { Badge } from './components/ui/Badge'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { DashboardHeader } from './components/layout/DashboardHeader'
import { useAuthStore } from './store/authStore'
import { usePermissions } from './hooks/usePermissions'

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user } = useAuthStore()
  const { isAdmin, isOperator } = usePermissions()

  const DashboardContent = () => (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar for mobile */}
      <div className={`fixed inset-0 z-40 md:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="relative flex flex-col w-64 h-full bg-white">
          <div className="flex items-center justify-center h-16 px-4 bg-blue-600">
            <h1 className="text-xl font-semibold text-white">ParkingApp</h1>
          </div>
          <nav className="flex-1 px-4 py-6 space-y-2">
            <a href="#" className="flex items-center px-3 py-2 text-gray-700 rounded-lg hover:bg-gray-100">
              <Car className="w-5 h-5 mr-3" />
              Vehículos
            </a>
            {(isOperator || isAdmin) && (
              <a href="#" className="flex items-center px-3 py-2 text-gray-700 rounded-lg hover:bg-gray-100">
                <Users className="w-5 h-5 mr-3" />
                Usuarios
              </a>
            )}
            <a href="#" className="flex items-center px-3 py-2 text-gray-700 rounded-lg hover:bg-gray-100">
              <Calendar className="w-5 h-5 mr-3" />
              Sesiones
            </a>
          </nav>
        </div>
      </div>

      {/* Sidebar for desktop */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex flex-col flex-1 min-h-0 bg-white border-r border-gray-200">
          <div className="flex items-center justify-center h-16 px-4 bg-blue-600">
            <h1 className="text-xl font-semibold text-white">ParkingApp</h1>
          </div>
          <nav className="flex-1 px-4 py-6 space-y-2">
            <a href="#" className="flex items-center px-3 py-2 text-gray-700 rounded-lg hover:bg-gray-100">
              <Car className="w-5 h-5 mr-3" />
              Vehículos
            </a>
            {(isOperator || isAdmin) && (
              <a href="#" className="flex items-center px-3 py-2 text-gray-700 rounded-lg hover:bg-gray-100">
                <Users className="w-5 h-5 mr-3" />
                Usuarios
              </a>
            )}
            <a href="#" className="flex items-center px-3 py-2 text-gray-700 rounded-lg hover:bg-gray-100">
              <Calendar className="w-5 h-5 mr-3" />
              Sesiones
            </a>
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="md:pl-64">
        <DashboardHeader 
          onMenuToggle={() => setSidebarOpen(true)}
          title={`Dashboard - ${user?.role === 'ADMIN' ? 'Administrador' : user?.role === 'OPERATOR' ? 'Operador' : 'Usuario'}`}
        />

        <main className="p-6">
          <div className="max-w-7xl mx-auto">
            {/* Welcome Card */}
            <Card className="mb-8" padding="lg">
              <CardHeader 
                title={`¡Bienvenido ${user?.firstName}!`}
                subtitle="Sistema de Gestión de Parking - FASE 3 Completada"
              />
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Has iniciado sesión exitosamente. Este sistema incluye autenticación completa, 
                  protección de rutas y manejo de roles y permisos.
                </p>
                <div className="flex gap-3 flex-wrap">
                  <Button variant="primary" size="md">Dashboard</Button>
                  <Button variant="secondary" size="md">Perfil</Button>
                  <Button variant="outline" size="md">Configuración</Button>
                  {isAdmin && (
                    <Button variant="warning" size="md">Panel Admin</Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* User Info Card */}
            <Card className="mb-8">
              <CardHeader title="Información de Usuario" />
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
                    <p className="text-gray-900">{user?.firstName} {user?.lastName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <p className="text-gray-900">{user?.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
                    <Badge variant={user?.role === 'ADMIN' ? 'danger' : user?.role === 'OPERATOR' ? 'primary' : 'secondary'}>
                      {user?.role}
                    </Badge>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                    <Badge variant={user?.isActive ? 'success' : 'danger'}>
                      {user?.isActive ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Features Status */}
            <Card>
              <CardHeader title="Estado del Sistema - FASE 3" />
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="success">✅ React 19 + TypeScript</Badge>
                  <Badge variant="success">✅ Tailwind CSS v4</Badge>
                  <Badge variant="success">✅ Componentes UI</Badge>
                  <Badge variant="success">✅ Autenticación JWT</Badge>
                  <Badge variant="success">✅ Zustand Store</Badge>
                  <Badge variant="success">✅ Protección de Rutas</Badge>
                  <Badge variant="success">✅ Sistema de Roles</Badge>
                  <Badge variant="success">✅ Persistencia Local</Badge>
                  <Badge variant="info">🎯 FASE 3 COMPLETADA</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )

  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  )
}

export default App
