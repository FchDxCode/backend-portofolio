import { useState, useEffect, useCallback } from 'react';
import { PackageExclusion } from '@/src/models/ServiceModels';
import { PackageExclusionService } from '@/src/services/services/PackageExclusionServices';

interface UsePackageExclusionOptions {
  initialPackagePricingId?: number;
}

export function usePackageExclusion(options?: UsePackageExclusionOptions) {
  const [exclusions, setExclusions] = useState<PackageExclusion[]>([]);
  const [selectedExclusions, setSelectedExclusions] = useState<PackageExclusion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Ambil semua exclusion
  const fetchExclusions = useCallback(async (params?: {
    search?: string;
    packagePricingId?: number;
    sort?: 'created_at';
    order?: 'asc' | 'desc';
  }) => {
    setLoading(true);
    setError(null);
    try {
      const data = await PackageExclusionService.getAll(params);
      setExclusions(data);
    } catch (err) {
      console.error('Error fetching exclusions:', err);
      setError(err instanceof Error ? err : new Error('Gagal mengambil data exclusion'));
    } finally {
      setLoading(false);
    }
  }, []);

  // Ambil exclusion untuk package pricing tertentu
  const fetchExclusionsByPackagePricing = useCallback(async (packagePricingId: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await PackageExclusionService.getByPackagePricingId(packagePricingId);
      setSelectedExclusions(data);
    } catch (err) {
      console.error(`Error fetching exclusions for package pricing ${packagePricingId}:`, err);
      setError(err instanceof Error ? err : new Error('Gagal mengambil data exclusion untuk paket ini'));
    } finally {
      setLoading(false);
    }
  }, []);

  // Buat exclusion baru
  const createExclusion = useCallback(async (exclusion: Omit<PackageExclusion, 'id' | 'created_at' | 'updated_at'>) => {
    setLoading(true);
    setError(null);
    try {
      const newExclusion = await PackageExclusionService.create(exclusion);
      setExclusions(prev => [...prev, newExclusion]);
      return newExclusion;
    } catch (err) {
      console.error('Error creating exclusion:', err);
      setError(err instanceof Error ? err : new Error('Gagal membuat exclusion baru'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update exclusion
  const updateExclusion = useCallback(async (id: number, exclusion: Partial<PackageExclusion>) => {
    setLoading(true);
    setError(null);
    try {
      const updatedExclusion = await PackageExclusionService.update(id, exclusion);
      setExclusions(prev => prev.map(e => e.id === id ? updatedExclusion : e));
      setSelectedExclusions(prev => prev.map(e => e.id === id ? updatedExclusion : e));
      return updatedExclusion;
    } catch (err) {
      console.error(`Error updating exclusion ${id}:`, err);
      setError(err instanceof Error ? err : new Error('Gagal mengupdate exclusion'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Hapus exclusion
  const deleteExclusion = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      await PackageExclusionService.delete(id);
      setExclusions(prev => prev.filter(e => e.id !== id));
      setSelectedExclusions(prev => prev.filter(e => e.id !== id));
    } catch (err) {
      console.error(`Error deleting exclusion ${id}:`, err);
      setError(err instanceof Error ? err : new Error('Gagal menghapus exclusion'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Link exclusion ke package pricing
  const linkToPackagePricing = useCallback(async (packagePricingId: number, exclusionIds: number[]) => {
    setLoading(true);
    setError(null);
    try {
      await PackageExclusionService.linkToPackagePricing(packagePricingId, exclusionIds);
      // Refresh selected exclusions
      fetchExclusionsByPackagePricing(packagePricingId);
    } catch (err) {
      console.error(`Error linking exclusions to package pricing ${packagePricingId}:`, err);
      setError(err instanceof Error ? err : new Error('Gagal menghubungkan exclusion ke paket'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchExclusionsByPackagePricing]);

  // Load data saat komponen di-mount
  useEffect(() => {
    fetchExclusions();
    if (options?.initialPackagePricingId) {
      fetchExclusionsByPackagePricing(options.initialPackagePricingId);
    }
  }, [fetchExclusions, fetchExclusionsByPackagePricing, options?.initialPackagePricingId]);

  return {
    exclusions,
    selectedExclusions,
    loading,
    error,
    fetchExclusions,
    fetchExclusionsByPackagePricing,
    createExclusion,
    updateExclusion,
    deleteExclusion,
    linkToPackagePricing
  };
}