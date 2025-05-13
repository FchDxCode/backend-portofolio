import { useState, useEffect, useCallback } from 'react';
import { CookiePolicyService } from '@/src/services/websetting/CookiePolicyServices';
import { CookiePolicy } from '@/src/models/WebSettingModels';

interface CookiePolicyHook {
  cookiePolicy: CookiePolicy | null;
  loading: boolean;
  error: string | null;
  saveCookiePolicy: (policy: Partial<CookiePolicy>) => Promise<boolean>;
  refresh: () => Promise<void>;
}

/**
 * Hook untuk mengelola cookie policy
 * @returns {CookiePolicyHook} Object dengan state dan fungsi untuk mengelola cookie policy
 */
export const useCookiePolicy = (): CookiePolicyHook => {
  const [cookiePolicy, setCookiePolicy] = useState<CookiePolicy | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCookiePolicy = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await CookiePolicyService.get();
      setCookiePolicy(data);
    } catch (err) {
      setError('Gagal memuat kebijakan cookie');
      console.error('Error in useCookiePolicy hook:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCookiePolicy();
  }, [fetchCookiePolicy]);

  const saveCookiePolicy = async (policy: Partial<CookiePolicy>): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      const result = await CookiePolicyService.save(policy);
      if (result) {
        setCookiePolicy(result);
        return true;
      }
      setError('Gagal menyimpan kebijakan cookie');
      return false;
    } catch (err) {
      setError('Terjadi kesalahan saat menyimpan kebijakan cookie');
      console.error('Error saving cookie policy:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    cookiePolicy,
    loading,
    error,
    saveCookiePolicy,
    refresh: fetchCookiePolicy
  };
};

export default useCookiePolicy;