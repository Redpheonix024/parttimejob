// Service Worker Utilities

export const SW_UTILS = {
  // Check if service worker is supported
  isSupported: () => {
    return typeof window !== 'undefined' && 'serviceWorker' in navigator;
  },

  // Get current service worker registration
  getRegistration: async () => {
    if (!SW_UTILS.isSupported()) return null;
    return navigator.serviceWorker.getRegistration();
  },

  // Force update the service worker
  update: async () => {
    if (!SW_UTILS.isSupported()) return;
    const registration = await SW_UTILS.getRegistration();
    if (registration) {
      await registration.update();
    }
  },

  // Clear all caches
  clearCaches: async () => {
    if (!SW_UTILS.isSupported()) return;
    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames.map(cacheName => caches.delete(cacheName))
    );
    console.log('[SW] All caches cleared');
  },

  // Unregister service worker
  unregister: async () => {
    if (!SW_UTILS.isSupported()) return;
    const registration = await SW_UTILS.getRegistration();
    if (registration) {
      await registration.unregister();
      console.log('[SW] Service worker unregistered');
    }
  },

  // Send message to service worker
  postMessage: (message: any) => {
    if (!SW_UTILS.isSupported()) return;
    navigator.serviceWorker.controller?.postMessage(message);
  },

  // Skip waiting (force activate new service worker)
  skipWaiting: () => {
    SW_UTILS.postMessage({ type: 'SKIP_WAITING' });
  },

  // Reload page to activate new service worker
  reload: () => {
    window.location.reload();
  },

  // Check for updates and reload if needed
  checkForUpdates: async () => {
    if (!SW_UTILS.isSupported()) return;
    
    const registration = await SW_UTILS.getRegistration();
    if (registration) {
      await registration.update();
      
      // Listen for update
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New version available
              if (confirm('A new version is available. Reload to update?')) {
                SW_UTILS.reload();
              }
            }
          });
        }
      });
    }
  }
};

// Development utilities
export const DEV_UTILS = {
  // Clear service worker for development
  clearForDev: async () => {
    if (process.env.NODE_ENV === 'development') {
      await SW_UTILS.unregister();
      await SW_UTILS.clearCaches();
      console.log('[DEV] Service worker cleared for development');
    }
  },

  // Force reload for development
  forceReload: () => {
    if (process.env.NODE_ENV === 'development') {
      SW_UTILS.reload();
    }
  }
}; 