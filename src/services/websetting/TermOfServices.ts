import { createClient } from '@/src/utils/supabase/client';
import { TermsOfService } from '@/src/models/WebSettingModels';

const supabase = createClient();
const TABLE_NAME = 'terms_of_service';

export class TermsOfServiceService {
  /**
   * Mendapatkan data terms of service
   * @returns {Promise<TermsOfService | null>} Data terms of service atau null jika tidak ada
   */
  static async get(): Promise<TermsOfService | null> {
    try {
      const { data, error } = await supabase
        .from(TABLE_NAME)
        .select('*')
        .single();

      if (error) {
        console.error('Error fetching terms of service:', error);
        return null;
      }

      return data as TermsOfService;
    } catch (error) {
      console.error('Unexpected error in terms of service fetch:', error);
      return null;
    }
  }

  /**
   * Menyimpan atau memperbarui terms of service
   * @param {Partial<TermsOfService>} terms - Data terms of service yang akan disimpan
   * @returns {Promise<TermsOfService | null>} Data terms of service yang tersimpan atau null jika gagal
   */
  static async save(terms: Partial<TermsOfService>): Promise<TermsOfService | null> {
    try {
      // Cek apakah data sudah ada (untuk menentukan create atau update)
      const existing = await this.get();
      const now = new Date().toISOString();
      
      if (existing) {
        // Update existing record
        const { data, error } = await supabase
          .from(TABLE_NAME)
          .update({
            ...terms,
            updated_at: now
          })
          .eq('id', existing.id)
          .select()
          .single();

        if (error) {
          console.error('Error updating terms of service:', error);
          return null;
        }

        return data as TermsOfService;
      } else {
        // Create new record
        const { data, error } = await supabase
          .from(TABLE_NAME)
          .insert({
            ...terms,
            created_at: now,
            updated_at: now
          })
          .select()
          .single();

        if (error) {
          console.error('Error creating terms of service:', error);
          return null;
        }

        return data as TermsOfService;
      }
    } catch (error) {
      console.error('Unexpected error in terms of service save:', error);
      return null;
    }
  }
}

export default TermsOfServiceService;