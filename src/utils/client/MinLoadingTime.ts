// src/utils/client/MinLoadingTime.ts
import { useState, useEffect } from 'react';

/**
 * Custom hook untuk mengelola loading dengan durasi minimal
 * @param initialLoading Status loading awal
 * @param minLoadingTime Durasi minimal loading dalam milidetik
 * @returns Status loading yang sudah ditambah durasi minimal
 */
export function MinLoadingTime(initialLoading: boolean, minLoadingTime: number = 2000) {
  const [isLoading, setIsLoading] = useState(initialLoading);
  const [loadingStartTime, setLoadingStartTime] = useState<number | null>(initialLoading ? Date.now() : null);
  
  useEffect(() => {
    // Jika loading baru dimulai
    if (initialLoading && !loadingStartTime) {
      setLoadingStartTime(Date.now());
      setIsLoading(true);
    }
    
    // Jika loading selesai dari initialLoading
    if (!initialLoading && loadingStartTime) {
      const loadingTime = Date.now() - loadingStartTime;
      const remainingTime = Math.max(0, minLoadingTime - loadingTime);
      
      if (remainingTime === 0) {
        // Jika sudah melebihi waktu minimal, langsung selesai
        setIsLoading(false);
        setLoadingStartTime(null);
      } else {
        // Jika belum mencapai waktu minimal, tunggu dulu
        const timer = setTimeout(() => {
          setIsLoading(false);
          setLoadingStartTime(null);
        }, remainingTime);
        
        return () => clearTimeout(timer);
      }
    }
  }, [initialLoading, loadingStartTime, minLoadingTime]);
  
  return isLoading;
}