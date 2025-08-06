import React, { useEffect, useState } from 'react'
import { Plus, Edit, Car } from 'lucide-react'
import type { Vehicle, VehicleType } from '../../types'
import { useVehicleStore } from '../../store/vehicleStore'
import { Button, Table, VehicleTypeBadge, LoadingSpinner, ToggleSwitch } from '../ui'
import { useAuth } from '../../hooks/useAuth'
import type { TableColumn } from '../ui'

// ==========================================
// TIPOS DEL COMPONENTE
// ==========================================
interface VehicleListProps {
  onCreateVehicle?: () => void
  onEditVehicle?: (vehicle: Vehicle) => void
  onViewVehicle?: (vehicle: Vehicle) => void
  compact?: boolean
  searchable?: boolean
  showActions?: boolean
}

interface VehicleFilters {
  type?: VehicleType
  search?: string
  ownerName?: string
}

// ==========================================
// COMPONENTE VEHICLE LIST
// ==========================================
export const VehicleList: React.FC<VehicleListProps> = ({
  onCreateVehicle,
  onEditVehicle,
  onViewVehicle,
  compact = false,
  searchable = true,
  showActions = true
}) => {
  // ==========================================
  // ESTADO Y HOOKS
  // ==========================================
  const {
    vehicles,
    isLoading,
    error,
    fetchVehicles,
    changeVehicleStatus,
    clearError
  } = useVehicleStore()

  const { isAdmin } = useAuth() // Para verificar si puede cambiar estados

  const [filters, setFilters] = useState<VehicleFilters>({})
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [sortConfig, setSortConfig] = useState<{
    key: string
    direction: 'asc' | 'desc'
  } | null>(null)

  // ==========================================
  // EFECTOS
  // ==========================================
  useEffect(() => {
    fetchVehicles()
  }, [fetchVehicles])

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        clearError()
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [error, clearError])

  // ==========================================
  // FILTRADO Y ORDENAMIENTO
  // ==========================================
  const filteredAndSortedVehicles = React.useMemo(() => {
    let result = [...vehicles]

    // Aplicar filtros
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      result = result.filter(vehicle =>
        vehicle.licensePlate.toLowerCase().includes(searchLower) ||
        (vehicle.brand?.toLowerCase() || '').includes(searchLower) ||
        (vehicle.model?.toLowerCase() || '').includes(searchLower) ||
        (vehicle.ownerName?.toLowerCase() || '').includes(searchLower)
      )
    }

    if (filters.type) {
      result = result.filter(vehicle => vehicle.vehicleType === filters.type)
    }

    if (filters.ownerName) {
      const ownerLower = filters.ownerName.toLowerCase()
      result = result.filter(vehicle =>
        (vehicle.ownerName?.toLowerCase() || '').includes(ownerLower)
      )
    }

    // Aplicar ordenamiento
    if (sortConfig) {
      result.sort((a, b) => {
        const getVehicleValue = (vehicle: Vehicle, key: string): string => {
          switch (key) {
            case 'licensePlate': return vehicle.licensePlate
            case 'vehicleType': return vehicle.vehicleType
            case 'brand': return vehicle.brand || ''
            case 'model': return vehicle.model || ''
            case 'ownerName': return vehicle.ownerName || ''
            case 'createdAt': return vehicle.createdAt
            default: return ''
          }
        }
        
        const aValue = getVehicleValue(a, sortConfig.key)
        const bValue = getVehicleValue(b, sortConfig.key)
        
        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1
        }
        return 0
      })
    }

    return result
  }, [vehicles, filters, sortConfig])

  // ==========================================
  // PAGINACIÓN
  // ==========================================
  const totalItems = filteredAndSortedVehicles.length
  const totalPages = Math.ceil(totalItems / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedVehicles = filteredAndSortedVehicles.slice(startIndex, endIndex)

  // ==========================================
  // MANEJADORES DE EVENTOS
  // ==========================================
  const handleSearch = (query: string) => {
    setFilters(prev => ({ ...prev, search: query }))
    setCurrentPage(1)
  }

  const handleSort = (column: string, direction: 'asc' | 'desc') => {
    setSortConfig({ key: column, direction })
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handlePageSizeChange = (size: number) => {
    setPageSize(size)
    setCurrentPage(1)
  }

  // Convertir vehículos a formato de tabla
  const tableData = paginatedVehicles.map(vehicle => ({
    id: vehicle.id,
    licensePlate: vehicle.licensePlate,
    vehicleType: vehicle.vehicleType,
    brand: vehicle.brand || '',
    model: vehicle.model || '',
    isActive: vehicle.isActive,
    ownerName: vehicle.ownerName || '',
    createdAt: vehicle.createdAt,
    originalVehicle: vehicle
  }))

  // ==========================================
  // CONFIGURACIÓN DE COLUMNAS
  // ==========================================
  const columns: TableColumn<typeof tableData[0]>[] = [
    {
      key: 'licensePlate',
      label: 'Placa',
      sortable: true,
      render: (value) => (
        <div className="font-mono font-semibold text-blue-600">
          {String(value)}
        </div>
      )
    },
    {
      key: 'vehicleType',
      label: 'Tipo',
      sortable: true,
      render: (value) => (
        <VehicleTypeBadge type={value as VehicleType} />
      )
    },
    {
      key: 'brand',
      label: 'Marca',
      sortable: true
    },
    {
      key: 'model',
      label: 'Modelo',
      sortable: true
    },
    {
      key: 'isActive',
      label: 'Estado',
      sortable: true,
      render: (value) => {
        const isActive = value as boolean;
        return (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              isActive
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            {isActive ? '✅ Activo' : '❌ Inactivo'}
          </span>
        );
      }
    },
    ...(!compact ? [
      {
        key: 'ownerName' as keyof typeof tableData[0],
        label: 'Propietario',
        sortable: true
      },
      {
        key: 'createdAt' as keyof typeof tableData[0],
        label: 'Fecha Registro',
        sortable: true,
        render: (value: unknown) => {
          const date = value as string
          return new Date(date).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          })
        }
      }
    ] : []),
    ...(showActions ? [
      {
        key: 'actions' as keyof typeof tableData[0],
        label: 'Acciones',
        align: 'center' as const,
        width: '120px',
        render: (_: unknown, row: typeof tableData[0]) => {
          const vehicle = row.originalVehicle
          return (
            <div className="flex items-center justify-center gap-3">
              {onEditVehicle && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    onEditVehicle(vehicle)
                  }}
                  leftIcon={<Edit className="w-3 h-3" />}
                  className="h-8 px-2"
                >
                  Editar
                </Button>
              )}
              
              {/* Toggle para activar/desactivar - Solo ADMIN */}
              {isAdmin && (
                <div className="flex items-center gap-2">
                  <ToggleSwitch
                    checked={vehicle.isActive}
                    onChange={async (isActive) => {
                      try {
                        await changeVehicleStatus(vehicle.id, isActive)
                      } catch (error) {
                        console.error('Error cambiando estado del vehículo:', error)
                        alert(`Error: No se pudo ${isActive ? 'activar' : 'desactivar'} el vehículo`)
                      }
                    }}
                    size="sm"
                    color={vehicle.isActive ? 'green' : 'red'}
                    disabled={isLoading}
                    loading={isLoading}
                  />
                  <span className="text-xs text-gray-600">
                    {vehicle.isActive ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
              )}
            </div>
          )
        }
      }
    ] : [])
  ]

  // ==========================================
  // RENDER
  // ==========================================
  if (isLoading && vehicles.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
        <span className="ml-3 text-gray-600">Cargando vehículos...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      {!compact && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Car className="w-6 h-6 text-blue-600" />
              Gestión de Vehículos
            </h2>
            <p className="text-gray-600">
              Administra los vehículos registrados en el sistema
            </p>
          </div>
          
          {onCreateVehicle && (
            <Button
              onClick={onCreateVehicle}
              leftIcon={<Plus className="w-4 h-4" />}
              className="whitespace-nowrap"
            >
              Agregar Vehículo
            </Button>
          )}
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-1 text-sm text-red-700">{error}</div>
            </div>
            <div className="ml-auto pl-3">
              <div className="-mx-1.5 -my-1.5">
                <button
                  type="button"
                  className="inline-flex bg-red-50 rounded-md p-1.5 text-red-500 hover:bg-red-100"
                  onClick={clearError}
                >
                  <span className="sr-only">Cerrar</span>
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Vehicle Table */}
      <Table
        columns={columns}
        data={tableData}
        loading={isLoading}
        emptyMessage="No hay vehículos registrados. Comienza agregando un nuevo vehículo."
        onRowClick={(row) => onViewVehicle?.(row.originalVehicle)}
        searchable={searchable}
        searchPlaceholder="Buscar por placa, marca, modelo o propietario..."
        onSearch={handleSearch}
        onSort={handleSort}
        actions={
          compact && onCreateVehicle ? (
            <Button
              size="sm"
              onClick={onCreateVehicle}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Agregar
            </Button>
          ) : undefined
        }
        pagination={{
          currentPage,
          totalPages,
          pageSize,
          totalItems,
          onPageChange: handlePageChange,
          onPageSizeChange: handlePageSizeChange
        }}
        className={compact ? 'shadow-none border' : undefined}
      />
    </div>
  )
}

export default VehicleList
