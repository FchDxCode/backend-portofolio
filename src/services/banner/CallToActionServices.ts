import { createClient } from "@/src/utils/supabase/client";
import { CallToAction } from "@/src/models/BannerModels";

const supabase = createClient();

export class CallToActionService {
  private static TABLE_NAME = 'call_to_actions';

  /**
   * Get the singleton call to action data
   */
  static async get(): Promise<CallToAction | null> {
    try {
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .select('*')
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching call to action:', error);
      throw error;
    }
  }

  /**
   * Create or update the singleton call to action
   */
  static async save(cta: Partial<CallToAction>): Promise<CallToAction> {
    try {
      const existingCta = await this.get();

      if (existingCta) {
        const { data, error } = await supabase
          .from(this.TABLE_NAME)
          .update({
            ...cta,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingCta.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from(this.TABLE_NAME)
          .insert({
            ...cta,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    } catch (error) {
      console.error('Error saving call to action:', error);
      throw error;
    }
  }
}