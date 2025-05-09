import { useState, useEffect } from 'react';
import { Article } from '@/src/models/ArticleModels';
import { ArticleService } from '@/src/services/article/ArticleServices';

export const useArticles = (initialFilters?: {
  isActive?: boolean;
  categoryId?: number;
  tagId?: number;
  sort?: 'created_at' | 'total_views' | 'like';
  order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
  search?: string;
}) => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [filters, setFilters] = useState(initialFilters || { page: 1, limit: 10 });

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const { data, count } = await ArticleService.getAll(filters);
      setArticles(data);
      setTotalCount(count);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const createArticle = async (article: Omit<Article, 'id' | 'created_at' | 'updated_at' | 'total_views' | 'like'>) => {
    try {
      setLoading(true);
      const newArticle = await ArticleService.create(article);
      setArticles(prev => [...prev, newArticle]);
      return newArticle;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateArticle = async (id: number, article: Partial<Article>) => {
    try {
      setLoading(true);
      const updatedArticle = await ArticleService.update(id, article);
      setArticles(prev => prev.map(a => a.id === id ? updatedArticle : a));
      return updatedArticle;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteArticle = async (id: number) => {
    try {
      setLoading(true);
      await ArticleService.delete(id);
      setArticles(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateArticleImage = async (id: number, file: File) => {
    try {
      setLoading(true);
      const updatedArticle = await ArticleService.updateImage(id, file);
      setArticles(prev => prev.map(a => a.id === id ? updatedArticle : a));
      return updatedArticle;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const incrementView = async (id: number) => {
    try {
      await ArticleService.incrementView(id);
      setArticles(prev => prev.map(a => 
        a.id === id ? { ...a, total_views: (a.total_views || 0) + 1 } : a
      ));
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      throw err;
    }
  };

  const toggleLike = async (id: number) => {
    try {
      const updatedArticle = await ArticleService.toggleLike(id);
      setArticles(prev => prev.map(a => a.id === id ? updatedArticle : a));
      return updatedArticle;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      throw err;
    }
  };

  useEffect(() => {
    fetchArticles();
  }, [JSON.stringify(filters)]);

  return {
    articles,
    totalCount,
    loading,
    error,
    filters,
    setFilters,
    createArticle,
    updateArticle,
    deleteArticle,
    updateArticleImage,
    incrementView,
    toggleLike,
    refreshArticles: fetchArticles
  };
};