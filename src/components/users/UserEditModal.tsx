// ==========================================
// MODAL PARA EDICIÓN DE USUARIOS
// ==========================================
import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Modal } from '../ui';
import { UserForm } from './UserForm';
import type { User } from '../../types';

interface UserFormData {
  firstname: string;
  lastname: string;
  email: string;
  password?: string;
  role: 'ADMIN' | 'OPERATOR';
}

interface UserEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onSubmit: (data: UserFormData) => Promise<void>;
  isLoading?: boolean;
}

export const UserEditModal: React.FC<UserEditModalProps> = ({
  isOpen,
  onClose,
  user,
  onSubmit,
  isLoading = false
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: UserFormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
      onClose();
    } catch (error) {
      console.error('Error al guardar usuario:', error);
      // No cerrar el modal para mostrar el error
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title=""
      size="lg"
      showCloseButton={false}
    >
      <div className="relative">
        {/* Botón de cierre personalizado */}
        <button
          onClick={handleClose}
          disabled={isSubmitting}
          className="absolute top-4 right-4 z-10 p-2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Formulario de usuario */}
        <UserForm
          user={user || undefined}
          onSubmit={handleSubmit}
          onCancel={handleClose}
          isLoading={isLoading || isSubmitting}
          mode="edit"
        />
      </div>
    </Modal>
  );
};

export default UserEditModal;
