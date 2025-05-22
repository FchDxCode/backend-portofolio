import { useState, useEffect, useCallback } from 'react';
import { TechStack } from '@/src/models/ServiceModels';
import { TechStackService } from '@/src/services/services/TechStackServices';

interface TechStackFilters {
  skillId?: number;
  search?: string;
  sort?: 'created_at' | 'title';
  order?: 'asc' | 'desc';
  withSkill?: boolean;
}

export const useTechStacks = (initialFilters?: TechStackFilters) => {
  const [techStacks, setTechStacks] = useState<TechStack[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [filters, setFilters] = useState<TechStackFilters>(initialFilters || {});

  const fetchTechStacks = useCallback(async () => {
    try {
      setLoading(true);
      const data = await TechStackService.getAll(filters);
      setTechStacks(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const createTechStack = async (
    techStack: Omit<TechStack, 'id' | 'created_at' | 'updated_at'>,
    iconFile?: File
  ) => {
    try {
      setLoading(true);
      const newTechStack = await TechStackService.create(techStack, iconFile);
      setTechStacks(prev => [newTechStack, ...prev]);
      return newTechStack;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateTechStack = async (
    id: number,
    techStack: Partial<TechStack>,
    newIconFile?: File
  ) => {
    try {
      setLoading(true);
      const updatedTechStack = await TechStackService.update(id, techStack, newIconFile);
      setTechStacks(prev => prev.map(ts => ts.id === id ? updatedTechStack : ts));
      return updatedTechStack;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteTechStack = async (id: number) => {
    try {
      setLoading(true);
      await TechStackService.delete(id);
      setTechStacks(prev => prev.filter(ts => ts.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getIconUrl = useCallback((path: string) => {
    return TechStackService.getIconUrl(path);
  }, []);

  useEffect(() => {
    fetchTechStacks();
  }, [fetchTechStacks]);

  return {
    techStacks,
    loading,
    error,
    filters,
    setFilters,
    createTechStack,
    updateTechStack,
    deleteTechStack,
    refreshTechStacks: fetchTechStacks,
    getIconUrl
  };
};