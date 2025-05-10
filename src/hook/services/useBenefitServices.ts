import { useState, useEffect, useCallback } from 'react';
import { ServiceBenefit } from '@/src/models/ServiceModels';
import { ServiceBenefitService } from '@/src/services/services/BenefitServices';

interface BenefitFilters {
  search?: string;
  sort?: 'created_at' | 'title';
  order?: 'asc' | 'desc';
}

export const useServiceBenefits = (initialFilters?: BenefitFilters) => {
  const [benefits, setBenefits] = useState<ServiceBenefit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [filters, setFilters] = useState<BenefitFilters>(initialFilters || {});

  const fetchBenefits = useCallback(async () => {
    try {
      setLoading(true);
      const data = await ServiceBenefitService.getAll(filters);
      setBenefits(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const createBenefit = async (benefit: Omit<ServiceBenefit, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setLoading(true);
      const newBenefit = await ServiceBenefitService.create(benefit);
      setBenefits(prev => [newBenefit, ...prev]);
      return newBenefit;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateBenefit = async (id: number, benefit: Partial<ServiceBenefit>) => {
    try {
      setLoading(true);
      const updatedBenefit = await ServiceBenefitService.update(id, benefit);
      setBenefits(prev => prev.map(b => b.id === id ? updatedBenefit : b));
      return updatedBenefit;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteBenefit = async (id: number) => {
    try {
      setLoading(true);
      await ServiceBenefitService.delete(id);
      setBenefits(prev => prev.filter(b => b.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBenefits();
  }, [fetchBenefits]);

  return {
    benefits,
    loading,
    error,
    filters,
    setFilters,
    createBenefit,
    updateBenefit,
    deleteBenefit,
    refreshBenefits: fetchBenefits
  };
};