import { useState, useEffect, useCallback } from 'react';
import { Testimonial } from '@/src/models/ServiceModels';
import { TestimonialService } from '@/src/services/services/TestimonialServices';

interface TestimonialFilters {
  search?: string;
  categoryId?: number;
  industry?: string;
  year?: number;
  star?: number;
  sort?: 'star' | 'created_at' | 'name' | 'year';
  order?: 'asc' | 'desc';
  withCategory?: boolean;
}

export const useTestimonials = (initialFilters?: TestimonialFilters) => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [filters, setFilters] = useState<TestimonialFilters>(initialFilters || {});
  const [industries, setIndustries] = useState<string[]>([]);
  const [years, setYears] = useState<number[]>([]);

  const fetchTestimonials = useCallback(async () => {
    try {
      setLoading(true);
      const data = await TestimonialService.getAll(filters);
      setTestimonials(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const fetchFilterOptions = useCallback(async () => {
    try {
      const [industriesData, yearsData] = await Promise.all([
        TestimonialService.getUniqueIndustries(),
        TestimonialService.getUniqueYears()
      ]);
      
      setIndustries(industriesData);
      setYears(yearsData);
    } catch (err) {
      console.error('Error fetching filter options:', err);
    }
  }, []);

  const createTestimonial = async (
    testimonial: Omit<Testimonial, 'id' | 'created_at' | 'updated_at'>,
    profileFile?: File
  ) => {
    try {
      setLoading(true);
      const newTestimonial = await TestimonialService.create(testimonial, profileFile);
      setTestimonials(prev => [newTestimonial, ...prev]);
      return newTestimonial;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateTestimonial = async (
    id: number,
    testimonial: Partial<Testimonial>,
    newProfileFile?: File
  ) => {
    try {
      setLoading(true);
      const updatedTestimonial = await TestimonialService.update(id, testimonial, newProfileFile);
      setTestimonials(prev => 
        prev.map(t => t.id === id ? updatedTestimonial : t)
      );
      return updatedTestimonial;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteTestimonial = async (id: number) => {
    try {
      setLoading(true);
      await TestimonialService.delete(id);
      setTestimonials(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, [fetchTestimonials]);

  useEffect(() => {
    fetchFilterOptions();
  }, [fetchFilterOptions]);

  return {
    testimonials,
    loading,
    error,
    filters,
    setFilters,
    industries,
    years,
    createTestimonial,
    updateTestimonial,
    deleteTestimonial,
    refreshTestimonials: fetchTestimonials,
    formatStars: TestimonialService.formatStars,
    getProfileUrl: TestimonialService.getProfileUrl
  };
};