import { useState, useEffect } from 'react';
import { WebSetting } from '@/src/models/WebSettingModels';
import { WebSettingService } from '@/src/services/websetting/WebSettingServices';

export const useWebSetting = () => {
  const [webSetting, setWebSetting] = useState<WebSetting | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchSetting = async () => {
      try {
        setLoading(true);
        const data = await WebSettingService.getSetting();
        setWebSetting(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setLoading(false);
      }
    };

    fetchSetting();
  }, []);

  const updateSetting = async (
    setting: Omit<WebSetting, 'id' | 'created_at' | 'updated_at'>,
    logoFile?: File,
    faviconFile?: File,
    cvFile?: File,
    portfolioFile?: File
  ) => {
    try {
      setLoading(true);
      const updatedSetting = await WebSettingService.upsertSetting(
        setting,
        logoFile,
        faviconFile,
        cvFile,
        portfolioFile
      );
      setWebSetting(updatedSetting);
      return updatedSetting;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    webSetting,
    loading,
    error,
    updateSetting,
    getLogoUrl: (path?: string) => WebSettingService.getFileUrl(path || webSetting?.logo),
    getFaviconUrl: (path?: string) => WebSettingService.getFileUrl(path || webSetting?.favicon),
    getCvUrl: (path?: string) => WebSettingService.getDownloadUrl(path || webSetting?.cv),
    getPortfolioUrl: (path?: string) => WebSettingService.getDownloadUrl(path || webSetting?.portfolio)
  };
};