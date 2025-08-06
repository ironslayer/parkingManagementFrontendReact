// ==========================================
// SISTEMA DE LOGGING PROFESIONAL
// ==========================================

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogConfig {
  enabled: boolean;
  level: LogLevel;
  modules: {
    auth: boolean;
    permissions: boolean;
    api: boolean;
  };
}

// Configuración de logging (solo para desarrollo)
const LOG_CONFIG: LogConfig = {
  enabled: process.env.NODE_ENV === 'development',
  level: 'debug',
  modules: {
    auth: false,        // Cambiar a true solo cuando necesites debuggear auth
    permissions: false, // Cambiar a true solo cuando necesites debuggear permisos
    api: true,         // Mantener logs de API importantes
  },
};

class Logger {
  private static instance: Logger;
  private config = LOG_CONFIG;

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private shouldLog(module: keyof LogConfig['modules']): boolean {
    return this.config.enabled && this.config.modules[module];
  }

  debug(module: keyof LogConfig['modules'], message: string, data?: unknown) {
    if (this.shouldLog(module)) {
      console.log(`🔍 [${module.toUpperCase()}] ${message}`, data || '');
    }
  }

  info(module: keyof LogConfig['modules'], message: string, data?: unknown) {
    if (this.shouldLog(module)) {
      console.info(`ℹ️ [${module.toUpperCase()}] ${message}`, data || '');
    }
  }

  warn(module: keyof LogConfig['modules'], message: string, data?: unknown) {
    if (this.shouldLog(module)) {
      console.warn(`⚠️ [${module.toUpperCase()}] ${message}`, data || '');
    }
  }

  error(module: keyof LogConfig['modules'], message: string, data?: unknown) {
    if (this.shouldLog(module)) {
      console.error(`❌ [${module.toUpperCase()}] ${message}`, data || '');
    }
  }
}

export const logger = Logger.getInstance();
