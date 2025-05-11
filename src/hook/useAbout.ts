import { useState, useEffect } from 'react';
import { About } from '../models/SingletonModels';
import { AboutService } from '../services/AboutServices';

export const useAbout = () => {
  const [about, setAbout] = useState<About | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAbout = async () => {
    try {
      setLoading(true);
      const data = await AboutService.get();
      setAbout(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
    } finally {
      setLoading(false);
    }
  };

  const saveAbout = async (data: Partial<About>) => {
    try {
      setLoading(true);
      const updated = await AboutService.save(data);
      setAbout(updated);
      setError(null);
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateImage = async (
    id: number,
    image?: File
  ) => {
    try {
      setLoading(true);
      const updated = await AboutService.updateImage(id, image);
      setAbout(updated);
      setError(null);
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateTitleData = async (
    id: number,
    titleData: Record<string, any>
  ) => {
    try {
      setLoading(true);
      const updated = await AboutService.updateTitleData(id, titleData);
      setAbout(updated);
      setError(null);
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateSubtitleData = async (
    id: number,
    subtitleData: Record<string, any>
  ) => {
    try {
      setLoading(true);
      const updated = await AboutService.updateSubtitleData(id, subtitleData);
      setAbout(updated);
      setError(null);
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAbout();
  }, []);

  return {
    about,
    loading,
    error,
    fetchAbout,
    saveAbout,
    updateImage,
    updateTitleData,
    updateSubtitleData,
  };
};