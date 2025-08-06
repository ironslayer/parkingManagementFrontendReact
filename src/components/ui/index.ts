// ==========================================
// EXPORTACIONES DE COMPONENTES UI
// ==========================================

// Componentes básicos
export { Button } from './Button';
export type { ButtonProps } from './Button';

export { Input } from './Input';
export type { InputProps } from './Input';

export { Card, CardHeader, CardContent, CardFooter } from './Card';
export type { CardProps, CardHeaderProps, CardContentProps, CardFooterProps } from './Card';

export { Badge, VehicleTypeBadge, SessionStatusBadge, PaymentStatusBadge } from './Badge';
export type { BadgeProps } from './Badge';

export { LoadingSpinner } from './LoadingSpinner';

export { Modal, ModalHeader, ModalFooter } from './Modal';

export { Table } from './Table';
export type { TableProps, TableColumn, PaginationProps } from './Table';

export { ResponsiveTable } from './ResponsiveTable';
export type { ResponsiveTableProps, ResponsiveTableColumn } from './ResponsiveTable';

export { ToggleSwitch } from './ToggleSwitch';
export type { ToggleSwitchProps } from './ToggleSwitch';

export { Notification, NotificationContainer } from './Notification';
export type { NotificationProps, NotificationType } from './Notification';

// Componentes de autenticación y permisos
export { PermissionGate, AdminOnly, StaffOnly, CanDeleteVehicles, CanManageUsers, CanProcessPayments } from '../auth/PermissionGate';
