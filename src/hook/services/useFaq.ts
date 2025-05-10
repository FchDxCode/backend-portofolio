import { useState, useEffect, useCallback } from 'react';
import { Faq } from '@/src/models/ServiceModels';
import { FaqService } from '@/src/services/services/FaqServices';

interface FaqFilters {
  search?: string;
  sort?: 'created_at';
  order?: 'asc' | 'desc';
}

export const useFaqs = (initialFilters?: FaqFilters) => {
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [filters, setFilters] = useState<FaqFilters>(initialFilters || {});

  const fetchFaqs = useCallback(async () => {
    try {
      setLoading(true);
      const data = await FaqService.getAll(filters);
      setFaqs(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const createFaq = async (
    faq: Omit<Faq, 'id' | 'created_at' | 'updated_at'>
  ) => {
    try {
      setLoading(true);
      const newFaq = await FaqService.create(faq);
      setFaqs(prev => [newFaq, ...prev]);
      return newFaq;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateFaq = async (
    id: number,
    faq: Partial<Faq>
  ) => {
    try {
      setLoading(true);
      const updatedFaq = await FaqService.update(id, faq);
      setFaqs(prev => prev.map(f => f.id === id ? updatedFaq : f));
      return updatedFaq;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteFaq = async (id: number) => {
    try {
      setLoading(true);
      await FaqService.delete(id);
      setFaqs(prev => prev.filter(f => f.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaqs();
  }, [fetchFaqs]);

  return {
    faqs,
    loading,
    error,
    filters,
    setFilters,
    createFaq,
    updateFaq,
    deleteFaq,
    refreshFaqs: fetchFaqs
  };
};