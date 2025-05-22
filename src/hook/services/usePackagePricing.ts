import { useState, useEffect, useCallback } from 'react';
import { PackagePricing } from '@/src/models/ServiceModels';
import { PackagePricingService } from '@/src/services/services/PackagePricingServices';

interface UsePackagePricingOptions {
  withRelations?: boolean;
  defaultSort?: 'price' | 'created_at';
  defaultOrder?: 'asc' | 'desc';
}

export function usePackagePricing(options?: UsePackagePricingOptions) {
  const [packages, setPackages] = useState<PackagePricing[]>([]);
  const [currentPackage, setCurrentPackage] = useState<PackagePricing | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Ambil semua package pricing
  const fetchPackages = useCallback(async (params?: {
    search?: string;
    benefitId?: number;
    exclusionId?: number;
    sort?: 'price' | 'created_at';
    order?: 'asc' | 'desc';
    withRelations?: boolean;
  }) => {
    setLoading(true);
    setError(null);
    try {
      const withRelations = params?.withRelations ?? options?.withRelations ?? false;
      const data = await PackagePricingService.getAll({
        ...params,
        sort: params?.sort || options?.defaultSort || 'created_at',
        order: params?.order || options?.defaultOrder || 'desc',
        withRelations
      });
      setPackages(data);
    } catch (err) {
      console.error('Error fetching package pricing:', err);
      setError(err instanceof Error ? err : new Error('Gagal mengambil data paket harga'));
    } finally {
      setLoading(false);
    }
  }, [options?.withRelations, options?.defaultSort, options?.defaultOrder]);

  // Ambil detail package pricing
  const fetchPackageById = useCallback(async (id: number, withRelations = true) => {
    setLoading(true);
    setError(null);
    try {
      const data = await PackagePricingService.getById(id, withRelations);
      setCurrentPackage(data);
      return data;
    } catch (err) {
      console.error(`Error fetching package pricing ${id}:`, err);
      setError(err instanceof Error ? err : new Error('Gagal mengambil detail paket harga'));
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Buat package pricing baru
  const createPackage = useCallback(async (
    pricing: Omit<PackagePricing, 'id' | 'created_at' | 'updated_at'> & {
      benefitIds?: number[];
      exclusionIds?: number[];
    }
  ) => {
    setLoading(true);
    setError(null);
    try {
      const newPackage = await PackagePricingService.create(pricing);
      setPackages(prev => [...prev, newPackage]);
      return newPackage;
    } catch (err) {
      console.error('Error creating package pricing:', err);
      setError(err instanceof Error ? err : new Error('Gagal membuat paket harga baru'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update package pricing
  const updatePackage = useCallback(async (
    id: number,
    pricing: Partial<PackagePricing> & {
      benefitIds?: number[];
      exclusionIds?: number[];
    }
  ) => {
    setLoading(true);
    setError(null);
    try {
      const updatedPackage = await PackagePricingService.update(id, pricing);
      setPackages(prev => prev.map(p => p.id === id ? updatedPackage : p));
      if (currentPackage?.id === id) {
        setCurrentPackage(updatedPackage);
      }
      return updatedPackage;
    } catch (err) {
      console.error(`Error updating package pricing ${id}:`, err);
      setError(err instanceof Error ? err : new Error('Gagal mengupdate paket harga'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentPackage]);

  // Hapus package pricing
  const deletePackage = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      await PackagePricingService.delete(id);
      setPackages(prev => prev.filter(p => p.id !== id));
      if (currentPackage?.id === id) {
        setCurrentPackage(null);
      }
    } catch (err) {
      console.error(`Error deleting package pricing ${id}:`, err);
      setError(err instanceof Error ? err : new Error('Gagal menghapus paket harga'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentPackage]);

  // Bulk create packages
  const bulkCreatePackages = useCallback(async (
    pricings: (Omit<PackagePricing, 'id' | 'created_at' | 'updated_at'> & {
      benefitIds?: number[];
      exclusionIds?: number[];
    })[]
  ) => {
    setLoading(true);
    setError(null);
    try {
      const newPackages = await PackagePricingService.bulkCreate(pricings);
      setPackages(prev => [...prev, ...newPackages]);
      return newPackages;
    } catch (err) {
      console.error('Error bulk creating package pricing:', err);
      setError(err instanceof Error ? err : new Error('Gagal membuat paket harga secara massal'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Bulk delete packages
  const bulkDeletePackages = useCallback(async (ids: number[]) => {
    setLoading(true);
    setError(null);
    try {
      await PackagePricingService.bulkDelete(ids);
      setPackages(prev => prev.filter(p => !ids.includes(p.id)));
      if (currentPackage && ids.includes(currentPackage.id)) {
        setCurrentPackage(null);
      }
    } catch (err) {
      console.error('Error bulk deleting package pricing:', err);
      setError(err instanceof Error ? err : new Error('Gagal menghapus paket harga secara massal'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentPackage]);

  // Format harga
  const formatPrice = useCallback((price: number) => {
    return PackagePricingService.formatPrice(price);
  }, []);

  // Format durasi
  const formatDuration = useCallback((duration: Record<string, any>) => {
    return PackagePricingService.formatDuration(duration);
  }, []);

  // Load data saat komponen di-mount
  useEffect(() => {
    fetchPackages({
      withRelations: options?.withRelations,
      sort: options?.defaultSort,
      order: options?.defaultOrder
    });
  }, [fetchPackages, options?.withRelations, options?.defaultSort, options?.defaultOrder]);

  return {
    packages,
    currentPackage,
    loading,
    error,
    fetchPackages,
    fetchPackageById,
    createPackage,
    updatePackage,
    deletePackage,
    bulkCreatePackages,
    bulkDeletePackages,
    formatPrice,
    formatDuration
  };
}