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
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
  ENDPOINTS: {
    // Autenticación
    AUTH: {
      LOGIN: '/auth/authenticate',
      REFRESH: '/auth/refresh',
      LOGOUT: '/auth/logout',
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
      END: (id: string) => `/parking-sessions/${id}/end`,
    },
    
    // Pagos
    PAYMENTS: {
      BASE: '/payments',
      BY_ID: (id: string) => `/payments/${id}`,
      BY_SESSION: (sessionId: string) => `/payments/session/${sessionId}`,
    },
    
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
  },
  
  // Acciones permitidas por rol
  ACTIONS: {
    // Dashboard
    VIEW_DASHBOARD: ['ADMIN', 'OPERATOR'],
    
    // Vehículos
    VIEW_VEHICLES: ['ADMIN', 'OPERATOR'],
    CREATE_VEHICLE: ['ADMIN', 'OPERATOR'],
    EDIT_VEHICLE: ['ADMIN', 'OPERATOR'],
    DELETE_VEHICLE: ['ADMIN'],
    
    // Sesiones
    VIEW_SESSIONS: ['ADMIN', 'OPERATOR'],
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
