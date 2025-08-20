// ==========================================
// LISTA DE USUARIOS - COMPONENTE DE TABLA RESPONSIVE
// ==========================================
import React from 'react';
import { Edit2, User, UserCheck, UserX, Shield, Clock } from 'lucide-react';
import { Button, Badge, Card, LoadingSpinner } from '../ui';
import type { User as UserType } from '../../types';

// ==========================================
// PROPS DEL COMPONENTE
// ==========================================
interface UserListProps {
  users: UserType[];
  onEditUser: (user: UserType) => void;
  onDeactivateUser: (userId: string) => void;
  onActivateUser: (userId: string) => void;
  isLoading?: boolean;
  currentUserId?: string; // Para evitar que el usuario se modifique a sí mismo
}

// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================
export const UserList: React.FC<UserListProps> = ({
  users,
  onEditUser,
  onDeactivateUser,
  onActivateUser,
  isLoading = false,
  currentUserId
}) => {
  // ==========================================
  // FUNCIONES HELPER
  // ==========================================
  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return (
          <Badge 
            variant="success" 
            className="flex items-center gap-1 bg-purple-100 text-purple-800 border-purple-200"
          >
            <Shield className="w-3 h-3" />
            Administrador
          </Badge>
        );
      case 'OPERATOR':
        return (
          <Badge variant="info" className="flex items-center gap-1">
            <User className="w-3 h-3" />
            Operador
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary">
            {role}
          </Badge>
        );
    }
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge variant="success" className="flex items-center gap-1">
        <UserCheck className="w-3 h-3" />
        Activo
      </Badge>
    ) : (
      <Badge variant="danger" className="flex items-center gap-1">
        <UserX className="w-3 h-3" />
        Inactivo
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Hoy';
    if (diffInDays === 1) return 'Ayer';
    if (diffInDays < 30) return `Hace ${diffInDays} días`;
    if (diffInDays < 365) return `Hace ${Math.floor(diffInDays / 30)} meses`;
    return `Hace ${Math.floor(diffInDays / 365)} años`;
  };

  // ==========================================
  // RENDER ESTADOS
  // ==========================================
  if (isLoading) {
    return (
      <Card className="p-8">
        <div className="flex flex-col items-center justify-center text-center">
          <LoadingSpinner size="lg" />
          <p className="text-gray-600 mt-4">Cargando usuarios...</p>
        </div>
      </Card>
    );
  }

  if (users.length === 0) {
    return (
      <Card className="p-8">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="p-4 bg-gray-100 rounded-full mb-4">
            <User className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No hay usuarios registrados
          </h3>
          <p className="text-gray-600">
            Comienza creando tu primer operador
          </p>
        </div>
      </Card>
    );
  }

  // ==========================================
  // RENDER PRINCIPAL
  // ==========================================
  return (
    <div className="space-y-4">
      {/* Vista Desktop - Tabla */}
      <div className="hidden lg:block">
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuario
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rol
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Registro
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <User className="w-5 h-5 text-blue-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.firstname} {user.lastname}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {user.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getRoleBadge(user.role)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(user.isActive)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate(user.createdAt)}
                      </div>
                      <div className="text-xs text-gray-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {getTimeAgo(user.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEditUser(user)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Editar usuario"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        {currentUserId !== user.id && (
                          <>
                            {user.isActive ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onDeactivateUser(user.id)}
                                className="text-orange-600 hover:text-orange-800"
                                title="Desactivar usuario"
                              >
                                <UserX className="w-4 h-4" />
                              </Button>
                            ) : (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onActivateUser(user.id)}
                                className="text-green-600 hover:text-green-800"
                                title="Reactivar usuario"
                              >
                                <UserCheck className="w-4 h-4" />
                              </Button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Vista Mobile - Cards */}
      <div className="block lg:hidden space-y-4">
        {users.map((user) => (
          <Card key={user.id} className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 h-12 w-12">
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <User className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900">
                    {user.firstname} {user.lastname}
                  </h3>
                  <p className="text-sm text-gray-600">{user.email}</p>
                  <p className="text-xs text-gray-500">ID: {user.id}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEditUser(user)}
                  className="text-blue-600 hover:text-blue-800"
                  title="Editar usuario"
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                {currentUserId !== user.id && (
                  <>
                    {user.isActive ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeactivateUser(user.id)}
                        className="text-orange-600 hover:text-orange-800"
                        title="Desactivar usuario"
                      >
                        <UserX className="w-4 h-4" />
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onActivateUser(user.id)}
                        className="text-green-600 hover:text-green-800"
                        title="Reactivar usuario"
                      >
                        <UserCheck className="w-4 h-4" />
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Rol:</span>
                <div className="mt-1">
                  {getRoleBadge(user.role)}
                </div>
              </div>
              <div>
                <span className="text-gray-500">Estado:</span>
                <div className="mt-1">
                  {getStatusBadge(user.isActive)}
                </div>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Registrado: {formatDate(user.createdAt)}</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {getTimeAgo(user.createdAt)}
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Estadísticas */}
      <div className="text-sm text-gray-600 text-center py-2">
        Mostrando {users.length} usuario{users.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
};

export default UserList;
