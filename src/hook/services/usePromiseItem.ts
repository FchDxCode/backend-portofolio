import { useState, useEffect, useCallback } from 'react';
import { PromiseItem } from '@/src/models/ServiceModels';
import { PromiseItemService } from '@/src/services/services/PromiseItemServices';

interface PromiseFilters {
  search?: string;
  sort?: 'created_at';
  order?: 'asc' | 'desc';
}

export const usePromiseItems = (initialFilters?: PromiseFilters) => {
  const [promises, setPromises] = useState<PromiseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [filters, setFilters] = useState<PromiseFilters>(initialFilters || {});

  const fetchPromises = useCallback(async () => {
    try {
      setLoading(true);
      const data = await PromiseItemService.getAll(filters);
      setPromises(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const createPromise = async (
    promise: Omit<PromiseItem, 'id' | 'created_at' | 'updated_at'>,
    iconFile?: File
  ) => {
    try {
      setLoading(true);
      const newPromise = await PromiseItemService.create(promise, iconFile);
      setPromises(prev => [newPromise, ...prev]);
      return newPromise;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updatePromise = async (
    id: number,
    promise: Partial<PromiseItem>,
    newIconFile?: File
  ) => {
    try {
      setLoading(true);
      const updatedPromise = await PromiseItemService.update(id, promise, newIconFile);
      setPromises(prev => prev.map(p => p.id === id ? updatedPromise : p));
      return updatedPromise;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deletePromise = async (id: number) => {
    try {
      setLoading(true);
      await PromiseItemService.delete(id);
      setPromises(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromises();
  }, [fetchPromises]);

  return {
    promises,
    loading,
    error,
    filters,
    setFilters,
    createPromise,
    updatePromise,
    deletePromise,
    refreshPromises: fetchPromises,
    getIconUrl: PromiseItemService.getIconUrl
  };
};