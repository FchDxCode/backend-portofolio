import { useState, useEffect, useCallback } from 'react';
import { ContactForm } from '@/src/models/ContactModels';
import { ContactFormService } from '@/src/services/contact/ContactFormServices';

interface ContactFormFilters {
  search?: string;
  sort?: 'created_at';
  order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export const useContactForms = (initialFilters?: ContactFormFilters) => {
  const [forms, setForms] = useState<ContactForm[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [filters, setFilters] = useState<ContactFormFilters>(
    initialFilters || { page: 1, limit: 10 }
  );

  const fetchForms = useCallback(async () => {
    try {
      setLoading(true);
      const { data, count } = await ContactFormService.getAll(filters);
      setForms(data);
      setTotalCount(count);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const submitForm = async (form: Omit<ContactForm, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setLoading(true);
      const newForm = await ContactFormService.submit(form);
      setForms(prev => [newForm, ...prev]);
      setTotalCount(prev => prev + 1);
      return newForm;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteForm = async (id: number) => {
    try {
      setLoading(true);
      await ContactFormService.delete(id);
      setForms(prev => prev.filter(form => form.id !== id));
      setTotalCount(prev => prev - 1);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const bulkDelete = async (ids: number[]) => {
    try {
      setLoading(true);
      await ContactFormService.bulkDelete(ids);
      setForms(prev => prev.filter(form => !ids.includes(form.id)));
      setTotalCount(prev => prev - ids.length);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForms();
  }, [fetchForms]);

  return {
    forms,
    totalCount,
    loading,
    error,
    filters,
    setFilters,
    submitForm,
    deleteForm,
    bulkDelete,
    refreshForms: fetchForms
  };
};