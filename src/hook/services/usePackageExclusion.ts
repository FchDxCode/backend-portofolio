import { useState, useEffect, useCallback } from 'react';
import { PackageExclusion } from '@/src/models/ServiceModels';
import { PackageExclusionService } from '@/src/services/services/PackageExclusionServices';

interface ExclusionFilters {
  search?: string;
  sort?: 'created_at' | 'title';
  order?: 'asc' | 'desc';
}

export const usePackageExclusions = (initialFilters?: ExclusionFilters) => {
  const [exclusions, setExclusions] = useState<PackageExclusion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [filters, setFilters] = useState<ExclusionFilters>(initialFilters || {});

  const fetchExclusions = useCallback(async () => {
    try {
      setLoading(true);
      const data = await PackageExclusionService.getAll(filters);
      setExclusions(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const createExclusion = async (
    exclusion: Omit<PackageExclusion, 'id' | 'created_at' | 'updated_at'>
  ) => {
    try {
      setLoading(true);
      const newExclusion = await PackageExclusionService.create(exclusion);
      setExclusions(prev => [newExclusion, ...prev]);
      return newExclusion;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateExclusion = async (
    id: number,
    exclusion: Partial<PackageExclusion>
  ) => {
    try {
      setLoading(true);
      const updatedExclusion = await PackageExclusionService.update(id, exclusion);
      setExclusions(prev => prev.map(e => e.id === id ? updatedExclusion : e));
      return updatedExclusion;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteExclusion = async (id: number) => {
    try {
      setLoading(true);
      await PackageExclusionService.delete(id);
      setExclusions(prev => prev.filter(e => e.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const bulkCreateExclusions = async (
    exclusionsData: Omit<PackageExclusion, 'id' | 'created_at' | 'updated_at'>[]
  ) => {
    try {
      setLoading(true);
      const newExclusions = await PackageExclusionService.bulkCreate(exclusionsData);
      setExclusions(prev => [...newExclusions, ...prev]);
      return newExclusions;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const bulkUpdateExclusions = async (
    updates: { id: number; data: Partial<PackageExclusion> }[]
  ) => {
    try {
      setLoading(true);
      const updatedExclusions = await PackageExclusionService.bulkUpdate(updates);
      setExclusions(prev => {
        const updated = new Map(updatedExclusions.map(e => [e.id, e]));
        return prev.map(e => updated.get(e.id) || e);
      });
      return updatedExclusions;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const bulkDeleteExclusions = async (ids: number[]) => {
    try {
      setLoading(true);
      await PackageExclusionService.bulkDelete(ids);
      setExclusions(prev => prev.filter(e => !ids.includes(e.id)));
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExclusions();
  }, [fetchExclusions]);

  return {
    exclusions,
    loading,
    error,
    filters,
    setFilters,
    createExclusion,
    updateExclusion,
    deleteExclusion,
    bulkCreateExclusions,
    bulkUpdateExclusions,
    bulkDeleteExclusions,
    refreshExclusions: fetchExclusions
  };
};