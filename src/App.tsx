import { useState } from 'react'
import { Car, Users, Calendar, Home } from 'lucide-react'
import './App.css'
import { Button } from './components/ui/Button'
import { Card, CardHeader, CardContent } from './components/ui/Card'
import { Badge } from './components/ui/Badge'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { DashboardHeader } from './components/layout/DashboardHeader'
import { useAuthStore } from './store/authStore'
import { usePermissions } from './hooks/usePermissions'
import VehiclesPage from './pages/VehiclesPage'
import SessionsPage from './pages/SessionsPage'

type Page = 'dashboard' | 'vehicles' | 'users' | 'sessions'

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState<Page>('dashboard')
  const { user } = useAuthStore()
  const { isAdmin, isOperator } = usePermissions()

  const navigationItems = [
    { id: 'dashboard' as Page, label: 'Dashboard', icon: Home, show: true },
    { id: 'vehicles' as Page, label: 'Vehículos', icon: Car, show: true },
    { id: 'users' as Page, label: 'Usuarios', icon: Users, show: isOperator || isAdmin },
    { id: 'sessions' as Page, label: 'Sesiones', icon: Calendar, show: true }
  ]

  const handleNavigation = (page: Page) => {
    setCurrentPage(page)
    setSidebarOpen(false)
  }

  const renderContent = () => {
    switch (currentPage) {
      case 'vehicles':
        return <VehiclesPage />
      case 'users':
        return (
          <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
              <Card>
                <CardHeader title="Gestión de Usuarios" />
                <CardContent>
                  <p className="text-gray-600">Esta funcionalidad se implementará en la siguiente fase.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        )
      case 'sessions':
        return (
          <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
              <SessionsPage />
            </div>
          </div>
        )
      default: // dashboard
        return (
          <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
              {/* Welcome Card */}
              <Card className="mb-8" padding="lg">
                <CardHeader 
                  title={`¡Bienvenido ${user?.firstName}!`}
                  subtitle="Sistema de Gestión de Parking - FASE 4 en Desarrollo"
                />
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Has iniciado sesión exitosamente. Ahora puedes gestionar vehículos con el nuevo sistema CRUD completo.
                  </p>
                  <div className="flex gap-3 flex-wrap">
                    <Button 
                      variant="primary" 
                      size="md"
                      onClick={() => handleNavigation('vehicles')}
                    >
                      Gestionar Vehículos
                    </Button>
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
                <CardHeader title="Estado del Sistema - FASE 4" />
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="success">✅ React 19 + TypeScript</Badge>
                    <Badge variant="success">✅ Tailwind CSS v4</Badge>
                    <Badge variant="success">✅ Componentes UI Avanzados</Badge>
                    <Badge variant="success">✅ Autenticación JWT</Badge>
                    <Badge variant="success">✅ Zustand Store</Badge>
                    <Badge variant="success">✅ Protección de Rutas</Badge>
                    <Badge variant="success">✅ Sistema de Roles</Badge>
                    <Badge variant="success">✅ Vehicle Store & CRUD</Badge>
                    <Badge variant="success">✅ Tabla Reutilizable</Badge>
                    <Badge variant="success">✅ Formularios Avanzados</Badge>
                    <Badge variant="info">🎯 FASE 4 EN DESARROLLO</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )
    }
  }

  const Sidebar = ({ mobile = false }) => (
    <div className={`flex flex-col ${mobile ? 'w-64 h-full' : 'flex-1 min-h-0'} bg-white ${mobile ? '' : 'border-r border-gray-200'}`}>
      <div className="flex items-center justify-center h-16 px-4 bg-blue-600">
        <h1 className="text-xl font-semibold text-white">ParkingApp</h1>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigationItems.map(item => {
          if (!item.show) return null
          const Icon = item.icon
          return (
            <button
              key={item.id}
              onClick={() => handleNavigation(item.id)}
              className={`w-full flex items-center px-3 py-2 text-left rounded-lg transition-colors ${
                currentPage === item.id 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Icon className="w-5 h-5 mr-3" />
              {item.label}
            </button>
          )
        })}
      </nav>
    </div>
  )

  const DashboardContent = () => (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar for mobile */}
      <div className={`fixed inset-0 z-40 md:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="relative">
          <Sidebar mobile />
        </div>
      </div>

      {/* Sidebar for desktop */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <Sidebar />
      </div>

      {/* Main content */}
      <div className="md:pl-64">
        <DashboardHeader 
          onMenuToggle={() => setSidebarOpen(true)}
          title={navigationItems.find(item => item.id === currentPage)?.label || 'Dashboard'}
        />

        <main>
          {renderContent()}
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
