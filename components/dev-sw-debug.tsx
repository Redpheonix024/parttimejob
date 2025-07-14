"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { SW_UTILS, DEV_UTILS } from '@/utils/sw-utils';

export default function DevSWDebug() {
  const [swStatus, setSwStatus] = useState<string>('Checking...');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      checkSWStatus();
    }
  }, []);

  const checkSWStatus = async () => {
    if (!SW_UTILS.isSupported()) {
      setSwStatus('Not supported');
      return;
    }

    const registration = await SW_UTILS.getRegistration();
    if (registration) {
      setSwStatus(`Active (${registration.active ? 'Yes' : 'No'})`);
    } else {
      setSwStatus('Not registered');
    }
  };

  const handleClearCache = async () => {
    await SW_UTILS.clearCaches();
    await checkSWStatus();
  };

  const handleUnregister = async () => {
    await SW_UTILS.unregister();
    await checkSWStatus();
  };

  const handleUpdate = async () => {
    await SW_UTILS.update();
    await checkSWStatus();
  };

  const handleReload = () => {
    SW_UTILS.reload();
  };

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Button
        onClick={() => setIsVisible(!isVisible)}
        variant="outline"
        size="sm"
        className="mb-2"
      >
        SW Debug
      </Button>
      
      {isVisible && (
        <div className="bg-background border rounded-lg p-4 shadow-lg min-w-[300px]">
          <h3 className="font-semibold mb-2">Service Worker Debug</h3>
          <p className="text-sm mb-3">Status: {swStatus}</p>
          
          <div className="space-y-2">
            <Button
              onClick={handleClearCache}
              variant="outline"
              size="sm"
              className="w-full"
            >
              Clear Cache
            </Button>
            
            <Button
              onClick={handleUpdate}
              variant="outline"
              size="sm"
              className="w-full"
            >
              Check for Updates
            </Button>
            
            <Button
              onClick={handleUnregister}
              variant="outline"
              size="sm"
              className="w-full"
            >
              Unregister SW
            </Button>
            
            <Button
              onClick={handleReload}
              variant="outline"
              size="sm"
              className="w-full"
            >
              Force Reload
            </Button>
          </div>
        </div>
      )}
    </div>
  );
} 