import { useState, useEffect, useCallback } from 'react';
import { Certificate } from '@/src/models/CertificateModels';
import { CertificateService } from '@/src/services/CertificateServices';

interface CertificateFilters {
  skillId?: number;
  isValid?: boolean;
  issuedDateStart?: string;
  issuedDateEnd?: string;
  sort?: 'issued_date' | 'valid_until' | 'created_at';
  order?: 'asc' | 'desc';
  search?: string;
  page?: number;
  limit?: number;
}

export const useCertificates = (initialFilters?: CertificateFilters) => {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [filters, setFilters] = useState<CertificateFilters>(
    initialFilters || { page: 1, limit: 10 }
  );

  const fetchCertificates = useCallback(async () => {
    try {
      setLoading(true);
      const { data, count } = await CertificateService.getAll(filters);
      setCertificates(data);
      setTotalCount(count);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const createCertificate = async (
    data: Omit<Certificate, 'id' | 'created_at' | 'updated_at'>,
    files?: { pdf?: File; image?: File }
  ) => {
    try {
      setLoading(true);
      const newCertificate = await CertificateService.create(data);
      
      if (files && (files.pdf || files.image)) {
        await CertificateService.uploadFiles(newCertificate.id, files);
      }

      setCertificates(prev => [newCertificate, ...prev]);
      setTotalCount(prev => prev + 1);
      return newCertificate;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateCertificate = async (
    id: number,
    data: Partial<Certificate>,
    files?: { pdf?: File; image?: File }
  ) => {
    try {
      setLoading(true);
      let updatedCertificate = await CertificateService.update(id, data);
      
      if (files && (files.pdf || files.image)) {
        updatedCertificate = await CertificateService.uploadFiles(id, files);
      }

      setCertificates(prev => 
        prev.map(cert => cert.id === id ? updatedCertificate : cert)
      );
      return updatedCertificate;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteCertificate = async (id: number) => {
    try {
      setLoading(true);
      await CertificateService.delete(id);
      setCertificates(prev => prev.filter(cert => cert.id !== id));
      setTotalCount(prev => prev - 1);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteFiles = async (id: number, type: 'pdf' | 'image' | 'both') => {
    try {
      setLoading(true);
      await CertificateService.deleteFiles(id, type);
      // Refresh certificate data
      const updatedCertificate = await CertificateService.getById(id);
      if (updatedCertificate) {
        setCertificates(prev =>
          prev.map(cert => cert.id === id ? updatedCertificate : cert)
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const uploadFiles = async (id: number, files: { pdf?: File; image?: File }) => {
    try {
      setLoading(true);
      const updatedCertificate = await CertificateService.uploadFiles(id, files);
      setCertificates(prev =>
        prev.map(cert => cert.id === id ? updatedCertificate : cert)
      );
      return updatedCertificate;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, [fetchCertificates]);

  return {
    certificates,
    totalCount,
    loading,
    error,
    filters,
    setFilters,
    createCertificate,
    updateCertificate,
    deleteCertificate,
    uploadFiles,
    deleteFiles,
    refreshCertificates: fetchCertificates,
    isValid: CertificateService.isValid
  };
};