"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Alert } from './Alert';

type AlertType = 'success' | 'error' | 'warning' | 'info';

interface AlertContextType {
  showAlert: (message: string, type: AlertType) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  warning: (message: string) => void;
  info: (message: string) => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export function AlertProvider({ children }: { children: ReactNode }) {
  const [alerts, setAlerts] = useState<{
    id: string;
    message: string;
    type: AlertType;
  }[]>([]);

  const showAlert = (message: string, type: AlertType = 'info') => {
    const id = Date.now().toString();
    // Batasi jumlah alert yang ditampilkan (maksimal 3)
    setAlerts(prev => {
      const newAlerts = [...prev, { id, message, type }];
      return newAlerts.slice(-3);
    });
    
    setTimeout(() => {
      setAlerts(prev => prev.filter(alert => alert.id !== id));
    }, 3000);
  };

  const contextValue: AlertContextType = {
    showAlert,
    success: (message) => showAlert(message, 'success'),
    error: (message) => showAlert(message, 'error'),
    warning: (message) => showAlert(message, 'warning'),
    info: (message) => showAlert(message, 'info'),
  };

  return (
    <AlertContext.Provider value={contextValue}>
      {children}
      <div className="fixed top-0 left-0 right-0 z-50 flex flex-col items-center p-4 space-y-4 pointer-events-none">
        {alerts.map((alert) => (
          <Alert
            key={alert.id}
            message={alert.message}
            type={alert.type}
            isOpen={true}
            onClose={() => {
              setAlerts(prev => prev.filter(a => a.id !== alert.id));
            }}
          />
        ))}
      </div>
    </AlertContext.Provider>
  );
}

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (context === undefined) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
};