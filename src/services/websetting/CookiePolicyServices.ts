import { createClient } from '@/src/utils/supabase/client';
import { CookiePolicy } from '@/src/models/WebSettingModels';

const supabase = createClient();
const TABLE_NAME = 'cookie_policies';

export class CookiePolicyService {
  /**
   * Mendapatkan data cookie policy
   * @returns {Promise<CookiePolicy | null>} Data cookie policy atau null jika tidak ada
   */
  static async get(): Promise<CookiePolicy | null> {
    try {
      const { data, error } = await supabase
        .from(TABLE_NAME)
        .select('*')
        .single();

      if (error) {
        console.error('Error fetching cookie policy:', error);
        return null;
      }

      return data as CookiePolicy;
    } catch (error) {
      console.error('Unexpected error in cookie policy fetch:', error);
      return null;
    }
  }

  /**
   * Menyimpan atau memperbarui cookie policy
   * @param {Partial<CookiePolicy>} policy - Data cookie policy yang akan disimpan
   * @returns {Promise<CookiePolicy | null>} Data cookie policy yang tersimpan atau null jika gagal
   */
  static async save(policy: Partial<CookiePolicy>): Promise<CookiePolicy | null> {
    try {
      // Cek apakah data sudah ada (untuk menentukan create atau update)
      const existing = await this.get();
      const now = new Date().toISOString();
      
      if (existing) {
        // Update existing record
        const { data, error } = await supabase
          .from(TABLE_NAME)
          .update({
            ...policy,
            updated_at: now
          })
          .eq('id', existing.id)
          .select()
          .single();

        if (error) {
          console.error('Error updating cookie policy:', error);
          return null;
        }

        return data as CookiePolicy;
      } else {
        // Create new record
        const { data, error } = await supabase
          .from(TABLE_NAME)
          .insert({
            ...policy,
            created_at: now,
            updated_at: now
          })
          .select()
          .single();

        if (error) {
          console.error('Error creating cookie policy:', error);
          return null;
        }

        return data as CookiePolicy;
      }
    } catch (error) {
      console.error('Unexpected error in cookie policy save:', error);
      return null;
    }
  }
}

export default CookiePolicyService;