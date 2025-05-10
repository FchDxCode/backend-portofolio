import { useState, useEffect, useCallback } from 'react';
import { TechStackSkill } from '@/src/models/ServiceModels';
import { TechStackSkillService } from '@/src/services/services/TechStackSkillServices';

interface SkillFilters {
  search?: string;
  sort?: 'created_at' | 'title';
  order?: 'asc' | 'desc';
}

export const useTechStackSkills = (initialFilters?: SkillFilters) => {
  const [skills, setSkills] = useState<TechStackSkill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [filters, setFilters] = useState<SkillFilters>(initialFilters || {});

  const fetchSkills = useCallback(async () => {
    try {
      setLoading(true);
      const data = await TechStackSkillService.getAll(filters);
      setSkills(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const createSkill = async (skill: Omit<TechStackSkill, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setLoading(true);
      const newSkill = await TechStackSkillService.create(skill);
      setSkills(prev => [newSkill, ...prev]);
      return newSkill;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateSkill = async (id: number, skill: Partial<TechStackSkill>) => {
    try {
      setLoading(true);
      const updatedSkill = await TechStackSkillService.update(id, skill);
      setSkills(prev => prev.map(s => s.id === id ? updatedSkill : s));
      return updatedSkill;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteSkill = async (id: number) => {
    try {
      setLoading(true);
      await TechStackSkillService.delete(id);
      setSkills(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getTechStackCount = async (skillId: number) => {
    try {
      return await TechStackSkillService.getTechStackCount(skillId);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      throw err;
    }
  };

  useEffect(() => {
    fetchSkills();
  }, [fetchSkills]);

  return {
    skills,
    loading,
    error,
    filters,
    setFilters,
    createSkill,
    updateSkill,
    deleteSkill,
    getTechStackCount,
    refreshSkills: fetchSkills
  };
};