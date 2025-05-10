import { useState, useEffect, useCallback } from 'react';
import { ServiceHero } from '@/src/models/ServiceModels';
import { ServiceHeroService } from '@/src/services/services/HeroServices';

interface HeroFilters {
  search?: string;
  sort?: 'created_at';
  order?: 'asc' | 'desc';
}

export const useServiceHeroes = (initialFilters?: HeroFilters) => {
  const [heroes, setHeroes] = useState<ServiceHero[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [filters, setFilters] = useState<HeroFilters>(initialFilters || {});

  const fetchHeroes = useCallback(async () => {
    try {
      setLoading(true);
      const data = await ServiceHeroService.getAll(filters);
      setHeroes(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const createHero = async (
    hero: Omit<ServiceHero, 'id' | 'created_at' | 'updated_at'>,
    iconFile?: File
  ) => {
    try {
      setLoading(true);
      const newHero = await ServiceHeroService.create(hero, iconFile);
      setHeroes(prev => [newHero, ...prev]);
      return newHero;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateHero = async (
    id: number,
    hero: Partial<ServiceHero>,
    newIconFile?: File
  ) => {
    try {
      setLoading(true);
      const updatedHero = await ServiceHeroService.update(id, hero, newIconFile);
      setHeroes(prev => prev.map(h => h.id === id ? updatedHero : h));
      return updatedHero;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteHero = async (id: number) => {
    try {
      setLoading(true);
      await ServiceHeroService.delete(id);
      setHeroes(prev => prev.filter(h => h.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHeroes();
  }, [fetchHeroes]);

  return {
    heroes,
    loading,
    error,
    filters,
    setFilters,
    createHero,
    updateHero,
    deleteHero,
    refreshHeroes: fetchHeroes,
    getIconUrl: ServiceHeroService.getIconUrl
  };
};