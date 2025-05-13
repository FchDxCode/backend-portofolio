"use client";

import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, XCircle, Info, X } from 'lucide-react';

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
  duration = 2000, 
  onClose,
  isOpen 
}: AlertProps) {
  const [isVisible, setIsVisible] = useState(isOpen);
  const [isLeaving, setIsLeaving] = useState(false);
  
  useEffect(() => {
    setIsVisible(isOpen);
    setIsLeaving(false);
    
    if (isOpen && duration > 0) {
      const timer = setTimeout(() => {
        setIsLeaving(true);
        setTimeout(() => {
          setIsVisible(false);
          if (onClose) onClose();
        }, 300);
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
    success: `
      bg-green-50 text-green-800 
      dark:bg-green-900/20 dark:text-green-300
      border-t-4 border-green-500
      hover:bg-green-100 dark:hover:bg-green-900/30
    `,
    error: `
      bg-red-50 text-red-800 
      dark:bg-red-900/20 dark:text-red-300
      border-t-4 border-red-500
      hover:bg-red-100 dark:hover:bg-red-900/30
    `,
    warning: `
      bg-amber-50 text-amber-800 
      dark:bg-amber-900/20 dark:text-amber-300
      border-t-4 border-amber-500
      hover:bg-amber-100 dark:hover:bg-amber-900/30
    `,
    info: `
      bg-blue-50 text-blue-800 
      dark:bg-blue-900/20 dark:text-blue-300
      border-t-4 border-blue-500
      hover:bg-blue-100 dark:hover:bg-blue-900/30
    `
  };

  const progressBarColors = {
    success: "bg-green-500",
    error: "bg-red-500",
    warning: "bg-amber-500",
    info: "bg-blue-500"
  };

  return (
    <div 
      className={`
        fixed left-1/2 top-4 z-50
        -translate-x-1/2
        w-full max-w-md
        transform transition-all duration-300 ease-in-out
        ${isLeaving ? '-translate-y-full opacity-0' : 'translate-y-0 opacity-100'}
      `}
    >
      <div
        className={`
          relative overflow-hidden
          flex w-full rounded-lg shadow-lg
          ${styles[type]}
          transition-all duration-200
          hover:shadow-xl
          cursor-pointer
          mx-auto
        `}
        role="alert"
        onClick={() => {
          setIsLeaving(true);
          setTimeout(() => {
            setIsVisible(false);
            if (onClose) onClose();
          }, 300);
        }}
      >
        {/* Progress Bar */}
        <div 
          className={`
            absolute bottom-0 left-0 h-1 w-full
            ${progressBarColors[type]}
          `}
          style={{
            animation: `shrinkWidth ${duration}ms linear forwards`
          }}
        />

        <div className="flex items-center justify-center flex-shrink-0 w-12 p-4">
          <div className="w-6 h-6">{icons[type]}</div>
        </div>

        <div className="flex-1 p-4 pr-2">
          <p className="text-sm font-medium leading-5 text-center">{message}</p>
        </div>

        <button
          type="button"
          className="absolute top-2 right-2 p-1.5 rounded-full
            hover:bg-black/5 dark:hover:bg-white/5
            focus:outline-none focus:ring-2 focus:ring-offset-2
            transition-colors duration-200"
          onClick={(e) => {
            e.stopPropagation();
            setIsLeaving(true);
            setTimeout(() => {
              setIsVisible(false);
              if (onClose) onClose();
            }, 300);
          }}
        >
          <span className="sr-only">Tutup</span>
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// Sisanya tetap sama seperti sebelumnya
export function useAlert() {
  // ... kode useAlert tetap sama
}

// Tambahkan CSS global
const styles = `
@keyframes shrinkWidth {
  from { width: 100%; }
  to { width: 0%; }
}
`;

// Inject CSS ke dalam head
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}