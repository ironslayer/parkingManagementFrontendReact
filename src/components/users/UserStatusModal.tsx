// ==========================================
// MODAL DE CONFIRMACIÓN DE CAMBIO DE ESTADO DE USUARIO
// ==========================================
import React from 'react';
import { UserCheck, UserX, AlertTriangle, Shield, User } from 'lucide-react';
import { Modal, ModalHeader, ModalFooter } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import type { User as UserType } from '../../types';

// ==========================================
// TIPOS LOCALES
// ==========================================
interface UserStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  user: UserType | null;
  newStatus: boolean; // true = activar, false = desactivar
  isLoading?: boolean;
}

// ==========================================
// UTILIDADES
// ==========================================
const getRoleBadge = (role: string) => {
  const styles = {
    ADMIN: 'bg-purple-100 text-purple-800 border-purple-200',
    OPERATOR: 'bg-blue-100 text-blue-800 border-blue-200'
  };
  
  const labels = {
    ADMIN: 'Administrador',
    OPERATOR: 'Operador'
  };
  
  return {
    style: styles[role as keyof typeof styles] || 'bg-gray-100 text-gray-800 border-gray-200',
    label: labels[role as keyof typeof labels] || role
  };
};

const getStatusConfig = (newStatus: boolean) => {
  return {
    action: newStatus ? 'activar' : 'desactivar',
    actionUpper: newStatus ? 'Activar' : 'Desactivar',
    icon: newStatus ? UserCheck : UserX,
    iconColor: newStatus ? 'text-green-600' : 'text-orange-600',
    iconBg: newStatus ? 'bg-green-100' : 'bg-orange-100',
    buttonColor: newStatus ? 'bg-green-600 hover:bg-green-700' : 'bg-orange-600 hover:bg-orange-700',
    resultStatus: newStatus ? 'activo' : 'inactivo',
    consequence: newStatus 
      ? 'El usuario podrá acceder al sistema nuevamente.'
      : 'El usuario no podrá acceder al sistema hasta ser reactivado.',
    warning: newStatus 
      ? null 
      : 'Esta acción deshabilitará el acceso del usuario al sistema.'
  };
};

// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================
export const UserStatusModal: React.FC<UserStatusModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  user,
  newStatus,
  isLoading = false
}) => {
  // Si no hay usuario, no mostrar modal
  if (!user) return null;

  const config = getStatusConfig(newStatus);
  const roleBadge = getRoleBadge(user.role);
  const Icon = config.icon;

  const handleConfirm = () => {
    onConfirm();
  };

  const handleCancel = () => {
    if (!isLoading) {
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCancel}
      size="md"
      showCloseButton={!isLoading}
    >
      <div className="text-center">
        {/* Icono Principal */}
        <div className={`mx-auto w-16 h-16 rounded-full ${config.iconBg} flex items-center justify-center mb-4`}>
          <Icon className={`w-8 h-8 ${config.iconColor}`} />
        </div>

        <ModalHeader>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {config.actionUpper} Usuario
          </h3>
          <p className="text-sm text-gray-600">
            ¿Estás seguro de que deseas {config.action} este usuario?
          </p>
        </ModalHeader>

        {/* Información del Usuario */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-medium text-gray-900">
                  {user.firstname} {user.lastname}
                </h4>
                <span className={`px-2 py-1 rounded-full border text-xs font-medium ${roleBadge.style}`}>
                  <Shield className="w-3 h-3 inline-block mr-1" />
                  {roleBadge.label}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-2">{user.email}</p>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-gray-500">Estado actual:</span>
                <Badge variant={user.isActive ? 'success' : 'danger'}>
                  {user.isActive ? 'Activo' : 'Inactivo'}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Consecuencias */}
        <div className="text-left mb-6">
          <h5 className="font-medium text-gray-900 mb-2">
            Después de {config.action}:
          </h5>
          <ul className="text-sm text-gray-600 space-y-1">
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-1">•</span>
              <span>El usuario quedará <strong>{config.resultStatus}</strong> en el sistema</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-1">•</span>
              <span>{config.consequence}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-1">•</span>
              <span>Se actualizará el registro con fecha y hora del cambio</span>
            </li>
            {!newStatus && (
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                <span>Se mantendrá todo el historial y datos del usuario</span>
              </li>
            )}
          </ul>
        </div>

        {/* Warning para desactivación */}
        {config.warning && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="text-left">
                <p className="text-sm font-medium text-yellow-800">Importante</p>
                <p className="text-sm text-yellow-700">{config.warning}</p>
              </div>
            </div>
          </div>
        )}

        <ModalFooter className="flex-col sm:flex-row gap-3">
          <Button
            variant="secondary"
            onClick={handleCancel}
            disabled={isLoading}
            className="w-full sm:w-auto order-2 sm:order-1"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isLoading}
            className={`w-full sm:w-auto order-1 sm:order-2 text-white ${config.buttonColor} flex items-center justify-center gap-2`}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Procesando...</span>
              </>
            ) : (
              <>
                <Icon className="w-4 h-4" />
                <span>{config.actionUpper} Usuario</span>
              </>
            )}
          </Button>
        </ModalFooter>
      </div>
    </Modal>
  );
};

export default UserStatusModal;
