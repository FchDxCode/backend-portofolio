import { createClient } from '@/src/utils/supabase/client';
import { WebSetting } from '@/src/models/WebSettingModels';
import { saveFile, deleteFile } from '@/src/utils/server/FileStorage';

const supabase = createClient();
const TABLE_NAME = 'web_settings';

export class WebSettingService {
  /**
   * Mendapatkan data pengaturan website
   * @returns {Promise<WebSetting | null>} Data pengaturan website atau null jika tidak ada
   */
  static async get(): Promise<WebSetting | null> {
    try {
      const { data, error } = await supabase
        .from(TABLE_NAME)
        .select('*')
        .single();

      if (error) {
        console.error('Error fetching web setting:', error);
        return null;
      }

      return data as WebSetting;
    } catch (error) {
      console.error('Unexpected error in web setting fetch:', error);
      return null;
    }
  }

  /**
   * Menyimpan atau memperbarui pengaturan website
   * @param {Partial<WebSetting>} setting - Data pengaturan website yang akan disimpan
   * @param {Record<string, File>} files - File-file yang akan diunggah (logo, favicon, dll)
   * @returns {Promise<WebSetting | null>} Data pengaturan website yang tersimpan atau null jika gagal
   */
  static async save(
    setting: Partial<WebSetting>,
    files?: {
      logo?: File;
      favicon?: File;
      cv_id?: File;
      cv_en?: File;
      portfolio?: File;
    }
  ): Promise<WebSetting | null> {
    try {
      // Cek apakah data sudah ada (untuk menentukan create atau update)
      const existing = await this.get();
      const now = new Date().toISOString();
      const updates: Partial<WebSetting> = { ...setting };

      // Proses file uploads jika ada
      if (files) {
        // Proses logo jika ada
        if (files.logo) {
          const logoPath = await saveFile(files.logo, {
            folder: 'websetting',
            deletePrev: existing?.logo || null,
          });
          updates.logo = logoPath;
        }

        // Proses favicon jika ada
        if (files.favicon) {
          const faviconPath = await saveFile(files.favicon, {
            folder: 'websetting',
            deletePrev: existing?.favicon || null,
          });
          updates.favicon = faviconPath;
        }

        // Proses CV Indonesia jika ada
        if (files.cv_id) {
          const cvIdPath = await saveFile(files.cv_id, {
            folder: 'websetting/cv',
            deletePrev: existing?.cv_id || null,
          });
          updates.cv_id = cvIdPath;
        }

        // Proses CV English jika ada
        if (files.cv_en) {
          const cvEnPath = await saveFile(files.cv_en, {
            folder: 'websetting/cv',
            deletePrev: existing?.cv_en || null,
          });
          updates.cv_en = cvEnPath;
        }

        // Proses portfolio jika ada
        if (files.portfolio) {
          const portfolioPath = await saveFile(files.portfolio, {
            folder: 'websetting/portfolio',
            deletePrev: existing?.portfolio || null,
          });
          updates.portfolio = portfolioPath;
        }
      }

      if (existing) {
        // Update existing record
        const { data, error } = await supabase
          .from(TABLE_NAME)
          .update({
            ...updates,
            updated_at: now,
          })
          .eq('id', existing.id)
          .select()
          .single();

        if (error) {
          console.error('Error updating web setting:', error);
          return null;
        }

        return data as WebSetting;
      } else {
        // Create new record
        const { data, error } = await supabase
          .from(TABLE_NAME)
          .insert({
            ...updates,
            created_at: now,
            updated_at: now,
          })
          .select()
          .single();

        if (error) {
          console.error('Error creating web setting:', error);
          return null;
        }

        return data as WebSetting;
      }
    } catch (error) {
      console.error('Unexpected error in web setting save:', error);
      return null;
    }
  }

  /**
   * Menghapus file tertentu dari pengaturan website
   * @param {keyof Pick<WebSetting, 'logo' | 'favicon' | 'cv_id' | 'cv_en' | 'portfolio'>} field - Nama field file yang akan dihapus
   * @returns {Promise<WebSetting | null>} Data pengaturan website yang diperbarui atau null jika gagal
   */
  static async deleteFile(
    field: keyof Pick<WebSetting, 'logo' | 'favicon' | 'cv_id' | 'cv_en' | 'portfolio'>
  ): Promise<WebSetting | null> {
    try {
      const existing = await this.get();
      if (!existing || !existing[field]) {
        return existing;
      }

      // Hapus file dari penyimpanan
      await deleteFile(existing[field] as string);

      // Update database untuk menghapus referensi file
      const now = new Date().toISOString();
      const updates: Partial<Record<keyof WebSetting, null>> = {
        [field]: null,
      };

      const { data, error } = await supabase
        .from(TABLE_NAME)
        .update({
          ...updates,
          updated_at: now,
        })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) {
        console.error(`Error removing ${field} from web setting:`, error);
        return null;
      }

      return data as WebSetting;
    } catch (error) {
      console.error(`Unexpected error deleting ${field}:`, error);
      return null;
    }
  }
}

export default WebSettingService;