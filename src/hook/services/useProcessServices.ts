import { useState, useEffect, useCallback } from 'react';
import { ServiceProcess } from '@/src/models/ServiceModels';
import { ServiceProcessService } from '@/src/services/services/ProcessServices';

// Interface untuk hasil hook
interface UseServiceProcessResult {
  processes: ServiceProcess[];
  loading: boolean;
  error: Error | null;
  currentProcess: ServiceProcess | null;
  
  // Fungsi CRUD
  fetchProcesses: (params?: { activityId?: number; isActive?: boolean; search?: string; }) => Promise<void>;
  fetchProcessById: (id: number) => Promise<any>;
  createProcess: (
    process: Omit<ServiceProcess, 'id' | 'created_at' | 'updated_at' | 'order_no'> & {
      activityIds?: number[];
    },
    iconFile?: File
  ) => Promise<ServiceProcess>;
  updateProcess: (
    id: number,
    process: Partial<ServiceProcess> & {
      activityIds?: number[];
    },
    iconFile?: File
  ) => Promise<ServiceProcess>;
  deleteProcess: (id: number) => Promise<void>;
  reorderProcesses: (newOrder: { id: number; order_no: number }[]) => Promise<void>;
  
  // Fungsi khusus dan utility
  getActivityIds: (processId: number) => Promise<number[]>;
  getIconUrl: (path: string) => string;
}

export function useServiceProcess(): UseServiceProcessResult {
  // State untuk menyimpan data
  const [processes, setProcesses] = useState<ServiceProcess[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [currentProcess, setCurrentProcess] = useState<ServiceProcess | null>(null);

  // Fungsi untuk mengambil daftar process
  const fetchProcesses = useCallback(async (params?: { activityId?: number; isActive?: boolean; search?: string; }) => {
    setLoading(true);
    setError(null);
    try {
      const data = await ServiceProcessService.getAll(params);
      setProcesses(data);
    } catch (err) {
      console.error('Error fetching processes:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch processes'));
    } finally {
      setLoading(false);
    }
  }, []);

  // Fungsi untuk mengambil process berdasarkan ID
  const fetchProcessById = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await ServiceProcessService.getById(id);
      setCurrentProcess(data);
      return data;
    } catch (err) {
      console.error(`Error fetching process with ID ${id}:`, err);
      setError(err instanceof Error ? err : new Error(`Failed to fetch process with ID ${id}`));
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fungsi untuk membuat process baru
  const createProcess = useCallback(async (
    process: Omit<ServiceProcess, 'id' | 'created_at' | 'updated_at' | 'order_no'> & {
      activityIds?: number[];
    },
    iconFile?: File
  ): Promise<ServiceProcess> => {
    setLoading(true);
    setError(null);
    try {
      const newProcess = await ServiceProcessService.create(process, iconFile);
      
      // Update daftar process
      setProcesses(prevProcesses => [...prevProcesses, newProcess]);
      
      return newProcess;
    } catch (err) {
      console.error('Error creating process:', err);
      const error = err instanceof Error ? err : new Error('Failed to create process');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fungsi untuk memperbarui process
  const updateProcess = useCallback(async (
    id: number,
    process: Partial<ServiceProcess> & {
      activityIds?: number[];
    },
    iconFile?: File
  ): Promise<ServiceProcess> => {
    setLoading(true);
    setError(null);
    try {
      const updatedProcess = await ServiceProcessService.update(id, process, iconFile);
      
      // Update daftar process
      setProcesses(prevProcesses =>
        prevProcesses.map(p => p.id === id ? updatedProcess : p)
      );
      
      // Update current process jika yang diupdate adalah current process
      if (currentProcess?.id === id) {
        setCurrentProcess(updatedProcess);
      }
      
      return updatedProcess;
    } catch (err) {
      console.error(`Error updating process with ID ${id}:`, err);
      const error = err instanceof Error ? err : new Error(`Failed to update process with ID ${id}`);
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [currentProcess]);

  // Fungsi untuk menghapus process
  const deleteProcess = useCallback(async (id: number): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await ServiceProcessService.delete(id);
      
      // Hapus dari daftar process
      setProcesses(prevProcesses => prevProcesses.filter(p => p.id !== id));
      
      // Reset current process jika yang dihapus adalah current process
      if (currentProcess?.id === id) {
        setCurrentProcess(null);
      }
    } catch (err) {
      console.error(`Error deleting process with ID ${id}:`, err);
      setError(err instanceof Error ? err : new Error(`Failed to delete process with ID ${id}`));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentProcess]);

  // Fungsi untuk mengatur ulang urutan process
  const reorderProcesses = useCallback(async (newOrder: { id: number; order_no: number }[]): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await ServiceProcessService.reorder(newOrder);
      
      // Update daftar process dengan urutan baru
      const updatedProcesses = [...processes];
      newOrder.forEach(item => {
        const processIndex = updatedProcesses.findIndex(p => p.id === item.id);
        if (processIndex !== -1) {
          updatedProcesses[processIndex] = {
            ...updatedProcesses[processIndex],
            order_no: item.order_no
          };
        }
      });
      
      // Urutkan berdasarkan order_no
      updatedProcesses.sort((a, b) => (a.order_no || 0) - (b.order_no || 0));
      
      setProcesses(updatedProcesses);
    } catch (err) {
      console.error('Error reordering processes:', err);
      setError(err instanceof Error ? err : new Error('Failed to reorder processes'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [processes]);

  // Fungsi untuk mendapatkan activity IDs dari suatu process
  const getActivityIds = useCallback(async (processId: number): Promise<number[]> => {
    try {
      return await ServiceProcessService.getActivityIds(processId);
    } catch (err) {
      console.error(`Error fetching activity IDs for process ${processId}:`, err);
      throw err;
    }
  }, []);

  // Utility function untuk mendapatkan URL icon
  const getIconUrl = useCallback((path: string) => {
    return ServiceProcessService.getIconUrl(path);
  }, []);

  // Lakukan fetch processes pada saat komponen dipasang
  useEffect(() => {
    fetchProcesses();
  }, [fetchProcesses]);

  return {
    processes,
    loading,
    error,
    currentProcess,
    fetchProcesses,
    fetchProcessById,
    createProcess,
    updateProcess,
    deleteProcess,
    reorderProcesses,
    getActivityIds,
    getIconUrl
  };
}