"use client";

import { useEffect } from 'react';

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      const registerSW = async () => {
        try {
          const registration = await navigator.serviceWorker.register('/sw.js', {
            scope: '/',
          });

          console.log('[SW] Registration successful:', registration);

          // Handle service worker updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New service worker is available
                  console.log('[SW] New version available');
                  
                  // You can show a notification to the user here
                  if (confirm('A new version is available. Reload to update?')) {
                    window.location.reload();
                  }
                }
              });
            }
          });

          // Handle service worker activation
          navigator.serviceWorker.addEventListener('controllerchange', () => {
            console.log('[SW] Controller changed - new service worker activated');
          });

        } catch (error) {
          console.error('[SW] Registration failed:', error);
        }
      };

      registerSW();
    }
  }, []);

  return null; // This component doesn't render anything
} 