// ==========================================
// TIPOS DE AUTENTICACIÓN Y PERMISOS
// ==========================================

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  permissions: string[];
  isActive: boolean;
  firstName?: string;
  lastName?: string;
  createdAt: string;
  updatedAt: string;
}

export type UserRole = 'ADMIN' | 'OPERATOR';

export interface DecodedToken {
  user: User;
  exp: number;
  iat: number;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
  expiresIn: number;
}

// ==========================================
// MATRIZ DE PERMISOS
// ==========================================
export const PERMISSIONS_MATRIX: Record<string, UserRole[]> = {
  // Vehicle Management - Según documentación backend
  'vehicles:create': ['ADMIN', 'OPERATOR'],
  'vehicles:read': ['ADMIN', 'OPERATOR'],
  'vehicles:update': ['ADMIN', 'OPERATOR'],
  'vehicles:delete': ['ADMIN'], // ⚠️ Solo ADMIN puede eliminar
  
  // Parking Sessions
  'sessions:create': ['ADMIN', 'OPERATOR'],
  'sessions:read': ['ADMIN', 'OPERATOR'],
  'sessions:end': ['ADMIN', 'OPERATOR'],
  'sessions:cancel': ['ADMIN'],
  
  // Payments
  'payments:calculate': ['ADMIN', 'OPERATOR'],
  'payments:process': ['ADMIN', 'OPERATOR'],
  'payments:read': ['ADMIN', 'OPERATOR'],
  'payments:refund': ['ADMIN'],
  
  // Reports & Dashboard - Con restricciones según backend
  'dashboard:overview': ['ADMIN', 'OPERATOR'],
  'reports:occupancy': ['ADMIN', 'OPERATOR'],
  'reports:revenue': ['ADMIN', 'OPERATOR'],
  'reports:detailed': ['ADMIN'], // Solo ADMIN reportes históricos
  
  // Configuration - Solo ADMIN
  'config:vehicle_types': ['ADMIN'],
  'config:rate_configs': ['ADMIN'],
  'config:parking_spaces': ['ADMIN'],
  'config:users': ['ADMIN'], // Solo ADMIN puede gestionar usuarios
};

// ==========================================
// ROLES Y DESCRIPCIONES
// ==========================================
export const USER_ROLES: Record<UserRole, { level: number; permissions: string[]; description: string }> = {
  ADMIN: {
    level: 2,
    permissions: ['ALL_PERMISSIONS'],
    description: 'Acceso completo al sistema - Administración total'
  },
  OPERATOR: {
    level: 1,
    permissions: [
      'VEHICLE_MANAGEMENT',
      'PARKING_SESSIONS',
      'PAYMENT_PROCESSING',
      'DASHBOARD_VIEW',
      'BASIC_REPORTS'
    ],
    description: 'Operaciones diarias del parqueadero'
  }
};
