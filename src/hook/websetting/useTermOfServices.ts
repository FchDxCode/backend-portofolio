import { useState, useEffect } from 'react';
import { TermsOfService } from '@/src/models/WebSettingModels';
import { PolicyService } from '@/src/services/websetting/PolicyServices';

export const useTermsOfService = () => {
  const [termsOfService, setTermsOfService] = useState<TermsOfService | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchTerms = async () => {
      try {
        setLoading(true);
        const data = await PolicyService.getTermsOfService();
        setTermsOfService(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setLoading(false);
      }
    };

    fetchTerms();
  }, []);

  const updateTermsOfService = async (
    terms: Omit<TermsOfService, 'id' | 'created_at' | 'updated_at'>
  ) => {
    try {
      setLoading(true);
      const updatedTerms = await PolicyService.upsertTermsOfService(terms);
      setTermsOfService(updatedTerms);
      return updatedTerms;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    termsOfService,
    loading,
    error,
    updateTermsOfService
  };
};