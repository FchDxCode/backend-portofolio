import { useState, useEffect, useCallback } from 'react';
import { Brand } from '@/src/models/ServiceModels';
import { BrandService } from '@/src/services/services/BrandServices';

interface BrandFilters {
  search?: string;
  sort?: 'created_at' | 'title';
  order?: 'asc' | 'desc';
}

export const useBrands = (initialFilters?: BrandFilters) => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [filters, setFilters] = useState<BrandFilters>(initialFilters || {});

  const fetchBrands = useCallback(async () => {
    try {
      setLoading(true);
      const data = await BrandService.getAll(filters);
      setBrands(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const createBrand = async (brand: Omit<Brand, 'id' | 'created_at' | 'updated_at'>, image?: File) => {
    try {
      setLoading(true);
      const newBrand = await BrandService.create(brand, image);
      setBrands(prev => [newBrand, ...prev]);
      return newBrand;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateBrand = async (id: number, brand: Partial<Brand>, newImage?: File) => {
    try {
      setLoading(true);
      const updatedBrand = await BrandService.update(id, brand, newImage);
      setBrands(prev => prev.map(b => b.id === id ? updatedBrand : b));
      return updatedBrand;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteBrand = async (id: number) => {
    try {
      setLoading(true);
      await BrandService.delete(id);
      setBrands(prev => prev.filter(b => b.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, [fetchBrands]);

  return {
    brands,
    loading,
    error,
    filters,
    setFilters,
    createBrand,
    updateBrand,
    deleteBrand,
    refreshBrands: fetchBrands,
    getImageUrl: BrandService.getImageUrl
  };
};