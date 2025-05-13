import { useState, useEffect, useCallback } from 'react';
import { TermsOfServiceService } from '@/src/services/websetting/TermOfServices';
import { TermsOfService } from '@/src/models/WebSettingModels';

interface TermsOfServiceHook {
  termsOfService: TermsOfService | null;
  loading: boolean;
  error: string | null;
  saveTermsOfService: (terms: Partial<TermsOfService>) => Promise<boolean>;
  refresh: () => Promise<void>;
}

/**
 * Hook untuk mengelola terms of service
 * @returns {TermsOfServiceHook} Object dengan state dan fungsi untuk mengelola terms of service
 */
export const useTermsOfService = (): TermsOfServiceHook => {
  const [termsOfService, setTermsOfService] = useState<TermsOfService | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTermsOfService = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await TermsOfServiceService.get();
      setTermsOfService(data);
    } catch (err) {
      setError('Gagal memuat syarat layanan');
      console.error('Error in useTermsOfService hook:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTermsOfService();
  }, [fetchTermsOfService]);

  const saveTermsOfService = async (terms: Partial<TermsOfService>): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      const result = await TermsOfServiceService.save(terms);
      if (result) {
        setTermsOfService(result);
        return true;
      }
      setError('Gagal menyimpan syarat layanan');
      return false;
    } catch (err) {
      setError('Terjadi kesalahan saat menyimpan syarat layanan');
      console.error('Error saving terms of service:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    termsOfService,
    loading,
    error,
    saveTermsOfService,
    refresh: fetchTermsOfService
  };
};

export default useTermsOfService;