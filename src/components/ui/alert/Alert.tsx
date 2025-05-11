"use client";

import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, XCircle, Info, X } from 'lucide-react';
import { cn } from '@/src/lib/utils';

type AlertType = 'success' | 'error' | 'warning' | 'info';

interface AlertProps {
  message: string;
  type?: AlertType;
  duration?: number;
  onClose?: () => void;
  isOpen: boolean;
}

export function Alert({ 
  message, 
  type = 'info', 
  duration = 3000, 
  onClose,
  isOpen 
}: AlertProps) {
  const [isVisible, setIsVisible] = useState(isOpen);
  
  useEffect(() => {
    setIsVisible(isOpen);
    
    if (isOpen && duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        if (onClose) onClose();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen, duration, onClose]);
  
  if (!isVisible) return null;
  
  const icons = {
    success: <CheckCircle className="h-5 w-5" />,
    error: <XCircle className="h-5 w-5" />,
    warning: <AlertCircle className="h-5 w-5" />,
    info: <Info className="h-5 w-5" />
  };
  
  const styles = {
    success: "bg-green-50 text-green-800 border-green-100 dark:bg-green-900/20 dark:text-green-300 dark:border-green-900/30",
    error: "bg-red-50 text-red-800 border-red-100 dark:bg-red-900/20 dark:text-red-300 dark:border-red-900/30",
    warning: "bg-amber-50 text-amber-800 border-amber-100 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-900/30",
    info: "bg-blue-50 text-blue-800 border-blue-100 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-900/30"
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 flex justify-center items-end p-4 pointer-events-none">
      <div
        className={cn(
          "pointer-events-auto flex w-full max-w-md rounded-lg border p-4 shadow-md items-start",
          styles[type]
        )}
        role="alert"
      >
        <div className="mr-3 flex-shrink-0">{icons[type]}</div>
        <div className="flex-1 mr-2">
          <p className="text-sm font-medium">{message}</p>
        </div>
        <button
          type="button"
          className="ml-auto -mx-1.5 -my-1.5 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 inline-flex items-center justify-center h-8 w-8 dark:focus:ring-gray-600"
          onClick={() => {
            setIsVisible(false);
            if (onClose) onClose();
          }}
        >
          <span className="sr-only">Close</span>
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export function useAlert() {
  const [alerts, setAlerts] = useState<{
    id: string;
    message: string;
    type: AlertType;
    isOpen: boolean;
  }[]>([]);

  const showAlert = (message: string, type: AlertType = 'info') => {
    const id = Date.now().toString();
    setAlerts(prev => [...prev, { id, message, type, isOpen: true }]);
    return id;
  };

  const closeAlert = (id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  };

  const alertComponents = alerts.map(alert => (
    <Alert
      key={alert.id}
      message={alert.message}
      type={alert.type}
      isOpen={alert.isOpen}
      onClose={() => closeAlert(alert.id)}
    />
  ));

  return {
    showAlert,
    closeAlert,
    success: (message: string) => showAlert(message, 'success'),
    error: (message: string) => showAlert(message, 'error'),
    warning: (message: string) => showAlert(message, 'warning'),
    info: (message: string) => showAlert(message, 'info'),
    alertComponents
  };
}