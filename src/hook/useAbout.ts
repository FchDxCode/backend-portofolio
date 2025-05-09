import { useState, useEffect } from 'react';
import { About } from '../models/SingletonModels';
import { AboutService } from '../services/AboutServices';

export const useAbout = () => {
  const [about, setAbout] = useState<About | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch about data
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

  // Save about data
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

  // Update images
  const updateImages = async (
    id: number,
    files: {
      image?: File;
      title_image?: File;
      subtitle_image?: File;
    }
  ) => {
    try {
      setLoading(true);
      const updated = await AboutService.updateImages(id, files);
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

  // Load initial data
  useEffect(() => {
    fetchAbout();
  }, []);

  return {
    about,
    loading,
    error,
    fetchAbout,
    saveAbout,
    updateImages,
  };
};