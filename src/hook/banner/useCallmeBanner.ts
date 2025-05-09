import { useState, useEffect } from 'react';
import { CallmeBanner, CallmeBannerItem } from '@/src/models/BannerModels';
import { CallmeBannerService } from '@/src/services/banner/CallMeBannerServices';
import { CallmeBannerItemService } from '@/src/services/banner/CallMeBannerItemServices';


export const useCallmeBanner = () => {
  const [banner, setBanner] = useState<CallmeBanner | null>(null);
  const [items, setItems] = useState<CallmeBannerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchBanner = async () => {
    try {
      setLoading(true);
      const data = await CallmeBannerService.get();
      setBanner(data);

      if (data?.id) {
        const itemsData = await CallmeBannerItemService.getByBannerId(data.id);
        setItems(itemsData);
      }

      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const saveBanner = async (data: Partial<CallmeBanner>) => {
    try {
      setLoading(true);
      const updatedBanner = await CallmeBannerService.save(data);
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

  const createItem = async (item: Omit<CallmeBannerItem, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setLoading(true);
      const newItem = await CallmeBannerItemService.create(item);
      setItems(prev => [...prev, newItem]);
      return newItem;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateItem = async (id: number, item: Partial<CallmeBannerItem>) => {
    try {
      setLoading(true);
      const updatedItem = await CallmeBannerItemService.update(id, item);
      setItems(prev => prev.map(i => i.id === id ? updatedItem : i));
      return updatedItem;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteItem = async (id: number) => {
    try {
      setLoading(true);
      await CallmeBannerItemService.delete(id);
      setItems(prev => prev.filter(i => i.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const bulkCreateItems = async (items: Omit<CallmeBannerItem, 'id' | 'created_at' | 'updated_at' | 'banner_id'>[]) => {
    try {
      if (!banner?.id) throw new Error('Banner ID is required');
      
      setLoading(true);
      const newItems = await CallmeBannerItemService.bulkCreate(banner.id, items);
      setItems(prev => [...prev, ...newItems]);
      return newItems;
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
    items,
    loading,
    error,
    saveBanner,
    createItem,
    updateItem,
    deleteItem,
    bulkCreateItems,
    refreshBanner: fetchBanner
  };
};