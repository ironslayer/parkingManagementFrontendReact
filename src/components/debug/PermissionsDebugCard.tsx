// ==========================================
// COMPONENTE DE DEBUG PARA PERMISOS
// ==========================================
import React from 'react';
import { Card, CardHeader, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { usePermissions } from '../../hooks/usePermissions';
import { Shield, User, Eye } from 'lucide-react';

export const PermissionsDebugCard: React.FC = () => {
  const permissions = usePermissions();

  // Solo mostrar en desarrollo
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <Card className="mb-4 border-blue-200 bg-blue-50">
      <CardHeader 
        title="🔐 Debug de Permisos"
        subtitle="Información de roles y permisos del usuario actual (solo visible en desarrollo)"
      />
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Información del Usuario */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <User className="w-4 h-4" />
              Usuario
            </h4>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Autenticado:</span>
                <Badge variant={permissions.isAuthenticated ? 'success' : 'danger'}>
                  {permissions.isAuthenticated ? 'Sí' : 'No'}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Rol:</span>
                <Badge variant={permissions.currentRole === 'ADMIN' ? 'danger' : 'primary'}>
                  {permissions.currentRole || 'Sin rol'}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Cargando:</span>
                <Badge variant={permissions.isLoading ? 'warning' : 'success'}>
                  {permissions.isLoading ? 'Sí' : 'No'}
                </Badge>
              </div>
            </div>
          </div>

          {/* Verificaciones de Rol */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Roles
            </h4>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Es Admin:</span>
                <Badge variant={permissions.isAdmin ? 'success' : 'secondary'}>
                  {permissions.isAdmin ? 'Sí' : 'No'}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Es Operador:</span>
                <Badge variant={permissions.isOperator ? 'success' : 'secondary'}>
                  {permissions.isOperator ? 'Sí' : 'No'}
                </Badge>
              </div>
            </div>
          </div>

          {/* Permisos Específicos */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Permisos
            </h4>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Gestionar Usuarios:</span>
                <Badge variant={permissions.canManageUsers ? 'success' : 'secondary'}>
                  {permissions.canManageUsers ? 'Sí' : 'No'}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Gestionar Vehículos:</span>
                <Badge variant={permissions.canManageVehicles ? 'success' : 'secondary'}>
                  {permissions.canManageVehicles ? 'Sí' : 'No'}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Funciones Admin:</span>
                <Badge variant={permissions.canAccessAdminFeatures ? 'success' : 'secondary'}>
                  {permissions.canAccessAdminFeatures ? 'Sí' : 'No'}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Botón para forzar recarga de permisos */}
        <div className="mt-4 pt-4 border-t border-blue-200">
          <p className="text-xs text-blue-600">
            💡 Esta tarjeta te permite verificar que los permisos funcionen correctamente. 
            Los usuarios OPERATOR no deberían ver la pestaña "Usuarios" ni poder acceder a funciones de administración.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PermissionsDebugCard;
