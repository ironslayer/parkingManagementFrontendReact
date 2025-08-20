// ==========================================
// FORMULARIO DE USUARIO - CREAR/EDITAR OPERADORES
// ==========================================
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Eye, EyeOff } from 'lucide-react';
import { Button, Input, Card, LoadingSpinner } from '../ui';
import type { User as UserType } from '../../types';

// ==========================================
// SCHEMA DE VALIDACIÓN
// ==========================================
const userFormSchema = z.object({
  firstname: z
    .string()
    .min(1, 'El nombre es requerido')
    .max(50, 'El nombre no puede exceder 50 caracteres')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El nombre solo puede contener letras'),
  
  lastname: z
    .string()
    .min(1, 'El apellido es requerido')
    .max(50, 'El apellido no puede exceder 50 caracteres')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El apellido solo puede contener letras'),
  
  email: z
    .string()
    .min(1, 'El email es requerido')
    .email('Formato de email inválido')
    .max(100, 'El email no puede exceder 100 caracteres'),
  
  password: z
    .string()
    .min(5, 'La contraseña debe tener al menos 5 caracteres')
    .max(50, 'La contraseña no puede exceder 50 caracteres')
    .optional(),
  
  role: z
    .enum(['ADMIN', 'OPERATOR']),
  
  isActive: z
    .boolean()
});

type UserFormData = z.infer<typeof userFormSchema>;

// ==========================================
// VALORES POR DEFECTO
// ==========================================
const defaultValues: UserFormData = {
  firstname: '',
  lastname: '',
  email: '',
  password: '',
  role: 'OPERATOR',
  isActive: true
};

// ==========================================
// PROPS DEL COMPONENTE
// ==========================================
interface UserFormProps {
  user?: UserType;
  onSubmit: (data: UserFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  mode: 'create' | 'edit';
}

// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================
export const UserForm: React.FC<UserFormProps> = ({
  user,
  onSubmit,
  onCancel,
  isLoading = false,
  mode
}) => {
  const [showPassword, setShowPassword] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue
  } = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema),
    defaultValues
  });

  // ==========================================
  // LLENAR FORMULARIO EN MODO EDICIÓN
  // ==========================================
  useEffect(() => {
    if (mode === 'edit' && user) {
      setValue('firstname', user.firstName);
      setValue('lastname', user.lastName);
      setValue('email', user.email);
      setValue('role', user.role);
      setValue('isActive', user.isActive);
      // No establecer contraseña en modo edición
    }
  }, [mode, user, setValue]);

  // ==========================================
  // MANEJAR ENVÍO DEL FORMULARIO
  // ==========================================
  const handleFormSubmit = async (data: UserFormData) => {
    try {
      await onSubmit(data);
      if (mode === 'create') {
        reset(); // Limpiar formulario solo en modo creación
      }
    } catch (error) {
      // El error ya se maneja en el componente padre
      console.error('Error en formulario:', error);
    }
  };

  // ==========================================
  // TÍTULO DEL FORMULARIO
  // ==========================================
  const getTitle = () => {
    if (mode === 'create') return 'Crear Nuevo Operador';
    if (mode === 'edit') return 'Editar Usuario';
    return 'Formulario de Usuario';
  };

  const getSubtitle = () => {
    if (mode === 'create') return 'Complete los datos para crear un nuevo operador';
    if (mode === 'edit') return 'Modifique los datos del usuario seleccionado';
    return '';
  };

  // ==========================================
  // RENDER
  // ==========================================
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-100 rounded-lg">
            <User className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {getTitle()}
            </h2>
            <p className="text-sm text-gray-600">
              {getSubtitle()}
            </p>
          </div>
        </div>

        {/* Loading Spinner */}
        {isLoading && (
          <div className="flex justify-center py-8">
            <LoadingSpinner size="lg" />
          </div>
        )}

        {/* Formulario */}
        {!isLoading && (
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
            {/* Nombre y Apellido */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstname" className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre *
                </label>
                <Input
                  id="firstname"
                  type="text"
                  placeholder="Ej: Juan"
                  error={errors.firstname?.message}
                  {...register('firstname')}
                />
              </div>

              <div>
                <label htmlFor="lastname" className="block text-sm font-medium text-gray-700 mb-2">
                  Apellido *
                </label>
                <Input
                  id="lastname"
                  type="text"
                  placeholder="Ej: Pérez"
                  error={errors.lastname?.message}
                  {...register('lastname')}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <Input
                id="email"
                type="email"
                placeholder="operador@parking.com"
                error={errors.email?.message}
                {...register('email')}
                disabled={mode === 'edit'} // Email no editable en modo edición
              />
              {mode === 'edit' && (
                <p className="text-xs text-gray-500 mt-1">
                  El email no se puede modificar
                </p>
              )}
            </div>

            {/* Contraseña */}
            {mode === 'create' && (
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Contraseña *
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Mínimo 5 caracteres"
                    error={errors.password?.message}
                    {...register('password')}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  La contraseña debe tener al menos 5 caracteres
                </p>
              </div>
            )}

            {/* Rol */}
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                Rol *
              </label>
              <select
                id="role"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                {...register('role')}
              >
                <option value="OPERATOR">Operador</option>
                <option value="ADMIN">Administrador</option>
              </select>
              {errors.role && (
                <p className="text-sm text-red-600 mt-1">{errors.role.message}</p>
              )}
            </div>

            {/* Estado - Solo en modo edición */}
            {mode === 'edit' && (
              <div className="flex items-center gap-3">
                <input
                  id="isActive"
                  type="checkbox"
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  {...register('isActive')}
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                  Usuario activo
                </label>
              </div>
            )}

            {/* Información adicional para edición */}
            {mode === 'edit' && user && (
              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-900 mb-3">
                  Información del Usuario
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">ID:</span>
                    <div className="font-medium text-gray-900">{user.id}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Miembro desde:</span>
                    <div className="font-medium text-gray-900">
                      {new Date(user.createdAt).toLocaleDateString('es-ES')}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Botones */}
            <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
              <Button
                type="submit"
                variant="primary"
                disabled={isSubmitting}
                className="flex-1 sm:flex-none"
              >
                {isSubmitting ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    {mode === 'create' ? 'Creando...' : 'Guardando...'}
                  </>
                ) : (
                  <>
                    {mode === 'create' ? 'Crear Operador' : 'Guardar Cambios'}
                  </>
                )}
              </Button>
              
              <Button
                type="button"
                variant="secondary"
                onClick={onCancel}
                disabled={isSubmitting}
                className="flex-1 sm:flex-none"
              >
                Cancelar
              </Button>
            </div>
          </form>
        )}
      </div>
    </Card>
  );
};

export default UserForm;
