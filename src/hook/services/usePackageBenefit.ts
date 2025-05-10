import { useState, useEffect, useCallback } from 'react';
import { PackageBenefit } from '@/src/models/ServiceModels';
import { PackageBenefitService } from '@/src/services/services/PackageBenefitServices';

interface BenefitFilters {
  search?: string;
  sort?: 'created_at' | 'title';
  order?: 'asc' | 'desc';
}

export const usePackageBenefits = (initialFilters?: BenefitFilters) => {
  const [benefits, setBenefits] = useState<PackageBenefit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [filters, setFilters] = useState<BenefitFilters>(initialFilters || {});

  const fetchBenefits = useCallback(async () => {
    try {
      setLoading(true);
      const data = await PackageBenefitService.getAll(filters);
      setBenefits(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const createBenefit = async (
    benefit: Omit<PackageBenefit, 'id' | 'created_at' | 'updated_at'>
  ) => {
    try {
      setLoading(true);
      const newBenefit = await PackageBenefitService.create(benefit);
      setBenefits(prev => [newBenefit, ...prev]);
      return newBenefit;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateBenefit = async (
    id: number,
    benefit: Partial<PackageBenefit>
  ) => {
    try {
      setLoading(true);
      const updatedBenefit = await PackageBenefitService.update(id, benefit);
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
      await PackageBenefitService.delete(id);
      setBenefits(prev => prev.filter(b => b.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const bulkCreateBenefits = async (
    benefitsData: Omit<PackageBenefit, 'id' | 'created_at' | 'updated_at'>[]
  ) => {
    try {
      setLoading(true);
      const newBenefits = await PackageBenefitService.bulkCreate(benefitsData);
      setBenefits(prev => [...newBenefits, ...prev]);
      return newBenefits;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const bulkUpdateBenefits = async (
    updates: { id: number; data: Partial<PackageBenefit> }[]
  ) => {
    try {
      setLoading(true);
      const updatedBenefits = await PackageBenefitService.bulkUpdate(updates);
      setBenefits(prev => {
        const updated = new Map(updatedBenefits.map(b => [b.id, b]));
        return prev.map(b => updated.get(b.id) || b);
      });
      return updatedBenefits;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const bulkDeleteBenefits = async (ids: number[]) => {
    try {
      setLoading(true);
      await PackageBenefitService.bulkDelete(ids);
      setBenefits(prev => prev.filter(b => !ids.includes(b.id)));
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
    bulkCreateBenefits,
    bulkUpdateBenefits,
    bulkDeleteBenefits,
    refreshBenefits: fetchBenefits
  };
};