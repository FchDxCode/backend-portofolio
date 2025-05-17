import { useState, useEffect } from 'react';
import { ArticleTag } from '@/src/models/ArticleModels';
import { ArticleTagService } from '@/src/services/article/ArticleTagServices';

export const useArticleTags = (initialFilters?: {
  isActive?: boolean;
  sort?: 'created_at' | 'title';
  order?: 'asc' | 'desc';
}) => {
  const [tags, setTags] = useState<ArticleTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [filters, setFilters] = useState(initialFilters || {});

  const fetchTags = async () => {
    try {
      setLoading(true);
      const data = await ArticleTagService.getAll(filters);
      setTags(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
    } finally {
      setLoading(false);
    }
  };

  const createTag = async (tag: Omit<ArticleTag, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setLoading(true);
      const newTag = await ArticleTagService.create(tag);
      setTags(prev => [...prev, newTag]);
      return newTag;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateTag = async (id: number, tag: Partial<ArticleTag>) => {
    try {
      setLoading(true);
      const updatedTag = await ArticleTagService.update(id, tag);
      setTags(prev => prev.map(t => t.id === id ? updatedTag : t));
      return updatedTag;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteTag = async (id: number) => {
    try {
      setLoading(true);
      await ArticleTagService.delete(id);
      setTags(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const toggleTagActive = async (id: number) => {
    try {
      setLoading(true);
      const updatedTag = await ArticleTagService.toggleActive(id);
      setTags(prev => prev.map(t => t.id === id ? updatedTag : t));
      return updatedTag;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTags();
  }, [JSON.stringify(filters)]); 

  return {
    tags,
    loading,
    error,
    filters,
    setFilters,
    createTag,
    updateTag,
    deleteTag,
    toggleTagActive,
    refreshTags: fetchTags
  };
};