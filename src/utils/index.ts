import { format, parseISO, differenceInMinutes, differenceInHours } from 'date-fns';
import { es } from 'date-fns/locale';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { APP_CONFIG } from '../constants';

// ==========================================
// UTILIDADES DE CSS/CLASES
// ==========================================
/**
 * Combina clases de CSS con soporte para Tailwind CSS
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ==========================================
// UTILIDADES DE FECHAS
// ==========================================
/**
 * Formatea una fecha a string legible
 */
export function formatDate(date: string | Date, formatStr: string = APP_CONFIG.DATE_FORMAT): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, formatStr, { locale: es });
}

/**
 * Formatea una fecha y hora
 */
export function formatDateTime(date: string | Date): string {
  return formatDate(date, APP_CONFIG.DATETIME_FORMAT);
}

/**
 * Formatea solo la hora
 */
export function formatTime(date: string | Date): string {
  return formatDate(date, APP_CONFIG.TIME_FORMAT);
}

/**
 * Calcula la duración entre dos fechas en minutos
 */
export function calculateDurationInMinutes(startTime: string, endTime: string): number {
  const start = parseISO(startTime);
  const end = parseISO(endTime);
  return differenceInMinutes(end, start);
}

/**
 * Calcula la duración entre dos fechas en horas
 */
export function calculateDurationInHours(startTime: string, endTime: string): number {
  const start = parseISO(startTime);
  const end = parseISO(endTime);
  return differenceInHours(end, start);
}

/**
 * Formatea duración en minutos a formato legible
 */
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (hours === 0) {
    return `${remainingMinutes} min`;
  }
  
  if (remainingMinutes === 0) {
    return `${hours}h`;
  }
  
  return `${hours}h ${remainingMinutes}min`;
}

// ==========================================
// UTILIDADES DE MONEDA
// ==========================================
/**
 * Formatea un número como moneda
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat(APP_CONFIG.CURRENCY.LOCALE, {
    style: 'currency',
    currency: APP_CONFIG.CURRENCY.CODE,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Calcula el costo de parqueo basado en duración y tarifa
 */
export function calculateParkingCost(durationInMinutes: number, hourlyRate: number): number {
  const hours = Math.ceil(durationInMinutes / 60); // Redondea hacia arriba
  return hours * hourlyRate;
}

// ==========================================
// UTILIDADES DE VALIDACIÓN
// ==========================================
/**
 * Valida formato de placa colombiana
 */
export function validateLicensePlate(plate: string): boolean {
  // Formato colombiano: ABC-123 o ABC123
  const pattern = /^[A-Z]{3}-?\d{3}$/;
  return pattern.test(plate.toUpperCase());
}

/**
 * Valida email
 */
export function validateEmail(email: string): boolean {
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return pattern.test(email);
}

/**
 * Valida teléfono colombiano
 */
export function validatePhone(phone: string): boolean {
  // Formato: +57 XXX XXX XXXX o 3XX XXX XXXX
  const pattern = /^(\+57\s?)?[3][0-9]{2}\s?[0-9]{3}\s?[0-9]{4}$/;
  return pattern.test(phone.replace(/\s/g, ''));
}

// ==========================================
// UTILIDADES DE STRING
// ==========================================
/**
 * Capitaliza la primera letra de cada palabra
 */
export function capitalize(str: string): string {
  return str.replace(/\w\S*/g, (txt) => 
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
}

/**
 * Genera un ID único simple
 */
export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

/**
 * Trunca un string a un número máximo de caracteres
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength - 3) + '...';
}

// ==========================================
// UTILIDADES DE ARRAYS
// ==========================================
/**
 * Ordena un array por una propiedad específica
 */
export function sortBy<T>(array: T[], key: keyof T, direction: 'asc' | 'desc' = 'asc'): T[] {
  return [...array].sort((a, b) => {
    const aValue = a[key];
    const bValue = b[key];
    
    if (aValue < bValue) return direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return direction === 'asc' ? 1 : -1;
    return 0;
  });
}

/**
 * Filtra un array basado en múltiples criterios
 */
export function filterBy<T>(
  array: T[], 
  filters: Partial<Record<keyof T, unknown>>
): T[] {
  return array.filter(item => {
    return Object.entries(filters).every(([key, value]) => {
      if (value === undefined || value === null || value === '') return true;
      const itemValue = item[key as keyof T];
      
      if (typeof value === 'string' && typeof itemValue === 'string') {
        return itemValue.toLowerCase().includes(value.toLowerCase());
      }
      
      return itemValue === value;
    });
  });
}

// ==========================================
// UTILIDADES DE ALMACENAMIENTO LOCAL
// ==========================================
/**
 * Guarda datos en localStorage de forma segura
 */
export function setLocalStorage(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
}

/**
 * Obtiene datos de localStorage de forma segura
 */
export function getLocalStorage<T>(key: string): T | null {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return null;
  }
}

/**
 * Remueve datos de localStorage
 */
export function removeLocalStorage(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Error removing from localStorage:', error);
  }
}

// ==========================================
// UTILIDADES DE ERRORES
// ==========================================
/**
 * Extrae mensaje de error de diferentes tipos de errores
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message);
  }
  
  return 'Ha ocurrido un error inesperado';
}

// ==========================================
// UTILIDADES DE DEBOUNCE
// ==========================================
/**
 * Función debounce para optimizar búsquedas
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
