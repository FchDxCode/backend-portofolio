import { useState, useEffect } from 'react';
import { HomeHero } from '../models/SingletonModels';
import { HomeHeroService } from '../services/HomeHeroServices';

export const useHomeHero = () => {
  const [hero, setHero] = useState<HomeHero | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch hero data
  const fetchHero = async () => {
    try {
      setLoading(true);
      const data = await HomeHeroService.get();
      setHero(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
    } finally {
      setLoading(false);
    }
  };

  // Save hero data
  const saveHero = async (data: Partial<HomeHero>) => {
    try {
      setLoading(true);
      const updated = await HomeHeroService.save(data);
      setHero(updated);
      setError(null);
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update image
  const updateImage = async (id: number, file: File) => {
    try {
      setLoading(true);
      const updated = await HomeHeroService.updateImage(id, file);
      setHero(updated);
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
    fetchHero();
  }, []);

  return {
    hero,
    loading,
    error,
    fetchHero,
    saveHero,
    updateImage
  };
};