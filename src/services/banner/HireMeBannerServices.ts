import { createClient } from "@/src/utils/supabase/client";
import { HireMeBanner } from "@/src/models/BannerModels";

const supabase = createClient();

export class HireMeBannerService {
  private static TABLE_NAME = 'hire_me_banners';

  static async get(): Promise<HireMeBanner | null> {
    try {
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .select('*')
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching hire me banner:', error);
      throw error;
    }
  }

  static async save(banner: Partial<HireMeBanner>): Promise<HireMeBanner> {
    try {
      const existingBanner = await this.get();

      if (existingBanner) {
        const { data, error } = await supabase
          .from(this.TABLE_NAME)
          .update({
            ...banner,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingBanner.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from(this.TABLE_NAME)
          .insert({
            ...banner,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    } catch (error) {
      console.error('Error saving hire me banner:', error);
      throw error;
    }
  }
}