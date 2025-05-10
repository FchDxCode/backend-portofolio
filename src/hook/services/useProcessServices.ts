import { useState, useEffect, useCallback } from 'react';
import { ServiceProcess } from '@/src/models/ServiceModels';
import { ServiceProcessService } from '@/src/services/services/ProcessServices';

interface ProcessFilters {
  benefitId?: number;
  isActive?: boolean;
  search?: string;
}

export const useServiceProcesses = (initialFilters?: ProcessFilters) => {
  const [processes, setProcesses] = useState<ServiceProcess[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [filters, setFilters] = useState<ProcessFilters>(initialFilters || {});

  const fetchProcesses = useCallback(async () => {
    try {
      setLoading(true);
      const data = await ServiceProcessService.getAll(filters);
      setProcesses(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const createProcess = async (
    process: Omit<ServiceProcess, 'id' | 'created_at' | 'updated_at' | 'order_no'>,
    iconFile?: File
  ) => {
    try {
      setLoading(true);
      const newProcess = await ServiceProcessService.create(process, iconFile);
      setProcesses(prev => [...prev, newProcess].sort((a, b) => (a.order_no ?? 0) - (b.order_no ?? 0)));
      return newProcess;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateProcess = async (
    id: number,
    process: Partial<ServiceProcess>,
    newIconFile?: File
  ) => {
    try {
      setLoading(true);
      const updatedProcess = await ServiceProcessService.update(id, process, newIconFile);
      setProcesses(prev => 
        prev.map(p => p.id === id ? updatedProcess : p)
      );
      return updatedProcess;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteProcess = async (id: number) => {
    try {
      setLoading(true);
      await ServiceProcessService.delete(id);
      setProcesses(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const reorderProcesses = async (newOrder: { id: number; order_no: number }[]) => {
    try {
      setLoading(true);
      await ServiceProcessService.reorder(newOrder);
      setProcesses(prev => 
        [...prev].sort((a, b) => 
          newOrder.find(o => o.id === a.id)!.order_no - 
          newOrder.find(o => o.id === b.id)!.order_no
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProcesses();
  }, [fetchProcesses]);

  return {
    processes,
    loading,
    error,
    filters,
    setFilters,
    createProcess,
    updateProcess,
    deleteProcess,
    reorderProcesses,
    refreshProcesses: fetchProcesses,
    getIconUrl: ServiceProcessService.getIconUrl,
    formatDuration: ServiceProcessService.formatDuration
  };
};