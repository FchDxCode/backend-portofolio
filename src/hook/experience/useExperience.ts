import { useState, useEffect, useCallback } from 'react';
import { Experience } from '@/src/models/ExperienceModels';
import { ExperienceService } from '@/src/services/experience/ExperienceServices';

interface ExperienceFilters {
  categoryId?: number;
  skillId?: number;
  search?: string;
  sort?: 'created_at' | 'experience_long';
  order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export const useExperiences = (initialFilters?: ExperienceFilters) => {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [filters, setFilters] = useState<ExperienceFilters>(
    initialFilters || { page: 1, limit: 10 }
  );

  const fetchExperiences = useCallback(async () => {
    try {
      setLoading(true);
      const { data, count } = await ExperienceService.getAll(filters);
      setExperiences(data);
      setTotalCount(count);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const createExperience = async (experience: Omit<Experience, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setLoading(true);
      const newExperience = await ExperienceService.create(experience);
      setExperiences(prev => [newExperience, ...prev]);
      setTotalCount(prev => prev + 1);
      return newExperience;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateExperience = async (id: number, experience: Partial<Experience>) => {
    try {
      setLoading(true);
      const updatedExperience = await ExperienceService.update(id, experience);
      setExperiences(prev => 
        prev.map(exp => exp.id === id ? updatedExperience : exp)
      );
      return updatedExperience;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteExperience = async (id: number) => {
    try {
      setLoading(true);
      await ExperienceService.delete(id);
      setExperiences(prev => prev.filter(exp => exp.id !== id));
      setTotalCount(prev => prev - 1);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExperiences();
  }, [fetchExperiences]);

  return {
    experiences,
    totalCount,
    loading,
    error,
    filters,
    setFilters,
    createExperience,
    updateExperience,
    deleteExperience,
    refreshExperiences: fetchExperiences
  };
};