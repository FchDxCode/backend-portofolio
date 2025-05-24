import { useState, useEffect, useCallback } from 'react';
import { Testimonial } from '@/src/models/ServiceModels';
import { TestimonialService } from '@/src/services/services/TestimonialServices';

interface TestimonialFilters {
  search?: string;
  categoryId?: number;
  star?: number;
  sort?: 'star' | 'name' | 'created_at';
  order?: 'asc' | 'desc';
  withCategory?: boolean;
}

export const useTestimonials = (initialFilters?: TestimonialFilters) => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [filters, setFilters] = useState<TestimonialFilters>(initialFilters || {});

  // Fetch list sesuai filters saat ini
  const fetchTestimonials = useCallback(async () => {
    setLoading(true);
    try {
      const data = await TestimonialService.getAll(filters);
      setTestimonials(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Fetch otomatis saat filters berubah
  useEffect(() => {
    fetchTestimonials();
  }, [fetchTestimonials]);

  const createTestimonial = useCallback(
    async (
      testimonial: Omit<Testimonial, 'id' | 'created_at' | 'updated_at'>,
      profileFile?: File
    ) => {
      setLoading(true);
      try {
        const newTestimonial = await TestimonialService.create(testimonial, profileFile);
        setTestimonials(prev => [newTestimonial, ...prev]);
        return newTestimonial;
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const updateTestimonial = useCallback(
    async (
      id: number,
      testimonial: Partial<Testimonial>,
      newProfileFile?: File
    ) => {
      setLoading(true);
      try {
        const updated = await TestimonialService.update(id, testimonial, newProfileFile);
        setTestimonials(prev =>
          prev.map(t => (t.id === id ? updated : t))
        );
        return updated;
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const deleteTestimonial = useCallback(
    async (id: number) => {
      setLoading(true);
      try {
        await TestimonialService.delete(id);
        setTestimonials(prev => prev.filter(t => t.id !== id));
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Ambil satu testimonial (dengan kategori)
  const getTestimonialById = useCallback(
    async (id: number): Promise<Testimonial | null> => {
      setLoading(true);
      try {
        const t = await TestimonialService.getById(id, true);
        return t;
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    testimonials,
    loading,
    error,
    filters,
    setFilters,
    createTestimonial,
    updateTestimonial,
    deleteTestimonial,
    getTestimonialById,
    refreshTestimonials: fetchTestimonials,
    formatStars: TestimonialService.formatStars,
    getProfileUrl: TestimonialService.getProfileUrl,
    getLocalizedText: TestimonialService.getLocalizedText,
    getProjectName: TestimonialService.getProjectName,
    getIndustryName: TestimonialService.getIndustryName,
  };
};
