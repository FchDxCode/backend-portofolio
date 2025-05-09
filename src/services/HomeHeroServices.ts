import { createClient } from "../utils/supabase/client";
import { HomeHero } from "../models/SingletonModels";

const supabase = createClient();

export class HomeHeroService {
  private static TABLE_NAME = 'home_heros';

  /**
   * Get the singleton home hero data
   * @returns Promise<HomeHero | null>
   */
  static async get(): Promise<HomeHero | null> {
    try {
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .select('*')
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching home hero data:', error);
      throw error;
    }
  }

  /**
   * Create or update the singleton home hero data
   * @param homeHero - The home hero data to save
   * @returns Promise<HomeHero>
   */
  static async save(homeHero: Partial<HomeHero>): Promise<HomeHero> {
    try {
      const existingHero = await this.get();

      if (existingHero) {
        // Update
        const { data, error } = await supabase
          .from(this.TABLE_NAME)
          .update({
            ...homeHero,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingHero.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Create
        const { data, error } = await supabase
          .from(this.TABLE_NAME)
          .insert({
            ...homeHero,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    } catch (error) {
      console.error('Error saving home hero data:', error);
      throw error;
    }
  }

  /**
   * Update the hero image
   * @param id - The hero record id
   * @param file - The image file to upload
   * @returns Promise<HomeHero>
   */
  static async updateImage(
    id: number,
    file: File
  ): Promise<HomeHero> {
    try {
      // Upload new image
      const imagePath = `home-hero/${id}/hero-${Date.now()}`;
      const { error: uploadError } = await supabase.storage
        .from('public')
        .upload(imagePath, file);

      if (uploadError) throw uploadError;

      // Delete old image if exists
      const currentHero = await this.get();
      if (currentHero?.image) {
        await supabase.storage
          .from('public')
          .remove([currentHero.image]);
      }

      // Update record with new image path
      return await this.save({
        id,
        image: imagePath
      });
    } catch (error) {
      console.error('Error updating hero image:', error);
      throw error;
    }
  }
}