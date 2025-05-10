import { useState, useEffect } from 'react';
import { CookiePolicy } from '@/src/models/WebSettingModels';
import { PolicyService } from '@/src/services/websetting/PolicyServices';

export const useCookiePolicy = () => {
  const [cookiePolicy, setCookiePolicy] = useState<CookiePolicy | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchPolicy = async () => {
      try {
        setLoading(true);
        const data = await PolicyService.getCookiePolicy();
        setCookiePolicy(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setLoading(false);
      }
    };

    fetchPolicy();
  }, []);

  const updateCookiePolicy = async (
    policy: Omit<CookiePolicy, 'id' | 'created_at' | 'updated_at'>
  ) => {
    try {
      setLoading(true);
      const updatedPolicy = await PolicyService.upsertCookiePolicy(policy);
      setCookiePolicy(updatedPolicy);
      return updatedPolicy;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    cookiePolicy,
    loading,
    error,
    updateCookiePolicy
  };
};