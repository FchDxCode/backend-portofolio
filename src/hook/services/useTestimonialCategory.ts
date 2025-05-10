import { useState, useEffect, useCallback } from 'react';
import { TestimonialCategory } from '@/src/models/ServiceModels';
import { TestimonialCategoryService } from '@/src/services/services/TestimonialCategoryServices';

interface CategoryFilters {
  search?: string;
  sort?: 'created_at';
  order?: 'asc' | 'desc';
}

export const useTestimonialCategories = (initialFilters?: CategoryFilters) => {
  const [categories, setCategories] = useState<TestimonialCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [filters, setFilters] = useState<CategoryFilters>(initialFilters || {});

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const data = await TestimonialCategoryService.getAll(filters);
      setCategories(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const createCategory = async (
    category: Omit<TestimonialCategory, 'id' | 'created_at' | 'updated_at'>
  ) => {
    try {
      setLoading(true);
      const newCategory = await TestimonialCategoryService.create(category);
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
    category: Partial<TestimonialCategory>
  ) => {
    try {
      setLoading(true);
      const updatedCategory = await TestimonialCategoryService.update(id, category);
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
      await TestimonialCategoryService.delete(id);
      setCategories(prev => prev.filter(cat => cat.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const checkCategoryUsage = async (id: number): Promise<boolean> => {
    try {
      return await TestimonialCategoryService.isUsedInTestimonials(id);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      throw err;
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
    checkCategoryUsage,
    refreshCategories: fetchCategories
  };
};