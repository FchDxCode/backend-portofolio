import { createClient } from '@/src/utils/supabase/client';
import { PrivacyPolicy } from '@/src/models/WebSettingModels';

const supabase = createClient();
const TABLE_NAME = 'privacy_policies';

export class PrivacyPolicyService {
  /**
   * Mendapatkan data privacy policy
   * @returns {Promise<PrivacyPolicy | null>} Data privacy policy atau null jika tidak ada
   */
  static async get(): Promise<PrivacyPolicy | null> {
    try {
      const { data, error } = await supabase
        .from(TABLE_NAME)
        .select('*')
        .single();

      if (error) {
        console.error('Error fetching privacy policy:', error);
        return null;
      }

      return data as PrivacyPolicy;
    } catch (error) {
      console.error('Unexpected error in privacy policy fetch:', error);
      return null;
    }
  }

  /**
   * Menyimpan atau memperbarui privacy policy
   * @param {Partial<PrivacyPolicy>} policy - Data privacy policy yang akan disimpan
   * @returns {Promise<PrivacyPolicy | null>} Data privacy policy yang tersimpan atau null jika gagal
   */
  static async save(policy: Partial<PrivacyPolicy>): Promise<PrivacyPolicy | null> {
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
          console.error('Error updating privacy policy:', error);
          return null;
        }

        return data as PrivacyPolicy;
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
          console.error('Error creating privacy policy:', error);
          return null;
        }

        return data as PrivacyPolicy;
      }
    } catch (error) {
      console.error('Unexpected error in privacy policy save:', error);
      return null;
    }
  }
}

export default PrivacyPolicyService;