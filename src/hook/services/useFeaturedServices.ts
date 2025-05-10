import { useState, useEffect, useCallback } from 'react';
import { FeaturedService } from '@/src/models/ServiceModels';
import { FeaturedServiceService } from '@/src/services/services/FeaturedServices';

interface ServiceFilters {
  benefitId?: number;
  skillId?: number;
  search?: string;
  sort?: 'created_at';
  order?: 'asc' | 'desc';
}

export const useFeaturedServices = (initialFilters?: ServiceFilters) => {
  const [services, setServices] = useState<FeaturedService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [filters, setFilters] = useState<ServiceFilters>(initialFilters || {});

  const fetchServices = useCallback(async () => {
    try {
      setLoading(true);
      const data = await FeaturedServiceService.getAll(filters);
      setServices(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const createService = async (
    service: Omit<FeaturedService, 'id' | 'created_at' | 'updated_at'>,
    iconFile?: File
  ) => {
    try {
      setLoading(true);
      const newService = await FeaturedServiceService.create(service, iconFile);
      setServices(prev => [newService, ...prev]);
      return newService;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateService = async (
    id: number,
    service: Partial<FeaturedService>,
    newIconFile?: File
  ) => {
    try {
      setLoading(true);
      const updatedService = await FeaturedServiceService.update(id, service, newIconFile);
      setServices(prev => prev.map(s => s.id === id ? updatedService : s));
      return updatedService;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteService = async (id: number) => {
    try {
      setLoading(true);
      await FeaturedServiceService.delete(id);
      setServices(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  return {
    services,
    loading,
    error,
    filters,
    setFilters,
    createService,
    updateService,
    deleteService,
    refreshServices: fetchServices,
    getIconUrl: FeaturedServiceService.getIconUrl
  };
};