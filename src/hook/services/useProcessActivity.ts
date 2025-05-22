import { useState, useEffect, useCallback } from 'react';
import { ProcessActivity } from '@/src/models/ServiceModels';
import { ProcessActivityService } from '@/src/services/services/ProcessActivityServices';

// Interface untuk hasil hook
interface UseProcessActivityResult {
  activities: ProcessActivity[];
  loading: boolean;
  error: Error | null;
  currentActivity: ProcessActivity | null;
  
  // Fungsi CRUD
  fetchActivities: (params?: { search?: string; processId?: number; }) => Promise<void>;
  fetchActivityById: (id: number) => Promise<ProcessActivity | null>;
  createActivity: (activity: Omit<ProcessActivity, 'id' | 'created_at' | 'updated_at'>) => Promise<ProcessActivity>;
  updateActivity: (id: number, activity: Partial<ProcessActivity>) => Promise<ProcessActivity>;
  deleteActivity: (id: number) => Promise<void>;
  
  // Fungsi relasi
  getRelatedProcessIds: (activityId: number) => Promise<number[]>;
}

export function useProcessActivity(): UseProcessActivityResult {
  // State untuk menyimpan data
  const [activities, setActivities] = useState<ProcessActivity[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [currentActivity, setCurrentActivity] = useState<ProcessActivity | null>(null);

  // Fungsi untuk mengambil daftar activities
  const fetchActivities = useCallback(async (params?: { search?: string; processId?: number; }) => {
    setLoading(true);
    setError(null);
    try {
      const data = await ProcessActivityService.getAll(params);
      setActivities(data);
    } catch (err) {
      console.error('Error fetching activities:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch activities'));
    } finally {
      setLoading(false);
    }
  }, []);

  // Fungsi untuk mengambil activity berdasarkan ID
  const fetchActivityById = useCallback(async (id: number): Promise<ProcessActivity | null> => {
    setLoading(true);
    setError(null);
    try {
      const data = await ProcessActivityService.getById(id);
      setCurrentActivity(data);
      return data;
    } catch (err) {
      console.error(`Error fetching activity with ID ${id}:`, err);
      setError(err instanceof Error ? err : new Error(`Failed to fetch activity with ID ${id}`));
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fungsi untuk membuat activity baru
  const createActivity = useCallback(async (
    activity: Omit<ProcessActivity, 'id' | 'created_at' | 'updated_at'>
  ): Promise<ProcessActivity> => {
    setLoading(true);
    setError(null);
    try {
      const newActivity = await ProcessActivityService.create(activity);
      
      // Update daftar activities
      setActivities(prevActivities => [...prevActivities, newActivity]);
      
      return newActivity;
    } catch (err) {
      console.error('Error creating activity:', err);
      const error = err instanceof Error ? err : new Error('Failed to create activity');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fungsi untuk memperbarui activity
  const updateActivity = useCallback(async (
    id: number,
    activity: Partial<ProcessActivity>
  ): Promise<ProcessActivity> => {
    setLoading(true);
    setError(null);
    try {
      const updatedActivity = await ProcessActivityService.update(id, activity);
      
      // Update daftar activities
      setActivities(prevActivities =>
        prevActivities.map(a => a.id === id ? updatedActivity : a)
      );
      
      // Update current activity jika yang diupdate adalah current activity
      if (currentActivity?.id === id) {
        setCurrentActivity(updatedActivity);
      }
      
      return updatedActivity;
    } catch (err) {
      console.error(`Error updating activity with ID ${id}:`, err);
      const error = err instanceof Error ? err : new Error(`Failed to update activity with ID ${id}`);
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [currentActivity]);

  // Fungsi untuk menghapus activity
  const deleteActivity = useCallback(async (id: number): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await ProcessActivityService.delete(id);
      
      // Hapus dari daftar activities
      setActivities(prevActivities => prevActivities.filter(a => a.id !== id));
      
      // Reset current activity jika yang dihapus adalah current activity
      if (currentActivity?.id === id) {
        setCurrentActivity(null);
      }
    } catch (err) {
      console.error(`Error deleting activity with ID ${id}:`, err);
      setError(err instanceof Error ? err : new Error(`Failed to delete activity with ID ${id}`));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentActivity]);

  // Fungsi untuk mendapatkan process IDs yang terkait dengan activity
  const getRelatedProcessIds = useCallback(async (activityId: number): Promise<number[]> => {
    try {
      return await ProcessActivityService.getRelatedProcessIds(activityId);
    } catch (err) {
      console.error(`Error fetching related process IDs for activity ${activityId}:`, err);
      throw err;
    }
  }, []);

  // Lakukan fetch activities pada saat komponen dipasang
  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  return {
    activities,
    loading,
    error,
    currentActivity,
    fetchActivities,
    fetchActivityById,
    createActivity,
    updateActivity,
    deleteActivity,
    getRelatedProcessIds
  };
}