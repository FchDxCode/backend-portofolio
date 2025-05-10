import { useState, useEffect, useCallback } from 'react';
import { SocialMedia } from '@/src/models/WebSettingModels';
import { SocialMediaService } from '@/src/services/websetting/SocialMediaServices';

interface SocialMediaFilters {
  search?: string;
  sort?: 'created_at';
  order?: 'asc' | 'desc';
}

export const useSocialMedia = (initialFilters?: SocialMediaFilters) => {
  const [socialMediaItems, setSocialMediaItems] = useState<SocialMedia[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [filters, setFilters] = useState<SocialMediaFilters>(initialFilters || {});

  const fetchSocialMedia = useCallback(async () => {
    try {
      setLoading(true);
      const data = await SocialMediaService.getAll(filters);
      setSocialMediaItems(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchSocialMedia();
  }, [fetchSocialMedia]);

  const createSocialMedia = async (
    socialMedia: Omit<SocialMedia, 'id' | 'created_at' | 'updated_at'>,
    iconFile?: File
  ) => {
    try {
      setLoading(true);
      const newSocialMedia = await SocialMediaService.create(socialMedia, iconFile);
      setSocialMediaItems(prev => [newSocialMedia, ...prev]);
      return newSocialMedia;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateSocialMedia = async (
    id: number,
    socialMedia: Partial<SocialMedia>,
    newIconFile?: File
  ) => {
    try {
      setLoading(true);
      const updatedSocialMedia = await SocialMediaService.update(id, socialMedia, newIconFile);
      setSocialMediaItems(prev => 
        prev.map(item => item.id === id ? updatedSocialMedia : item)
      );
      return updatedSocialMedia;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteSocialMedia = async (id: number) => {
    try {
      setLoading(true);
      await SocialMediaService.delete(id);
      setSocialMediaItems(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    socialMediaItems,
    loading,
    error,
    filters,
    setFilters,
    createSocialMedia,
    updateSocialMedia,
    deleteSocialMedia,
    refreshSocialMedia: fetchSocialMedia,
    getIconUrl: SocialMediaService.getIconUrl
  };
};