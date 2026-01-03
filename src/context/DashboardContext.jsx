import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import authService from '../services/authService';
import syncService from '../services/syncService';
import { Device } from '@capacitor/device';

const DashboardContext = createContext(null);

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within DashboardProvider');
  }
  return context;
};

export const DashboardProvider = ({ children }) => {
  const [initialized, setInitialized] = useState(false);
  const [user, setUser] = useState(null);
  const [isNative, setIsNative] = useState(false);
  const initRef = useRef(false);

  // Initialize ONCE when provider mounts
  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    const initializeDashboard = async () => {
      try {
        console.log('🚀 DashboardContext: Starting global initialization...');

        // 1. Check if native
        const deviceInfo = await Device.getInfo();
        const native = deviceInfo.platform !== 'web';
        setIsNative(native);
        console.log(`📱 Platform: ${native ? 'Native' : 'Web'}`);

        // 2. Initialize auth
        await authService.initialize();
        await syncService.initialize();
        const currentUser = authService.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
          console.log('✅ Auth initialized:', currentUser.userId || currentUser.email);
        }

        // 3. Start sync service (doesn't block)
        syncService.startAuthCheck();
        console.log('✅ Sync service started');

        setInitialized(true);
        console.log('✅ Dashboard initialization complete');
      } catch (error) {
        console.error('❌ Dashboard initialization error:', error);
        // Still mark as initialized so UI can render (with empty data)
        setInitialized(true);
      }
    };

    initializeDashboard();
  }, []);

  const value = {
    initialized,
    user,
    setUser,
    isNative,
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
};
