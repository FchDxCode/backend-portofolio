import { useState, useEffect } from 'react';
import { CallToAction } from '@/src/models/BannerModels';
import { CallToActionService } from '@/src/services/banner/CallToActionServices';

export const useCallToAction = () => {
  const [cta, setCta] = useState<CallToAction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchCta = async () => {
    try {
      setLoading(true);
      const data = await CallToActionService.get();
      setCta(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const saveCta = async (data: Partial<CallToAction>) => {
    try {
      setLoading(true);
      const updatedCta = await CallToActionService.save(data);
      setCta(updatedCta);
      setError(null);
      return updatedCta;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCta();
  }, []);

  return {
    cta,
    loading,
    error,
    saveCta,
    refreshCta: fetchCta
  };
};