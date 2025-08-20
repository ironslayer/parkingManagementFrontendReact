// ==========================================
// MODAL DE CONFIRMACIÓN PARA ACTUALIZACIÓN DE PERFIL
// ==========================================
import React from 'react';
import { User, CheckCircle, AlertTriangle, X } from 'lucide-react';
import { Modal, Button } from '../ui';

interface ProfileUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
  profileData: {
    firstname: string;
    lastname: string;
    email: string;
  };
  currentUser: {
    firstname: string;
    lastname: string;
    email: string;
  };
}

export const ProfileUpdateModal: React.FC<ProfileUpdateModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
  profileData,
  currentUser
}) => {
  // Verificar qué campos han cambiado
  const changes = [];
  if (profileData.firstname !== currentUser.firstname) {
    changes.push({
      field: 'Nombre',
      from: currentUser.firstname,
      to: profileData.firstname
    });
  }
  if (profileData.lastname !== currentUser.lastname) {
    changes.push({
      field: 'Apellido',
      from: currentUser.lastname,
      to: profileData.lastname
    });
  }
  if (profileData.email !== currentUser.email) {
    changes.push({
      field: 'Email',
      from: currentUser.email,
      to: profileData.email
    });
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Confirmar Actualización de Perfil
              </h2>
              <p className="text-gray-600">
                Revisa los cambios antes de guardar
              </p>
            </div>
          </div>
          <Button variant="ghost" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Changes List */}
        <div className="space-y-4 mb-6">
          {changes.length > 0 ? (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="w-5 h-5 text-blue-600" />
                <h3 className="font-medium text-blue-900">
                  Cambios detectados ({changes.length})
                </h3>
              </div>
              <div className="space-y-3">
                {changes.map((change, index) => (
                  <div key={index} className="bg-white rounded-md p-3 border border-blue-100">
                    <div className="text-sm">
                      <div className="font-medium text-gray-900 mb-1">
                        {change.field}
                      </div>
                      <div className="text-gray-600">
                        <span className="text-red-600 line-through">
                          {change.from}
                        </span>
                        <span className="mx-2">→</span>
                        <span className="text-green-600 font-medium">
                          {change.to}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                <p className="text-yellow-800">
                  No se detectaron cambios en tu perfil.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Warning for email change */}
        {changes.some(change => change.field === 'Email') && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-amber-800 mb-1">
                  ⚠️ Cambio de Email Detectado
                </p>
                <p className="text-amber-700">
                  Al cambiar tu email, será necesario que lo verifiques antes de poder 
                  utilizarlo para iniciar sesión. Asegúrate de que el nuevo email sea correcto.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isLoading || changes.length === 0}
            className="flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                Confirmar Cambios
              </>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ProfileUpdateModal;
