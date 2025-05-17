import { useState, useEffect, useRef } from 'react';
import { Article, ArticleTag } from '@/src/models/ArticleModels';
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
      setError(null);
      const { data, count } = await ArticleService.getAll(filters);
      setArticles(data);
      setTotalCount(count);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const createArticle = async (
    article: Omit<Article, 'id' | 'created_at' | 'updated_at' | 'total_views' | 'like'>,
    tagIds?: number[]
  ) => {
    try {
      setLoading(true);
      setError(null);
      
      // Pass article data and tag IDs separately to the service
      const newArticle = await ArticleService.create(article, tagIds);
      
      setArticles(prev => [newArticle, ...prev]);
      return newArticle;
    } catch (err) {
      console.error('Hook error creating article:', err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateArticle = async (
    id: number, 
    article: Partial<Article>,
    tagIds?: number[]
  ) => {
    try {
      setLoading(true);
      setError(null);
      const updatedArticle = await ArticleService.update(id, article, tagIds);
      setArticles(prev => 
        prev.map(a => a.id === id ? updatedArticle : a)
      );
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
      setError(null);
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
      setError(null);
      const updatedArticle = await ArticleService.updateImage(id, file);
      setArticles(prev => 
        prev.map(a => a.id === id ? updatedArticle : a)
      );
      return updatedArticle;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const incrementView = async (id: number, readTime?: number) => {
    try {
      await ArticleService.incrementView(id, readTime);
      // Update state secara lokal untuk mencerminkan perubahan
      if (readTime !== undefined) {
        setArticles(prev => 
          prev.map(a => {
            if (a.id === id) {
              const currentTotalViews = a.total_views || 0;
              const currentMinuteRead = a.minute_read || 0;
              
              // Hitung rata-rata baru: ((old_avg * n) + new_value) / (n + 1)
              const newMinuteRead = currentTotalViews > 0
                ? ((currentMinuteRead * currentTotalViews) + readTime) / (currentTotalViews + 1)
                : readTime;
                
              return { 
                ...a, 
                total_views: currentTotalViews + 1,
                minute_read: newMinuteRead
              };
            }
            return a;
          })
        );
      } else {
        // Jika readTime tidak disediakan, hanya increment view
        setArticles(prev => 
          prev.map(a => 
            a.id === id ? { ...a, total_views: (a.total_views || 0) + 1 } : a
          )
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    }
  };

  const toggleLike = async (id: number) => {
    try {
      const updatedArticle = await ArticleService.toggleLike(id);
      setArticles(prev => 
        prev.map(a => a.id === id ? updatedArticle : a)
      );
      return updatedArticle;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      throw err;
    }
  };
  
  const getArticleTags = async (id: number) => {
    try {
      return await ArticleService.getArticleTags(id);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      throw err;
    }
  };

  // Effect untuk memuat artikel saat filters berubah
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
    getArticleTags,
    refreshArticles: fetchArticles
  };
};

// Hook untuk menangani tags
export const useArticleTags = () => {
  const [tags, setTags] = useState<ArticleTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTags = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ArticleService.getAllTags();
      setTags(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  return { 
    tags, 
    loading, 
    error, 
    refreshTags: fetchTags 
  };
};

// Hook untuk melacak waktu baca artikel
export const useReadTimeTracker = (articleId: number) => {
  const [readTime, setReadTime] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [lastInteractionTime, setLastInteractionTime] = useState(Date.now());
  const [isSent, setIsSent] = useState(false);
  const intervalRef = useRef<number | null>(null);
  
  // Mulai pelacakan waktu
  const startTracking = () => {
    if (!isActive) {
      setIsActive(true);
      setLastInteractionTime(Date.now());
      
      // Buat interval untuk mengupdate waktu baca
      const intervalId = window.setInterval(() => {
        const now = Date.now();
        const timeSinceLastInteraction = (now - lastInteractionTime) / 1000; // dalam detik
        
        // Jika user tidak berinteraksi selama lebih dari 30 detik, anggap mereka tidak membaca
        if (timeSinceLastInteraction < 30) {
          setReadTime(prev => prev + 1); // Tambahkan 1 detik ke waktu baca
        }
      }, 1000);
      
      intervalRef.current = intervalId;
    }
  };
  
  // Hentikan pelacakan waktu
  const stopTracking = () => {
    if (isActive && intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
      setIsActive(false);
    }
  };
  
  // Reset interaction timer
  const resetInteraction = () => {
    setLastInteractionTime(Date.now());
  };
  
  // Kirim waktu baca ke server
  const sendReadTime = async () => {
    if (!isSent && readTime > 0) {
      try {
        await ArticleService.incrementView(articleId, readTime / 60); // Konversi ke menit
        setIsSent(true);
        return true;
      } catch (err) {
        console.error('Error sending read time:', err);
        return false;
      }
    }
    return false;
  };
  
  // Cleanup interval saat unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current);
      }
    };
  }, []);
  
  return {
    readTime,
    isActive,
    startTracking,
    stopTracking,
    resetInteraction,
    sendReadTime,
    isSent
  };
};