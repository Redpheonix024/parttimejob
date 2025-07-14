// Development debugging utilities

export const DEV_DEBUG = {
  // Log component loading
  logComponentLoad: (componentName: string) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DEV] Loading component: ${componentName}`);
    }
  },

  // Log import attempts
  logImportAttempt: (moduleName: string) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DEV] Attempting to import: ${moduleName}`);
    }
  },

  // Log import success
  logImportSuccess: (moduleName: string) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DEV] Successfully imported: ${moduleName}`);
    }
  },

  // Log import failure
  logImportFailure: (moduleName: string, error: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`[DEV] Failed to import ${moduleName}:`, error);
    }
  },

  // Safe require with logging
  safeRequire: (moduleName: string) => {
    DEV_DEBUG.logImportAttempt(moduleName);
    try {
      const module = require(moduleName);
      DEV_DEBUG.logImportSuccess(moduleName);
      return module;
    } catch (error) {
      DEV_DEBUG.logImportFailure(moduleName, error);
      return null;
    }
  },

  // Safe dynamic import with logging
  safeImport: async (moduleName: string) => {
    DEV_DEBUG.logImportAttempt(moduleName);
    try {
      const module = await import(moduleName);
      DEV_DEBUG.logImportSuccess(moduleName);
      return module;
    } catch (error) {
      DEV_DEBUG.logImportFailure(moduleName, error);
      return null;
    }
  },

  // Check if module is available
  isModuleAvailable: (moduleName: string): boolean => {
    try {
      require.resolve(moduleName);
      return true;
    } catch {
      return false;
    }
  },

  // Get module info
  getModuleInfo: (moduleName: string) => {
    try {
      const module = require(moduleName);
      return {
        available: true,
        exports: Object.keys(module),
        default: module.default ? 'Available' : 'Not available'
      };
    } catch (error) {
      return {
        available: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  },

  // Debug webpack chunks
  debugChunks: () => {
    if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
      console.log('[DEV] Webpack chunks:', (window as any).__webpack_require__?.c);
    }
  },

  // Debug module loading
  debugModuleLoading: () => {
    if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
      const originalRequire = (window as any).__webpack_require__;
      if (originalRequire) {
        (window as any).__webpack_require__ = function(moduleId: any) {
          console.log('[DEV] Loading module:', moduleId);
          try {
            return originalRequire(moduleId);
          } catch (error) {
            console.error('[DEV] Module load error:', moduleId, error);
            throw error;
          }
        };
      }
    }
  }
};

// Global error handler for development
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    console.error('[DEV] Global error:', {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      error: event.error
    });
  });

  window.addEventListener('unhandledrejection', (event) => {
    console.error('[DEV] Unhandled promise rejection:', {
      reason: event.reason,
      promise: event.promise
    });
  });
} 