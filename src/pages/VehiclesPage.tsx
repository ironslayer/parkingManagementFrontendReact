import React, { useState } from 'react'
import type { Vehicle } from '../types'
import { VehicleList, VehicleForm } from '../components/vehicles'

// ==========================================
// PÁGINA DE GESTIÓN DE VEHÍCULOS
// ==========================================
export const VehiclesPage: React.FC = () => {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)

  // ==========================================
  // MANEJADORES DE EVENTOS
  // ==========================================
  const handleCreateVehicle = () => {
    setShowCreateModal(true)
  }

  const handleEditVehicle = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle)
    setShowEditModal(true)
  }

  const handleViewVehicle = (vehicle: Vehicle) => {
    console.log('Ver detalles del vehículo:', vehicle)
    // Aquí puedes implementar la lógica para mostrar detalles
    // Por ejemplo, abrir un modal de detalles o navegar a una página de detalles
  }

  const handleFormSuccess = (vehicle: Vehicle) => {
    console.log('Vehículo guardado exitosamente:', vehicle)
    // La lista se actualizará automáticamente gracias al store
  }

  const handleCloseCreateModal = () => {
    setShowCreateModal(false)
  }

  const handleCloseEditModal = () => {
    setShowEditModal(false)
    setSelectedVehicle(null)
  }

  // ==========================================
  // RENDER
  // ==========================================
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Lista de Vehículos */}
        <VehicleList
          onCreateVehicle={handleCreateVehicle}
          onEditVehicle={handleEditVehicle}
          onViewVehicle={handleViewVehicle}
          searchable
          showActions
        />

        {/* Modal para Crear Vehículo */}
        <VehicleForm
          isOpen={showCreateModal}
          onClose={handleCloseCreateModal}
          mode="create"
          onSuccess={handleFormSuccess}
        />

        {/* Modal para Editar Vehículo */}
        <VehicleForm
          isOpen={showEditModal}
          onClose={handleCloseEditModal}
          mode="edit"
          vehicle={selectedVehicle || undefined}
          onSuccess={handleFormSuccess}
        />
      </div>
    </div>
  )
}

export default VehiclesPage
