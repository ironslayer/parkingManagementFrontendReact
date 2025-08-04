// ==========================================
// RUTAS DE LA APLICACIÓN
// ==========================================
export const ROUTES = {
  // Autenticación
  LOGIN: '/login',
  
  // Dashboard
  DASHBOARD: '/',
  
  // Gestión de vehículos
  VEHICLES: '/vehicles',
  VEHICLES_NEW: '/vehicles/new',
  VEHICLES_EDIT: '/vehicles/:id/edit',
  
  // Gestión de sesiones
  SESSIONS: '/sessions',
  SESSIONS_ACTIVE: '/sessions/active',
  SESSIONS_NEW: '/sessions/new',
  SESSIONS_CHECKOUT: '/sessions/:id/checkout',
  
  // Gestión de pagos
  PAYMENTS: '/payments',
  PAYMENTS_HISTORY: '/payments/history',
  
  // Reportes
  REPORTS: '/reports',
  REPORTS_DAILY: '/reports/daily',
  REPORTS_MONTHLY: '/reports/monthly',
} as const;

// ==========================================
// CONFIGURACIÓN DE LA API
// ==========================================
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1',
  ENDPOINTS: {
    // Autenticación
    AUTH: {
      LOGIN: '/users/authenticate',
      LOGOUT: '/users/logout',
      PROFILE: '/users/profile',
      USER_BY_ID: (id: string) => `/users/${id}`,
      REGISTER: '/users/register',
      REGISTER_OPERATOR: '/users/register-operator',
    },
    
    // Vehículos
    VEHICLES: {
      BASE: '/vehicles',
      BY_ID: (id: string) => `/vehicles/${id}`,
      BY_PLATE: (plate: string) => `/vehicles/plate/${plate}`,
    },
    
    // Sesiones de parqueo
    SESSIONS: {
      BASE: '/parking-sessions',
      BY_ID: (id: string) => `/parking-sessions/${id}`,
      ACTIVE: '/parking-sessions/active',
      START: '/parking-sessions/start',
      END: '/parking-sessions/end',
      BY_VEHICLE: (licensePlate: string) => `/parking-sessions/vehicle/${licensePlate}`,
    },
    
    // Pagos
    PAYMENTS: {
      BASE: '/payments',
      BY_ID: (id: string) => `/payments/${id}`,
      CALCULATE: '/payments/calculate',
      PROCESS: '/payments/process',
    },
    
    // Dashboard
    DASHBOARD: {
      STATS: '/dashboard/stats',
      OCCUPANCY_HISTORY: '/dashboard/occupancy-history',
      REVENUE_REPORT: '/dashboard/revenue-report',
      POPULAR_HOURS: '/dashboard/popular-hours',
      VEHICLE_TYPE_STATS: '/dashboard/vehicle-type-stats',
      RECENT_SESSIONS: '/dashboard/recent-sessions',
    },
    
    // Configuración
    VEHICLE_TYPES: '/vehicle-types',
    PARKING_SPACES: '/parking-spaces',
    RATE_CONFIGS: '/rate-configs',
    
    // Reportes
    REPORTS: {
      DAILY: '/reports/daily',
      MONTHLY: '/reports/monthly',
      REVENUE: '/reports/revenue',
    },
  },
} as const;

// ==========================================
// CONFIGURACIÓN DE PERMISOS
// ==========================================
export const PERMISSIONS = {
  // Roles del sistema
  ROLES: {
    ADMIN: 'ADMIN',
    OPERATOR: 'OPERATOR',
    CUSTOMER: 'CUSTOMER',
    USER: 'USER', // Alias para CUSTOMER
  },
  
  // Acciones permitidas por rol
  ACTIONS: {
    // Dashboard
    VIEW_DASHBOARD: ['ADMIN', 'OPERATOR'],
    
    // Vehículos
    VIEW_VEHICLES: ['ADMIN', 'OPERATOR', 'CUSTOMER'],
    CREATE_VEHICLE: ['ADMIN', 'OPERATOR', 'CUSTOMER'],
    EDIT_VEHICLE: ['ADMIN', 'OPERATOR', 'CUSTOMER'],
    DELETE_VEHICLE: ['ADMIN', 'OPERATOR'],
    
    // Sesiones
    VIEW_SESSIONS: ['ADMIN', 'OPERATOR', 'CUSTOMER'],
    CREATE_SESSION: ['ADMIN', 'OPERATOR'],
    END_SESSION: ['ADMIN', 'OPERATOR'],
    
    // Pagos
    VIEW_PAYMENTS: ['ADMIN', 'OPERATOR'],
    PROCESS_PAYMENT: ['ADMIN', 'OPERATOR'],
    
    // Reportes
    VIEW_REPORTS: ['ADMIN'],
    EXPORT_REPORTS: ['ADMIN'],
  },
} as const;

// ==========================================
// CONFIGURACIÓN DE LA APLICACIÓN
// ==========================================
export const APP_CONFIG = {
  NAME: 'Sistema de Gestión de Parqueadero',
  VERSION: '1.0.0',
  
  // Configuración de paginación
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 10,
    PAGE_SIZE_OPTIONS: [5, 10, 20, 50],
  },
  
  // Configuración de fechas
  DATE_FORMAT: 'dd/MM/yyyy',
  TIME_FORMAT: 'HH:mm',
  DATETIME_FORMAT: 'dd/MM/yyyy HH:mm',
  
  // Configuración de moneda
  CURRENCY: {
    SYMBOL: '$',
    CODE: 'COP',
    LOCALE: 'es-CO',
  },
  
  // Configuración de tarifas (ejemplo)
  PRICING: {
    CAR_HOURLY_RATE: 2000,
    MOTORCYCLE_HOURLY_RATE: 1000,
    TRUCK_HOURLY_RATE: 3000,
  },
} as const;

// ==========================================
// ESTADOS DE LA APLICACIÓN
// ==========================================
export const STATUS = {
  VEHICLE_TYPES: {
    CAR: 'CAR',
    MOTORCYCLE: 'MOTORCYCLE', 
    TRUCK: 'TRUCK',
  },
  
  SESSION_STATUS: {
    ACTIVE: 'ACTIVE',
    COMPLETED: 'COMPLETED',
    CANCELLED: 'CANCELLED',
  },
  
  PAYMENT_STATUS: {
    PENDING: 'PENDING',
    COMPLETED: 'COMPLETED',
    FAILED: 'FAILED',
    REFUNDED: 'REFUNDED',
  },
  
  PAYMENT_METHODS: {
    CASH: 'CASH',
    CARD: 'CARD',
    TRANSFER: 'TRANSFER',
  },
} as const;
