import { useState, useEffect, useCallback } from 'react';
import { Experience } from '@/src/models/ExperienceModels';
import { ExperienceService } from '@/src/services/experience/ExperienceServices';
import { ExperienceSkillService } from '@/src/services/experience/ExperienceSkillsServices';
import { deleteFile } from '@/src/utils/server/FileStorage';

interface ExperienceFilters {
  categoryId?: number;
  skillId?: number; // Tambahkan filter by skill
  search?: string;
  sort?: 'created_at' | 'experience_long';
  order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// Definisi interface untuk Experience dengan skill IDs
interface ExperienceWithSkills extends Experience {
  skillIds?: number[];
}

export const useExperiences = (initialFilters?: ExperienceFilters) => {
  const [experiences, setExperiences] = useState<ExperienceWithSkills[]>([]);
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
      
      // Jika ada data experience, ambil skill untuk masing-masing experience
      if (data.length > 0) {
        const experiencesWithSkills = await Promise.all(
          data.map(async (exp) => {
            const skillIds = await ExperienceSkillService.getSkillsByExperienceId(exp.id);
            return { ...exp, skillIds };
          })
        );
        setExperiences(experiencesWithSkills);
      } else {
        setExperiences([]);
      }
      
      setTotalCount(count);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const getExperienceById = async (id: number): Promise<ExperienceWithSkills | null> => {
    try {
      setLoading(true);
      const experience = await ExperienceService.getById(id);
      
      if (!experience) return null;
      
      // Ambil skill IDs untuk experience ini
      const skillIds = await ExperienceSkillService.getSkillsByExperienceId(id);
      
      return { ...experience, skillIds };
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createExperience = async (
    experience: Omit<Experience, 'id' | 'created_at' | 'updated_at'>, 
    skillIds: number[] = []
  ) => {
    try {
      setLoading(true);
      const newExperience = await ExperienceService.create(experience, skillIds);
      
      // Tambahkan skillIds ke object experience yang baru dibuat untuk state
      const newExperienceWithSkills = { ...newExperience, skillIds };
      
      setExperiences(prev => [newExperienceWithSkills, ...prev]);
      setTotalCount(prev => prev + 1);
      return newExperienceWithSkills;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateExperience = async (
    id: number, 
    experience: Partial<Experience>, 
    skillIds?: number[],
    deleteOldLogo: boolean = false
  ) => {
    try {
      setLoading(true);
      
      // If we're replacing the logo and need to delete the old one
      if (deleteOldLogo && experience.company_logo) {
        const currentExperience = experiences.find(exp => exp.id === id);
        if (currentExperience?.company_logo && 
            currentExperience.company_logo !== experience.company_logo) {
          try {
            await deleteFile(currentExperience.company_logo);
          } catch (deleteErr) {
            console.warn('Failed to delete old logo:', deleteErr);
            // Continue with update even if delete fails
          }
        }
      }
      
      const updatedExperience = await ExperienceService.update(id, experience, skillIds);
      
      // Update di state dengan menyimpan skillIds
      setExperiences(prev => 
        prev.map(exp => {
          if (exp.id === id) {
            return { 
              ...updatedExperience, 
              skillIds: skillIds !== undefined ? skillIds : exp.skillIds 
            };
          }
          return exp;
        })
      );
      
      return { ...updatedExperience, skillIds };
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteExperience = async (id: number, deleteLogoFile: boolean = true) => {
    try {
      setLoading(true);
      
      // Get the experience to check if it has a logo
      const experienceToDelete = experiences.find(exp => exp.id === id);
      const logoPath = experienceToDelete?.company_logo;
      
      // Delete from database
      await ExperienceService.delete(id);
      
      // Delete logo file if requested
      if (deleteLogoFile && logoPath) {
        try {
          await deleteFile(logoPath);
        } catch (deleteErr) {
          console.warn('Failed to delete logo file:', deleteErr);
          // Continue with deletion even if file delete fails
        }
      }
      
      setExperiences(prev => prev.filter(exp => exp.id !== id));
      setTotalCount(prev => prev - 1);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Hook untuk mendapatkan daftar skill untuk suatu experience
  const getSkillsForExperience = async (experienceId: number) => {
    try {
      return await ExperienceSkillService.getSkillsByExperienceId(experienceId);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      throw err;
    }
  };
  
  // Hook untuk mengatur skill untuk suatu experience
  const setSkillsForExperience = async (experienceId: number, skillIds: number[]) => {
    try {
      await ExperienceSkillService.setSkillsForExperience(experienceId, skillIds);
      
      // Update experiences state dengan skillIds baru
      setExperiences(prev => 
        prev.map(exp => {
          if (exp.id === experienceId) {
            return { ...exp, skillIds };
          }
          return exp;
        })
      );
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      throw err;
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
    getExperienceById,
    createExperience,
    updateExperience,
    deleteExperience,
    getSkillsForExperience,
    setSkillsForExperience,
    refreshExperiences: fetchExperiences
  };
};