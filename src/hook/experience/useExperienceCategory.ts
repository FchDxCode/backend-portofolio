import { useState, useEffect, useCallback } from 'react';
import { ExperienceCategory } from '@/src/models/ExperienceModels';
import { ExperienceCategoryService } from '@/src/services/experience/ExperienceCategoryServices';

interface CategoryFilters {
  sort?: 'created_at' | 'title';
  order?: 'asc' | 'desc';
  search?: string;
}

export const useExperienceCategories = (initialFilters?: CategoryFilters) => {
  const [categories, setCategories] = useState<ExperienceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [filters, setFilters] = useState<CategoryFilters>(initialFilters || {});

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const data = await ExperienceCategoryService.getAll(filters);
      setCategories(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const createCategory = async (category: Omit<ExperienceCategory, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setLoading(true);
      const newCategory = await ExperienceCategoryService.create(category);
      setCategories(prev => [newCategory, ...prev]);
      return newCategory;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateCategory = async (id: number, category: Partial<ExperienceCategory>) => {
    try {
      setLoading(true);
      const updatedCategory = await ExperienceCategoryService.update(id, category);
      setCategories(prev => 
        prev.map(cat => cat.id === id ? updatedCategory : cat)
      );
      return updatedCategory;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteCategory = async (id: number) => {
    try {
      setLoading(true);
      await ExperienceCategoryService.delete(id);
      setCategories(prev => prev.filter(cat => cat.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return {
    categories,
    loading,
    error,
    filters,
    setFilters,
    createCategory,
    updateCategory,
    deleteCategory,
    refreshCategories: fetchCategories
  };
};