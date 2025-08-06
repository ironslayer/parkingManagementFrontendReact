// ==========================================
// TIPOS BASE
// ==========================================
export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// TIPOS DE AUTENTICACIÓN
// ==========================================
// ============================================================================
// AUTHENTICATION & USER TYPES
// ============================================================================

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: 'ADMIN' | 'OPERATOR'
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface AuthResponse {
  success: boolean
  data?: {
    user?: User
    token: string
    refreshToken: string
  }
  error?: string
}

export interface Permission {
  id: string
  name: string
  description: string
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  user: User;
  expiresIn: number;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// ==========================================
// TIPOS DE VEHÍCULOS
// ==========================================
export interface Vehicle extends BaseEntity {
  licensePlate: string;
  vehicleTypeId: number;        // Campo del backend
  vehicleType: VehicleType;     // Campo calculado para compatibilidad con UI
  brand?: string;
  model?: string;
  color?: string;
  ownerName?: string;
  ownerPhone?: string;
  isActive: boolean;
}

export type VehicleType = 'AUTO' | 'MOTOCICLETA';

export interface CreateVehicleRequest {
  licensePlate: string;
  vehicleTypeId: number;
  brand?: string;
  model?: string;
  color?: string;
  ownerName?: string;
  ownerPhone?: string;
}

export interface UpdateVehicleRequest extends Partial<CreateVehicleRequest> {
  id: string;
}

// ==========================================
// TIPOS DE SESIONES DE PARQUEO (HÍBRIDO - COMPATIBILIDAD)
// ==========================================
export interface ParkingSession extends BaseEntity {
  id: string;
  ticketCode?: string;              // ✅ Nuevo campo de API
  vehicleId?: string;               // ✅ Nuevo campo de API
  parkingSpaceId?: string;          // ✅ Nuevo campo de API
  licensePlate?: string;            // ✅ Nuevo campo de API
  vehicleType?: VehicleType;        // ✅ Nuevo campo de API
  spaceNumber?: string;             // ✅ Nuevo campo de API
  
  // Campos requeridos por la API actual
  vehicle: Vehicle;                 // ✅ Requerido - contiene datos del vehículo
  entryTime: string;
  exitTime?: string;
  status: SessionStatus;            // ✅ Requerido - estado de la sesión
  isActive?: boolean;               // ✅ Nuevo campo de API
  parkingSpot?: string;             // 🔄 Legacy - migrar a spaceNumber
  rate: number;                     // ✅ Requerido - tarifa por hora
  totalAmount?: number;             // 🔄 Legacy - calcular dinámicamente
  payment?: Payment;                // 🔄 Legacy - migrar a payment service
  operator?: User;                  // 🔄 Legacy - no en API response
  notes?: string;                   // 🔄 Legacy - no en API response
  
  // Campos nuevos para cálculos
  duration?: string;                // ✅ Calculado
  calculatedAmount?: number;        // ✅ Del payment service
}

export type SessionStatus = 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

export interface StartSessionRequest {
  licensePlate: string;             // ✅ Alineado con API real
  
  // Campos legacy (ignorados por API)
  vehicleLicensePlate?: string;     // 🔄 Legacy - usar licensePlate
  parkingSpot?: string;             // 🔄 Legacy - no usado por API
  notes?: string;                   // 🔄 Legacy - no usado por API
}

export interface EndSessionRequest {
  sessionId: string;                // ✅ Requerido por componente
  licensePlate: string;             // ✅ Alineado con API real
  exitTime: string;                 // ✅ Requerido por componente
  paymentMethod: PaymentMethod;     // ✅ Requerido por componente
  notes?: string;                   // ✅ Opcional
}

export interface EndSessionResponse {
  sessionId: number;
  vehicleId: number;
  entryTime: string;
  exitTime: string;
  duration: string;
  calculatedAmount: number;
  parkingSpace: {
    spaceNumber: string;
    isOccupied: boolean;
  };
}

// ==========================================
// TIPOS DE PAGOS
// ==========================================
export interface Payment extends BaseEntity {
  amount: number;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  transactionId?: string;
  parkingSession: ParkingSession;
  processedBy?: User;               // ✅ Opcional mientras no hay autenticación completa
  processedAt: string;
  notes?: string;
}

export type PaymentMethod = 'CASH' | 'CARD' | 'TRANSFER';
export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';

export interface ProcessPaymentRequest {
  sessionId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  transactionId?: string;
  notes?: string;
}

// ==========================================
// TIPOS DE REPORTES
// ==========================================
export interface DailyReport {
  date: string;
  totalSessions: number;
  activeSessions: number;
  completedSessions: number;
  totalRevenue: number;
  averageSessionDuration: number;
  vehicleTypeBreakdown: VehicleTypeStats[];
  hourlyStats: HourlyStats[];
}

export interface MonthlyReport {
  month: string;
  year: number;
  totalSessions: number;
  totalRevenue: number;
  averageDailyRevenue: number;
  averageSessionDuration: number;
  dailyStats: DailyStats[];
  vehicleTypeBreakdown: VehicleTypeStats[];
}

export interface VehicleTypeStats {
  vehicleType: VehicleType;
  count: number;
  revenue: number;
  percentage: number;
}

export interface HourlyStats {
  hour: number;
  sessions: number;
  revenue: number;
}

export interface DailyStats {
  date: string;
  sessions: number;
  revenue: number;
}

// ==========================================
// TIPOS DE API
// ==========================================
export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface ApiError {
  message: string;
  code: string;
  details?: Record<string, unknown>;
  timestamp: string;
}

// ==========================================
// TIPOS DE FORMULARIOS
// ==========================================
export interface FormState {
  isSubmitting: boolean;
  isValid: boolean;
  errors: Record<string, string>;
}

export interface PaginationParams {
  page: number;
  size: number;
  sort?: string;
  direction?: 'asc' | 'desc';
}

export interface FilterParams {
  search?: string;
  vehicleType?: VehicleType;
  status?: SessionStatus | PaymentStatus;
  dateFrom?: string;
  dateTo?: string;
}

// ==========================================
// TIPOS DE COMPONENTES
// ==========================================
export interface TableColumn<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  render?: (value: T[keyof T], row: T) => React.ReactNode;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

// ==========================================
// TIPOS DE ESTADO GLOBAL
// ==========================================
export interface RootState {
  auth: AuthState;
  vehicles: VehicleState;
  sessions: SessionState;
  payments: PaymentState;
  ui: UIState;
}

export interface VehicleState {
  vehicles: Vehicle[];
  currentVehicle: Vehicle | null;
  isLoading: boolean;
  error: string | null;
}

export interface SessionState {
  sessions: ParkingSession[];
  activeSessions: ParkingSession[];
  currentSession: ParkingSession | null;
  isLoading: boolean;
  error: string | null;
}

export interface PaymentState {
  payments: Payment[];
  currentPayment: Payment | null;
  isLoading: boolean;
  error: string | null;
}

export interface UIState {
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  notifications: Notification[];
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}
