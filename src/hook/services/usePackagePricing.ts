import { useState, useEffect, useCallback } from 'react';
import { PackagePricing } from '@/src/models/ServiceModels';
import { PackagePricingService } from '@/src/services/services/PackagePricingServices';

interface PricingFilters {
  search?: string;
  benefitId?: number;
  exclusionId?: number;
  sort?: 'price' | 'work_duration' | 'created_at';
  order?: 'asc' | 'desc';
  withRelations?: boolean;
}

export const usePackagePricing = (initialFilters?: PricingFilters) => {
  const [pricing, setPricing] = useState<PackagePricing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [filters, setFilters] = useState<PricingFilters>(initialFilters || {});

  const fetchPricing = useCallback(async () => {
    try {
      setLoading(true);
      const data = await PackagePricingService.getAll(filters);
      setPricing(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const createPricing = async (
    pricing: Omit<PackagePricing, 'id' | 'created_at' | 'updated_at'>
  ) => {
    try {
      setLoading(true);
      const newPricing = await PackagePricingService.create(pricing);
      setPricing(prev => [newPricing, ...prev]);
      return newPricing;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updatePricing = async (
    id: number,
    pricing: Partial<PackagePricing>
  ) => {
    try {
      setLoading(true);
      const updatedPricing = await PackagePricingService.update(id, pricing);
      setPricing(prev => prev.map(p => p.id === id ? updatedPricing : p));
      return updatedPricing;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deletePricing = async (id: number) => {
    try {
      setLoading(true);
      await PackagePricingService.delete(id);
      setPricing(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const bulkCreatePricing = async (
    pricingsData: Omit<PackagePricing, 'id' | 'created_at' | 'updated_at'>[]
  ) => {
    try {
      setLoading(true);
      const newPricings = await PackagePricingService.bulkCreate(pricingsData);
      setPricing(prev => [...newPricings, ...prev]);
      return newPricings;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const bulkUpdatePricing = async (
    updates: { id: number; data: Partial<PackagePricing> }[]
  ) => {
    try {
      setLoading(true);
      const updatedPricings = await PackagePricingService.bulkUpdate(updates);
      setPricing(prev => {
        const updated = new Map(updatedPricings.map(p => [p.id, p]));
        return prev.map(p => updated.get(p.id) || p);
      });
      return updatedPricings;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const bulkDeletePricing = async (ids: number[]) => {
    try {
      setLoading(true);
      await PackagePricingService.bulkDelete(ids);
      setPricing(prev => prev.filter(p => !ids.includes(p.id)));
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPricing();
  }, [fetchPricing]);

  return {
    pricing,
    loading,
    error,
    filters,
    setFilters,
    createPricing,
    updatePricing,
    deletePricing,
    bulkCreatePricing,
    bulkUpdatePricing,
    bulkDeletePricing,
    refreshPricing: fetchPricing,
    formatPrice: PackagePricingService.formatPrice,
    formatDuration: PackagePricingService.formatDuration
  };
};