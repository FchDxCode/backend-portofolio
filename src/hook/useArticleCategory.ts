import { useState, useEffect } from 'react';
import { ArticleCategory } from '../models/ArticleModels';
import { ArticleCategoryService } from '../services/ArticleCategoryServices';

export const useArticleCategories = (initialFilters?: {
  isActive?: boolean;
  sort?: 'created_at' | 'title';
  order?: 'asc' | 'desc';
}) => {
  const [categories, setCategories] = useState<ArticleCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [filters, setFilters] = useState(initialFilters || {});

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await ArticleCategoryService.getAll(filters);
      setCategories(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const createCategory = async (category: Omit<ArticleCategory, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setLoading(true);
      const newCategory = await ArticleCategoryService.create(category);
      setCategories(prev => [...prev, newCategory]);
      return newCategory;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateCategory = async (id: number, category: Partial<ArticleCategory>) => {
    try {
      setLoading(true);
      const updatedCategory = await ArticleCategoryService.update(id, category);
      setCategories(prev => prev.map(c => c.id === id ? updatedCategory : c));
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
      await ArticleCategoryService.delete(id);
      setCategories(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateCategoryIcon = async (id: number, file: File) => {
    try {
      setLoading(true);
      const updatedCategory = await ArticleCategoryService.updateIcon(id, file);
      setCategories(prev => prev.map(c => c.id === id ? updatedCategory : c));
      return updatedCategory;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [JSON.stringify(filters)]);

  return {
    categories,
    loading,
    error,
    filters,
    setFilters,
    createCategory,
    updateCategory,
    deleteCategory,
    updateCategoryIcon,
    refreshCategories: fetchCategories
  };
};