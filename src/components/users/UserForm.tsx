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
const createUserFormSchema = z.object({
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
    .regex(/^(?=.*[a-zA-Z])(?=.*[0-9!@#$%^&*()_+=\-{}[\]|\\:";'<>?,./]).*$/, 'La contraseña debe contener al menos una letra y un número o carácter especial (incluyendo _)'),
  
  role: z
    .enum(['ADMIN', 'OPERATOR']),
  
  isActive: z
    .boolean()
});

const editUserFormSchema = z.object({
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
  
  role: z
    .enum(['ADMIN', 'OPERATOR'])
});

type CreateUserFormData = z.infer<typeof createUserFormSchema>;
type EditUserFormData = z.infer<typeof editUserFormSchema>;

// ==========================================
// VALORES POR DEFECTO
// ==========================================
const createDefaultValues: CreateUserFormData = {
  firstname: '',
  lastname: '',
  email: '',
  password: '',
  role: 'OPERATOR',
  isActive: true
};

const editDefaultValues: EditUserFormData = {
  firstname: '',
  lastname: '',
  email: '',
  role: 'OPERATOR'
};

// ==========================================
// PROPS DEL COMPONENTE
// ==========================================
interface UserFormProps {
  user?: UserType;
  onSubmit: (data: CreateUserFormData | EditUserFormData) => Promise<void>;
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
  if (mode === 'create') {
    return <CreateUserForm onSubmit={onSubmit} onCancel={onCancel} isLoading={isLoading} />;
  } else {
    return <EditUserForm user={user} onSubmit={onSubmit} onCancel={onCancel} isLoading={isLoading} />;
  }
};

// ==========================================
// COMPONENTE PARA CREAR USUARIO
// ==========================================
const CreateUserForm: React.FC<{
  onSubmit: (data: CreateUserFormData) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}> = ({ onSubmit, onCancel, isLoading }) => {
  const [showPassword, setShowPassword] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserFormSchema),
    defaultValues: createDefaultValues
  });

  console.log('🔄 CreateUserForm render - isSubmitting:', isSubmitting);
  console.log('🔍 Errores de validación:', errors);

  // ==========================================
  // FUNCIÓN DE ENVÍO
  // ==========================================
  const handleFormSubmit = async (data: CreateUserFormData) => {
    console.log('🚀 Datos del formulario de creación:', data);
    try {
      await onSubmit(data);
      reset();
    } catch (error) {
      console.error('❌ Error al crear usuario:', error);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <div className="p-6">
        <div className="flex items-center mb-6">
          <User className="w-6 h-6 text-blue-600 mr-3" />
          <h2 className="text-xl font-semibold text-gray-900">Crear Nuevo Usuario</h2>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nombre */}
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

            {/* Apellido */}
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
              placeholder="Ej: juan.perez@empresa.com"
              error={errors.email?.message}
              {...register('email')}
            />
          </div>

          {/* Contraseña */}
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
              La contraseña debe tener al menos 5 caracteres, incluyendo caracteres especiales
            </p>
          </div>

          {/* Rol */}
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
              Rol *
            </label>
            <select
              id="role"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              {...register('role')}
            >
              <option value="OPERATOR">Operador</option>
              <option value="ADMIN">Administrador</option>
            </select>
            {errors.role && (
              <p className="text-sm text-red-600 mt-1">{errors.role.message}</p>
            )}
          </div>

          {/* Estado Activo */}
          <div className="flex items-center">
            <input
              id="isActive"
              type="checkbox"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              {...register('isActive')}
            />
            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
              Usuario activo
            </label>
          </div>

          {/* Botones */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="secondary"
              onClick={onCancel}
              disabled={isSubmitting || isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || isLoading}
            >
              {isSubmitting || isLoading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Creando...
                </>
              ) : (
                'Crear Usuario'
              )}
            </Button>
          </div>
        </form>
      </div>
    </Card>
  );
};

// ==========================================
// COMPONENTE PARA EDITAR USUARIO
// ==========================================
const EditUserForm: React.FC<{
  user?: UserType;
  onSubmit: (data: EditUserFormData) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}> = ({ user, onSubmit, onCancel, isLoading }) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue
  } = useForm<EditUserFormData>({
    resolver: zodResolver(editUserFormSchema),
    defaultValues: editDefaultValues
  });

  console.log('🔄 EditUserForm render - isSubmitting:', isSubmitting);
  console.log('🔍 Errores de validación:', errors);

  // ==========================================
  // LLENAR FORMULARIO CON DATOS DEL USUARIO
  // ==========================================
  useEffect(() => {
    if (user) {
      setValue('firstname', user.firstname);
      setValue('lastname', user.lastname);
      setValue('email', user.email);
      setValue('role', user.role);
      // isActive se maneja a través del botón de estado en la tabla
    }
  }, [user, setValue]);

  // ==========================================
  // FUNCIÓN DE ENVÍO
  // ==========================================
  const handleFormSubmit = async (data: EditUserFormData) => {
    console.log('🚀 Datos del formulario de edición:', data);
    try {
      await onSubmit(data);
    } catch (error) {
      console.error('❌ Error al actualizar usuario:', error);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <div className="p-6">
        <div className="flex items-center mb-6">
          <User className="w-6 h-6 text-blue-600 mr-3" />
          <h2 className="text-xl font-semibold text-gray-900">Editar Usuario</h2>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nombre */}
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

            {/* Apellido */}
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
              placeholder="Ej: juan.perez@empresa.com"
              error={errors.email?.message}
              {...register('email')}
            />
          </div>

          {/* Rol */}
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
              Rol *
            </label>
            <select
              id="role"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              {...register('role')}
            >
              <option value="OPERATOR">Operador</option>
              <option value="ADMIN">Administrador</option>
            </select>
            {errors.role && (
              <p className="text-sm text-red-600 mt-1">{errors.role.message}</p>
            )}
          </div>

          {/* Botones */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="secondary"
              onClick={onCancel}
              disabled={isSubmitting || isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || isLoading}
            >
              {isSubmitting || isLoading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Guardando cambios...
                </>
              ) : (
                'Guardar Cambios'
              )}
            </Button>
          </div>
        </form>
      </div>
    </Card>
  );
};
