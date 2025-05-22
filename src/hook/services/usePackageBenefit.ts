import { useState, useEffect, useCallback } from 'react';
import { PackageBenefit } from '@/src/models/ServiceModels';
import { PackageBenefitService } from '@/src/services/services/PackageBenefitServices';

interface UsePackageBenefitOptions {
  initialPackagePricingId?: number;
}

export function usePackageBenefit(options?: UsePackageBenefitOptions) {
  const [benefits, setBenefits] = useState<PackageBenefit[]>([]);
  const [selectedBenefits, setSelectedBenefits] = useState<PackageBenefit[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Ambil semua benefit
  const fetchBenefits = useCallback(async (params?: {
    search?: string;
    packagePricingId?: number;
    sort?: 'created_at';
    order?: 'asc' | 'desc';
  }) => {
    setLoading(true);
    setError(null);
    try {
      const data = await PackageBenefitService.getAll(params);
      setBenefits(data);
    } catch (err) {
      console.error('Error fetching benefits:', err);
      setError(err instanceof Error ? err : new Error('Gagal mengambil data benefit'));
    } finally {
      setLoading(false);
    }
  }, []);

  // Ambil benefit untuk package pricing tertentu
  const fetchBenefitsByPackagePricing = useCallback(async (packagePricingId: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await PackageBenefitService.getByPackagePricingId(packagePricingId);
      setSelectedBenefits(data);
    } catch (err) {
      console.error(`Error fetching benefits for package pricing ${packagePricingId}:`, err);
      setError(err instanceof Error ? err : new Error('Gagal mengambil data benefit untuk paket ini'));
    } finally {
      setLoading(false);
    }
  }, []);

  // Buat benefit baru
  const createBenefit = useCallback(async (benefit: Omit<PackageBenefit, 'id' | 'created_at' | 'updated_at'>) => {
    setLoading(true);
    setError(null);
    try {
      const newBenefit = await PackageBenefitService.create(benefit);
      setBenefits(prev => [...prev, newBenefit]);
      return newBenefit;
    } catch (err) {
      console.error('Error creating benefit:', err);
      setError(err instanceof Error ? err : new Error('Gagal membuat benefit baru'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update benefit
  const updateBenefit = useCallback(async (id: number, benefit: Partial<PackageBenefit>) => {
    setLoading(true);
    setError(null);
    try {
      const updatedBenefit = await PackageBenefitService.update(id, benefit);
      setBenefits(prev => prev.map(b => b.id === id ? updatedBenefit : b));
      setSelectedBenefits(prev => prev.map(b => b.id === id ? updatedBenefit : b));
      return updatedBenefit;
    } catch (err) {
      console.error(`Error updating benefit ${id}:`, err);
      setError(err instanceof Error ? err : new Error('Gagal mengupdate benefit'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Hapus benefit
  const deleteBenefit = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      await PackageBenefitService.delete(id);
      setBenefits(prev => prev.filter(b => b.id !== id));
      setSelectedBenefits(prev => prev.filter(b => b.id !== id));
    } catch (err) {
      console.error(`Error deleting benefit ${id}:`, err);
      setError(err instanceof Error ? err : new Error('Gagal menghapus benefit'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Link benefit ke package pricing
  const linkToPackagePricing = useCallback(async (packagePricingId: number, benefitIds: number[]) => {
    setLoading(true);
    setError(null);
    try {
      await PackageBenefitService.linkToPackagePricing(packagePricingId, benefitIds);
      // Refresh selected benefits
      fetchBenefitsByPackagePricing(packagePricingId);
    } catch (err) {
      console.error(`Error linking benefits to package pricing ${packagePricingId}:`, err);
      setError(err instanceof Error ? err : new Error('Gagal menghubungkan benefit ke paket'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchBenefitsByPackagePricing]);

  // Load data saat komponen di-mount
  useEffect(() => {
    fetchBenefits();
    if (options?.initialPackagePricingId) {
      fetchBenefitsByPackagePricing(options.initialPackagePricingId);
    }
  }, [fetchBenefits, fetchBenefitsByPackagePricing, options?.initialPackagePricingId]);

  return {
    benefits,
    selectedBenefits,
    loading,
    error,
    fetchBenefits,
    fetchBenefitsByPackagePricing,
    createBenefit,
    updateBenefit,
    deleteBenefit,
    linkToPackagePricing
  };
}