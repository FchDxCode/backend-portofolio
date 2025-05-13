import { useState, useEffect, useCallback } from 'react';
import { WebSettingService } from '@/src/services/websetting/WebSettingServices';
import { WebSetting } from '@/src/models/WebSettingModels';

interface UseWebSettingResult {
  webSetting: WebSetting | null;
  loading: boolean;
  error: string | null;
  saveWebSetting: (
    setting: Partial<WebSetting>,
    files?: {
      logo?: File;
      favicon?: File;
      cv_id?: File;
      cv_en?: File;
      portfolio?: File;
    }
  ) => Promise<boolean>;
  deleteFile: (
    field: keyof Pick<WebSetting, 'logo' | 'favicon' | 'cv_id' | 'cv_en' | 'portfolio'>
  ) => Promise<boolean>;
  refresh: () => Promise<void>;
}

/**
 * Hook untuk mengelola pengaturan website
 * @returns {UseWebSettingResult} Object dengan state dan fungsi untuk mengelola pengaturan website
 */
export const useWebSetting = (): UseWebSettingResult => {
  const [webSetting, setWebSetting] = useState<WebSetting | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Mengambil data pengaturan website dari server
   */
  const fetchWebSetting = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await WebSettingService.get();
      setWebSetting(data);
    } catch (err) {
      setError('Gagal memuat pengaturan website');
      console.error('Error in useWebSetting hook:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Mengambil data saat komponen dimount
  useEffect(() => {
    fetchWebSetting();
  }, [fetchWebSetting]);

  /**
   * Menyimpan atau memperbarui pengaturan website
   * @param {Partial<WebSetting>} setting - Data pengaturan website yang akan disimpan
   * @param {Record<string, File>} files - File-file yang akan diunggah
   * @returns {Promise<boolean>} Status keberhasilan operasi
   */
  const saveWebSetting = async (
    setting: Partial<WebSetting>,
    files?: {
      logo?: File;
      favicon?: File;
      cv_id?: File;
      cv_en?: File;
      portfolio?: File;
    }
  ): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      const result = await WebSettingService.save(setting, files);
      if (result) {
        setWebSetting(result);
        return true;
      }
      setError('Gagal menyimpan pengaturan website');
      return false;
    } catch (err) {
      setError('Terjadi kesalahan saat menyimpan pengaturan website');
      console.error('Error saving web setting:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Menghapus file tertentu dari pengaturan website
   * @param {keyof Pick<WebSetting, 'logo' | 'favicon' | 'cv_id' | 'cv_en' | 'portfolio'>} field - Nama field file yang akan dihapus
   * @returns {Promise<boolean>} Status keberhasilan operasi
   */
  const deleteFile = async (
    field: keyof Pick<WebSetting, 'logo' | 'favicon' | 'cv_id' | 'cv_en' | 'portfolio'>
  ): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      const result = await WebSettingService.deleteFile(field);
      if (result) {
        setWebSetting(result);
        return true;
      }
      setError(`Gagal menghapus ${field} dari pengaturan website`);
      return false;
    } catch (err) {
      setError(`Terjadi kesalahan saat menghapus ${field}`);
      console.error(`Error deleting ${field}:`, err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    webSetting,
    loading,
    error,
    saveWebSetting,
    deleteFile,
    refresh: fetchWebSetting
  };
};

export default useWebSetting;