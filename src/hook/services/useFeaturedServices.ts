import { useState, useEffect, useCallback } from 'react';
import { FeaturedService, ServiceBenefit } from '@/src/models/ServiceModels';
import { FeaturedServiceService } from '@/src/services/services/FeaturedServices';

// Interface untuk hasil hook
interface UseFeaturedServiceResult {
  services: FeaturedService[];
  loading: boolean;
  error: Error | null;
  currentService: FeaturedService | null;
  benefits: ServiceBenefit[];
  
  // Fungsi CRUD
  fetchServices: (params?: any) => Promise<void>;
  fetchServiceById: (id: number) => Promise<void>;
  createService: (
    service: Omit<FeaturedService, 'id' | 'created_at' | 'updated_at'> & {
      benefitIds?: number[];
      skillIds?: number[];
    },
    iconFile?: File
  ) => Promise<FeaturedService>;
  updateService: (
    id: number,
    service: Partial<FeaturedService> & {
      benefitIds?: number[];
      skillIds?: number[];
    },
    iconFile?: File
  ) => Promise<FeaturedService>;
  deleteService: (id: number) => Promise<void>;
  
  // Utility functions
  getIconUrl: (path: string) => string;
}

export function useFeaturedService(): UseFeaturedServiceResult {
  // State untuk menyimpan data
  const [services, setServices] = useState<FeaturedService[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [currentService, setCurrentService] = useState<FeaturedService | null>(null);
  const [benefits, setBenefits] = useState<ServiceBenefit[]>([]);

  // Fungsi untuk mengambil daftar layanan
  const fetchServices = useCallback(async (params?: any) => {
    setLoading(true);
    setError(null);
    try {
      const data = await FeaturedServiceService.getAll(params);
      setServices(data);
    } catch (err) {
      console.error('Error fetching services:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch services'));
    } finally {
      setLoading(false);
    }
  }, []);

  // Fungsi untuk mengambil layanan berdasarkan ID
  const fetchServiceById = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await FeaturedServiceService.getById(id);
      setCurrentService(data);
      
      // Jika service memiliki benefits, simpan di state benefits
      if (data?.benefits) {
        setBenefits(data.benefits);
      }
    } catch (err) {
      console.error(`Error fetching service with ID ${id}:`, err);
      setError(err instanceof Error ? err : new Error(`Failed to fetch service with ID ${id}`));
    } finally {
      setLoading(false);
    }
  }, []);

  // Fungsi untuk membuat layanan baru
  const createService = useCallback(async (
    service: Omit<FeaturedService, 'id' | 'created_at' | 'updated_at'> & {
      benefitIds?: number[];
      skillIds?: number[];
    },
    iconFile?: File
  ): Promise<FeaturedService> => {
    setLoading(true);
    setError(null);
    try {
      const newService = await FeaturedServiceService.create(service, iconFile);
      
      // Update daftar layanan
      setServices(prevServices => [...prevServices, newService]);
      
      // Set current service ke layanan baru
      setCurrentService(newService);
      
      return newService;
    } catch (err) {
      console.error('Error creating service:', err);
      const error = err instanceof Error ? err : new Error('Failed to create service');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fungsi untuk memperbarui layanan
  const updateService = useCallback(async (
    id: number,
    service: Partial<FeaturedService> & {
      benefitIds?: number[];
      skillIds?: number[];
    },
    iconFile?: File
  ): Promise<FeaturedService> => {
    setLoading(true);
    setError(null);
    try {
      const updatedService = await FeaturedServiceService.update(id, service, iconFile);
      
      // Update daftar layanan
      setServices(prevServices =>
        prevServices.map(s => s.id === id ? updatedService : s)
      );
      
      // Update current service jika yang diupdate adalah current service
      if (currentService?.id === id) {
        setCurrentService(updatedService);
        
        // Update benefits jika service memiliki benefits
        if (updatedService?.benefits) {
          setBenefits(updatedService.benefits);
        }
      }
      
      return updatedService;
    } catch (err) {
      console.error(`Error updating service with ID ${id}:`, err);
      const error = err instanceof Error ? err : new Error(`Failed to update service with ID ${id}`);
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [currentService]);

  // Fungsi untuk menghapus layanan
  const deleteService = useCallback(async (id: number): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await FeaturedServiceService.delete(id);
      
      // Hapus dari daftar layanan
      setServices(prevServices => prevServices.filter(s => s.id !== id));
      
      // Reset current service jika yang dihapus adalah current service
      if (currentService?.id === id) {
        setCurrentService(null);
        setBenefits([]);
      }
    } catch (err) {
      console.error(`Error deleting service with ID ${id}:`, err);
      setError(err instanceof Error ? err : new Error(`Failed to delete service with ID ${id}`));
    } finally {
      setLoading(false);
    }
  }, [currentService]);

  // Utility function untuk mendapatkan URL icon
  const getIconUrl = useCallback((path: string) => {
    return FeaturedServiceService.getIconUrl(path);
  }, []);

  // Lakukan fetch services pada saat komponen dipasang
  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  return {
    services,
    loading,
    error,
    currentService,
    benefits,
    fetchServices,
    fetchServiceById,
    createService,
    updateService,
    deleteService,
    getIconUrl
  };
}