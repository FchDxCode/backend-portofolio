import { useState, useEffect } from 'react';
import { PrivacyPolicy } from '@/src/models/WebSettingModels';
import { PolicyService } from '@/src/services/websetting/PolicyServices';

export const usePrivacyPolicy = () => {
  const [privacyPolicy, setPrivacyPolicy] = useState<PrivacyPolicy | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchPolicy = async () => {
      try {
        setLoading(true);
        const data = await PolicyService.getPrivacyPolicy();
        setPrivacyPolicy(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setLoading(false);
      }
    };

    fetchPolicy();
  }, []);

  const updatePrivacyPolicy = async (
    policy: Omit<PrivacyPolicy, 'id' | 'created_at' | 'updated_at'>
  ) => {
    try {
      setLoading(true);
      const updatedPolicy = await PolicyService.upsertPrivacyPolicy(policy);
      setPrivacyPolicy(updatedPolicy);
      return updatedPolicy;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    privacyPolicy,
    loading,
    error,
    updatePrivacyPolicy
  };
};