// ==========================================
// MODAL DE CONFIRMACIÓN DE ÉXITO
// ==========================================
import React from 'react';
import { CheckCircle } from 'lucide-react';
import { Modal, Button } from '../ui';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  icon?: React.ReactNode;
}

export const SuccessModal: React.FC<SuccessModalProps> = ({
  isOpen,
  onClose,
  title,
  message,
  icon
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <div className="p-6 text-center">
        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-green-100 rounded-full">
            {icon || <CheckCircle className="w-8 h-8 text-green-600" />}
          </div>
        </div>

        {/* Content */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {title}
          </h2>
          <p className="text-gray-600">
            {message}
          </p>
        </div>

        {/* Action */}
        <Button onClick={onClose} className="w-full">
          Entendido
        </Button>
      </div>
    </Modal>
  );
};

export default SuccessModal;
