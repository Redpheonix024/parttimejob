"use client";

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

export default function ServiceWorkerRegister() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      // Register service worker
      const registerSW = async () => {
        try {
          const reg = await navigator.serviceWorker.register('/sw.js', {
            scope: '/',
            updateViaCache: 'none',
          });

          console.log('[SW] Registration successful:', reg);
          setRegistration(reg);

          // Check for updates immediately
          reg.update().catch(err => 
            console.log('[SW] Update check failed:', err)
          );

          // Listen for updates
          reg.addEventListener('updatefound', () => {
            const newWorker = reg.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                // When the new service worker is installed
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  console.log('[SW] New version available');
                  setUpdateAvailable(true);
                  
                  // Show update toast
                  toast({
                    title: 'Update available',
                    description: 'A new version of the app is available.',
                    action: (
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          if (newWorker.state === 'installed') {
                            newWorker.postMessage({ type: 'SKIP_WAITING' });
                          }
                        }}
                      >
                        Update now
                      </Button>
                    ),
                  });
                }
              });
            }
          });

          // Listen for controller change (when a new service worker takes over)
          navigator.serviceWorker.addEventListener('controllerchange', () => {
            console.log('[SW] Controller changed - new service worker activated');
            window.location.reload();
          });

          // Check for updates every hour
          const updateInterval = setInterval(() => {
            reg.update().catch(err => 
              console.log('[SW] Background update check failed:', err)
            );
          }, 60 * 60 * 1000);

          return () => clearInterval(updateInterval);

        } catch (error) {
          console.error('[SW] Registration failed:', error);
          toast({
            variant: "destructive",
            title: "Service Worker Error",
            description: "Failed to register service worker. Some features may not be available offline.",
          });
        }
      };

      // Listen for messages from the service worker
      const handleMessage = (event: MessageEvent) => {
        if (event.data && event.data.type === 'CACHE_UPDATED') {
          console.log('[SW] Cache updated:', event.data.payload);
          toast({
            title: 'Content updated',
            description: 'New content is available and will be used when you next visit this page.',
          });
        }
      };

      // Add event listener for messages
      navigator.serviceWorker.addEventListener('message', handleMessage);
      
      // Register the service worker
      registerSW();

      // Cleanup
      return () => {
        navigator.serviceWorker.removeEventListener('message', handleMessage);
      };
    }
  }, []);

  // Force update if user clicks the update button
  const handleUpdate = () => {
    if (registration && registration.waiting) {
      // Tell service worker to skip waiting and activate
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
  };

  return null; // This component doesn't render anything
}