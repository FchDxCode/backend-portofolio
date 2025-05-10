import { useState, useEffect, useCallback } from 'react';
import { SkillCategory } from '@/src/models/SkillModels';
import { SkillCategoryService } from '@/src/services/skill/SkillCategoryServices';

interface CategoryFilters {
  search?: string;
  sort?: 'created_at';
  order?: 'asc' | 'desc';
}

export const useSkillCategories = (initialFilters?: CategoryFilters) => {
  const [categories, setCategories] = useState<SkillCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [filters, setFilters] = useState<CategoryFilters>(initialFilters || {});

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const data = await SkillCategoryService.getAll(filters);
      setCategories(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const createCategory = async (
    category: Omit<SkillCategory, 'id' | 'created_at' | 'updated_at'>,
    iconFile?: File
  ) => {
    try {
      setLoading(true);
      const newCategory = await SkillCategoryService.create(category, iconFile);
      setCategories(prev => [newCategory, ...prev]);
      return newCategory;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateCategory = async (
    id: number,
    category: Partial<SkillCategory>,
    newIconFile?: File
  ) => {
    try {
      setLoading(true);
      const updatedCategory = await SkillCategoryService.update(id, category, newIconFile);
      setCategories(prev => 
        prev.map(c => c.id === id ? updatedCategory : c)
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
      await SkillCategoryService.delete(id);
      setCategories(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getSkillCount = async (id: number): Promise<number> => {
    try {
      return await SkillCategoryService.getSkillCount(id);
    } catch (err) {
      console.error('Error getting skill count:', err);
      return 0;
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
    getSkillCount,
    refreshCategories: fetchCategories,
    getIconUrl: SkillCategoryService.getIconUrl
  };
};