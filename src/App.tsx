import { useState } from 'react'
import { Car, Users, Calendar, TrendingUp, Plus, Search } from 'lucide-react'
import { Button } from './components/ui'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Car className="h-8 w-8 text-blue-600" />
              <h1 className="ml-2 text-xl font-semibold text-gray-900">
                Sistema de Gestión de Parqueadero
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Bienvenido, Usuario</span>
              <div className="w-8 h-8 bg-blue-600 rounded-full"></div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
        {/* Welcome Card */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            🎉 ¡Configuración Exitosa!
          </h2>
          <p className="text-gray-600 mb-4">
            El proyecto React está funcionando correctamente con Tailwind CSS configurado.
          </p>
          <div className="flex gap-4">
            <button 
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              onClick={() => setCount((count) => count + 1)}
            >
              Contador: {count}
            </button>
            <button className="bg-gray-200 text-gray-900 px-4 py-2 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors">
              Botón Secundario
            </button>
          </div>
        </div>          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="card">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Car className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-500">Vehículos</h3>
                  <p className="text-2xl font-semibold text-gray-900">24</p>
                </div>
              </div>
            </div>
            
            <div className="card">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-500">Usuarios</h3>
                  <p className="text-2xl font-semibold text-gray-900">8</p>
                </div>
              </div>
            </div>
            
            <div className="card">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Calendar className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-500">Sesiones Hoy</h3>
                  <p className="text-2xl font-semibold text-gray-900">12</p>
                </div>
              </div>
            </div>
            
            <div className="card">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-500">Ingresos</h3>
                  <p className="text-2xl font-semibold text-gray-900">$1,250</p>
                </div>
              </div>
            </div>
          </div>

          {/* Form Test */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Prueba de Formulario
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Placa del Vehículo
                </label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="ABC-123"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Vehículo
                </label>
                <select className="input-field">
                  <option>Automóvil</option>
                  <option>Motocicleta</option>
                  <option>Camioneta</option>
                </select>
              </div>
            </div>
            <div className="mt-4 flex gap-4">
              <button className="btn-primary">
                Registrar Entrada
              </button>
              <button className="btn-secondary">
                Cancelar
              </button>
            </div>
          </div>

          {/* Status Badges */}
          <div className="card mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Estados de Configuración
            </h3>
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                ✅ React 19 Instalado
              </span>
              <span className="px-2 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                ✅ Tailwind CSS Configurado
              </span>
              <span className="px-2 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                ✅ TypeScript Habilitado
              </span>
              <span className="px-2 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                ✅ Lucide Icons
              </span>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                🔄 React Query Ready
              </span>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                🔄 Zustand Ready
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
