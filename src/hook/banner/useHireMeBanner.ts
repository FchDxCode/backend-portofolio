import { useState, useEffect } from 'react';
import { HireMeBanner } from '@/src/models/BannerModels';
import { HireMeBannerService } from '@/src/services/banner/HireMeBannerServices';

export const useHireMeBanner = () => {
  const [banner, setBanner] = useState<HireMeBanner | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchBanner = async () => {
    try {
      setLoading(true);
      const data = await HireMeBannerService.get();
      setBanner(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const saveBanner = async (data: Partial<HireMeBanner>) => {
    try {
      setLoading(true);
      const updatedBanner = await HireMeBannerService.save(data);
      setBanner(updatedBanner);
      setError(null);
      return updatedBanner;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanner();
  }, []);

  return {
    banner,
    loading,
    error,
    saveBanner,
    refreshBanner: fetchBanner
  };
};