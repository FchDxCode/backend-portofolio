import { useState, useEffect, useCallback } from 'react';
import { PrivacyPolicyService } from '@/src/services/websetting/PrivacyPoliceServices';
import { PrivacyPolicy } from '@/src/models/WebSettingModels';

interface PrivacyPolicyHook {
  privacyPolicy: PrivacyPolicy | null;
  loading: boolean;
  error: string | null;
  savePrivacyPolicy: (policy: Partial<PrivacyPolicy>) => Promise<boolean>;
  refresh: () => Promise<void>;
}

/**
 * Hook untuk mengelola privacy policy
 * @returns {PrivacyPolicyHook} Object dengan state dan fungsi untuk mengelola privacy policy
 */
export const usePrivacyPolicy = (): PrivacyPolicyHook => {
  const [privacyPolicy, setPrivacyPolicy] = useState<PrivacyPolicy | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPrivacyPolicy = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await PrivacyPolicyService.get();
      setPrivacyPolicy(data);
    } catch (err) {
      setError('Gagal memuat kebijakan privasi');
      console.error('Error in usePrivacyPolicy hook:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrivacyPolicy();
  }, [fetchPrivacyPolicy]);

  const savePrivacyPolicy = async (policy: Partial<PrivacyPolicy>): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      const result = await PrivacyPolicyService.save(policy);
      if (result) {
        setPrivacyPolicy(result);
        return true;
      }
      setError('Gagal menyimpan kebijakan privasi');
      return false;
    } catch (err) {
      setError('Terjadi kesalahan saat menyimpan kebijakan privasi');
      console.error('Error saving privacy policy:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    privacyPolicy,
    loading,
    error,
    savePrivacyPolicy,
    refresh: fetchPrivacyPolicy
  };
};

export default usePrivacyPolicy;