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
  role: 'ADMIN' | 'OPERATOR' | 'USER'
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
  vehicleType: VehicleType;
  brand?: string;
  model?: string;
  color?: string;
  ownerName?: string;
  ownerPhone?: string;
  ownerEmail?: string;
  isActive: boolean;
}

export type VehicleType = 'CAR' | 'MOTORCYCLE' | 'TRUCK';

export interface CreateVehicleRequest {
  licensePlate: string;
  vehicleType: VehicleType;
  brand?: string;
  model?: string;
  color?: string;
  ownerName?: string;
  ownerPhone?: string;
  ownerEmail?: string;
}

export interface UpdateVehicleRequest extends Partial<CreateVehicleRequest> {
  id: string;
}

// ==========================================
// TIPOS DE SESIONES DE PARQUEO
// ==========================================
export interface ParkingSession extends BaseEntity {
  id: string;
  vehicle: Vehicle;
  entryTime: string;
  exitTime?: string;
  status: SessionStatus;
  parkingSpot?: string;
  rate: number;
  totalAmount?: number;
  payment?: Payment;
  operator: User;
  notes?: string;
}

export type SessionStatus = 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

export interface StartSessionRequest {
  vehicleLicensePlate: string;
  parkingSpot?: string;
  notes?: string;
}

export interface EndSessionRequest {
  sessionId: string;
  exitTime: string;
  paymentMethod: PaymentMethod;
  notes?: string;
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
  processedBy: User;
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
