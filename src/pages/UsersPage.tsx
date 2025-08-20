// ==========================================
// PÁGINA PRINCIPAL DE GESTIÓN DE USUARIOS
// ==========================================
import React, { useState, useEffect } from 'react';
import { Plus, Users, Search, Filter, TrendingUp, UserCheck, UserX, Shield } from 'lucide-react';
import { Button, Card, Input } from '../components/ui';
import { UserForm } from '../components/users/UserForm';
import { UserList } from '../components/users/UserList';
import { UserStatusModal } from '../components/users/UserStatusModal';
import { UserEditModal } from '../components/users/UserEditModal';
import { useUserStore, type UserFilters } from '../store/userStore';
import { useAuthStore } from '../store/authStore';
import type { User } from '../types';
import type { CreateUserRequest, UpdateUserRequest } from '../services/userService';

// ==========================================
// TIPOS LOCALES
// ==========================================
type ViewMode = 'list' | 'create' | 'edit';

// Tipos compatibles con el formulario actualizado
interface CreateUserFormData {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  role: 'ADMIN' | 'OPERATOR';
  isActive: boolean;
}

interface EditUserFormData {
  firstname: string;
  lastname: string;
  email: string;
  role: 'ADMIN' | 'OPERATOR';
}

type UserFormData = CreateUserFormData | EditUserFormData;

// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================
export const UsersPage: React.FC = () => {
  // ==========================================
  // ESTADO LOCAL
  // ==========================================
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'ADMIN' | 'OPERATOR'>('ALL');
  
  // Estado para el modal de confirmación de cambio de estado
  const [statusModal, setStatusModal] = useState<{
    isOpen: boolean;
    user: User | null;
    newStatus: boolean;
    isLoading: boolean;
  }>({
    isOpen: false,
    user: null,
    newStatus: false,
    isLoading: false
  });

  // Estado para el modal de edición
  const [editModal, setEditModal] = useState<{
    isOpen: boolean;
    user: User | null;
  }>({
    isOpen: false,
    user: null
  });

  // ==========================================
  // STORES
  // ==========================================
  const {
    users,
    isLoading,
    error,
    fetchUsers,
    createOperator,
    updateUser,
    updateUserStatus,
    clearError,
    getFilteredUsers,
    getUserStats
  } = useUserStore();
  
  const { user: currentUser } = useAuthStore();

  // ==========================================
  // EFECTOS
  // ==========================================
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    if (error) {
      // Limpiar el error después de 5 segundos
      const timer = setTimeout(() => {
        clearError();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  // ==========================================
  // VERIFICACIÓN DE PERMISOS
  // ==========================================
  // Solo usuarios ADMIN pueden acceder a la gestión de usuarios
  if (!currentUser || currentUser.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-md mx-auto">
          <Card className="p-6 text-center">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
              <Shield className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Acceso Restringido
            </h3>
            <p className="text-gray-600">
              Solo los administradores pueden acceder a la gestión de usuarios.
            </p>
          </Card>
        </div>
      </div>
    );
  }

  // ==========================================
  // FUNCIONES DE FILTRADO
  // ==========================================
  const filters: UserFilters = {
    search: searchTerm,
    role: roleFilter,
    isActive: undefined // Mostrar todos por defecto
  };

  const filteredUsers = getFilteredUsers(filters);
  const stats = getUserStats();

  // ==========================================
  // HANDLERS
  // ==========================================
  const handleCreateUser = () => {
    setSelectedUser(null);
    setViewMode('create');
  };

  const handleEditUser = (user: User) => {
    setEditModal({
      isOpen: true,
      user: user
    });
  };

  const handleDeactivateUser = (userId: string) => {
    if (currentUser?.id === userId) {
      alert('No puedes desactivar tu propia cuenta');
      return;
    }

    const userToDeactivate = users.find(u => u.id === userId);
    if (userToDeactivate) {
      setStatusModal({
        isOpen: true,
        user: userToDeactivate,
        newStatus: false, // desactivar
        isLoading: false
      });
    }
  };

  const handleActivateUser = (userId: string) => {
    const userToActivate = users.find(u => u.id === userId);
    if (userToActivate) {
      setStatusModal({
        isOpen: true,
        user: userToActivate,
        newStatus: true, // activar
        isLoading: false
      });
    }
  };

  const handleStatusModalConfirm = async () => {
    if (!statusModal.user) return;

    setStatusModal(prev => ({ ...prev, isLoading: true }));
    
    try {
      await updateUserStatus(statusModal.user.id, statusModal.newStatus);
      
      // Cerrar modal
      setStatusModal({
        isOpen: false,
        user: null,
        newStatus: false,
        isLoading: false
      });
    } catch (error) {
      console.error('Error al cambiar estado del usuario:', error);
      setStatusModal(prev => ({ ...prev, isLoading: false }));
    }
  };

  const handleStatusModalClose = () => {
    if (!statusModal.isLoading) {
      setStatusModal({
        isOpen: false,
        user: null,
        newStatus: false,
        isLoading: false
      });
    }
  };

  const handleFormSubmit = async (data: UserFormData) => {
    try {
      if (viewMode === 'create') {
        // Type guard para CreateUserFormData
        const createData = data as CreateUserFormData;
        if (!createData.password) {
          throw new Error('La contraseña es requerida para crear un usuario');
        }
        const requestData: CreateUserRequest = {
          firstname: createData.firstname,
          lastname: createData.lastname,
          email: createData.email,
          password: createData.password
        };
        await createOperator(requestData);
        setViewMode('list');
        setSelectedUser(null);
      }
    } catch (error) {
      console.error('Error en formulario:', error);
      throw error; // Re-lanzar para que lo maneje el componente UserForm
    }
  };

  const handleEditSubmit = async (data: UserFormData) => {
    if (!editModal.user) return;
    
    console.log('🔄 Iniciando edición de usuario:', editModal.user.id);
    console.log('📝 Datos del formulario:', data);
    
    try {
      // Type guard para EditUserFormData
      const editData = data as EditUserFormData;
      const updateData: UpdateUserRequest = {
        id: parseInt(editModal.user.id),
        firstname: editData.firstname,
        lastname: editData.lastname,
        email: editData.email,
        role: editData.role
        // isActive se maneja a través del botón de estado en la tabla, no aquí
      };
      
      console.log('📤 Enviando datos al backend:', updateData);
      await updateUser(updateData);
      console.log('✅ Usuario actualizado exitosamente');
      
      // Cerrar modal
      setEditModal({
        isOpen: false,
        user: null
      });
    } catch (error) {
      console.error('❌ Error en edición de usuario:', error);
      throw error;
    }
  };

  const handleEditCancel = () => {
    setEditModal({
      isOpen: false,
      user: null
    });
  };

  const handleCancelForm = () => {
    setViewMode('list');
    setSelectedUser(null);
  };

  // ==========================================
  // RENDER
  // ==========================================
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Users className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Gestión de Usuarios
            </h1>
            <p className="text-gray-600">
              Administra operadores y usuarios del sistema
            </p>
          </div>
        </div>

        {viewMode === 'list' && (
          <Button
            onClick={handleCreateUser}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Crear Operador
          </Button>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <div className="p-4">
            <div className="flex items-center">
              <div className="text-red-600 text-sm font-medium">
                Error: {error}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearError}
                className="ml-auto text-red-600 hover:text-red-800"
              >
                ✕
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Stats Cards */}
      {viewMode === 'list' && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                <div className="text-sm text-gray-600">Total</div>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <UserCheck className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{stats.active}</div>
                <div className="text-sm text-gray-600">Activos</div>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <UserX className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">{stats.inactive}</div>
                <div className="text-sm text-gray-600">Inactivos</div>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Shield className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">{stats.admins}</div>
                <div className="text-sm text-gray-600">Admins</div>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Users className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">{stats.operators}</div>
                <div className="text-sm text-gray-600">Operadores</div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Content */}
      {viewMode === 'list' && (
        <>
          {/* Filters */}
          <Card className="p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="Buscar por nombre, apellido o email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Role Filter */}
              <div className="lg:w-48">
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value as typeof roleFilter)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="ALL">Todos los roles</option>
                    <option value="ADMIN">Administradores</option>
                    <option value="OPERATOR">Operadores</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Filter Summary */}
            {(searchTerm || roleFilter !== 'ALL') && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>
                    Mostrando {filteredUsers.length} de {stats.total} usuarios
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSearchTerm('');
                      setRoleFilter('ALL');
                    }}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Limpiar filtros
                  </Button>
                </div>
              </div>
            )}
          </Card>

          {/* User List */}
          <UserList
            users={filteredUsers}
            onEditUser={handleEditUser}
            onDeactivateUser={handleDeactivateUser}
            onActivateUser={handleActivateUser}
            isLoading={isLoading}
            currentUserId={currentUser?.id}
          />
        </>
      )}

      {/* User Form */}
      {(viewMode === 'create' || viewMode === 'edit') && (
        <UserForm
          user={selectedUser || undefined}
          onSubmit={handleFormSubmit}
          onCancel={handleCancelForm}
          mode={viewMode}
        />
      )}

      {/* Modal de Confirmación de Cambio de Estado */}
      <UserStatusModal
        isOpen={statusModal.isOpen}
        onClose={handleStatusModalClose}
        onConfirm={handleStatusModalConfirm}
        user={statusModal.user}
        newStatus={statusModal.newStatus}
        isLoading={statusModal.isLoading}
      />

      {/* Modal de Edición de Usuario */}
      <UserEditModal
        isOpen={editModal.isOpen}
        onClose={handleEditCancel}
        onSubmit={handleEditSubmit}
        user={editModal.user}
        isLoading={isLoading}
      />
    </div>
  );
};

export default UsersPage;
