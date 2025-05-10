import { useState, useEffect, useCallback } from 'react';
import { Skill } from '@/src/models/SkillModels';
import { SkillService } from '@/src/services/skill/SkillServices';

interface SkillFilters {
  search?: string;
  categoryId?: number;
  minPercent?: number;
  minExperience?: number;
  sort?: 'percent_skills' | 'long_experience' | 'created_at' | 'title';
  order?: 'asc' | 'desc';
  withCategory?: boolean;
}

export const useSkills = (initialFilters?: SkillFilters) => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [filters, setFilters] = useState<SkillFilters>(initialFilters || {});

  const fetchSkills = useCallback(async () => {
    try {
      setLoading(true);
      const data = await SkillService.getAll(filters);
      setSkills(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const createSkill = async (
    skill: Omit<Skill, 'id' | 'created_at' | 'updated_at'>,
    iconFile?: File
  ) => {
    try {
      setLoading(true);
      const newSkill = await SkillService.create(skill, iconFile);
      setSkills(prev => [newSkill, ...prev]);
      return newSkill;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateSkill = async (
    id: number,
    skill: Partial<Skill>,
    newIconFile?: File
  ) => {
    try {
      setLoading(true);
      const updatedSkill = await SkillService.update(id, skill, newIconFile);
      setSkills(prev => 
        prev.map(s => s.id === id ? updatedSkill : s)
      );
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
      await SkillService.delete(id);
      setSkills(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      throw err;
    } finally {
      setLoading(false);
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
    refreshSkills: fetchSkills,
    getIconUrl: SkillService.getIconUrl,
    formatPercent: SkillService.formatPercent,
    formatExperience: SkillService.formatExperience
  };
};