import { createClient } from "@/src/utils/supabase/client";
import { About } from "@/src/models/SingletonModels";

const supabase = createClient();

export class AboutService {
  private static TABLE_NAME = 'abouts';

  /**
   * Get the singleton about data
   * @returns Promise<About | null>
   */
  static async get(): Promise<About | null> {
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
      console.error('Error fetching about data:', error);
      throw error;
    }
  }

  /**
   * Create or update the singleton about data
   * @param about - The about data to save
   * @returns Promise<About>
   */
  static async save(about: Partial<About>): Promise<About> {
    try {
      const existingAbout = await this.get();

      if (existingAbout) {
        // Update
        const { data, error } = await supabase
          .from(this.TABLE_NAME)
          .update({
            ...about,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingAbout.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Create
        const { data, error } = await supabase
          .from(this.TABLE_NAME)
          .insert({
            ...about,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    } catch (error) {
      console.error('Error saving about data:', error);
      throw error;
    }
  }

  /**
   * Update the about images
   * @param id - The about record id
   * @param files - Object containing the image files to update
   * @returns Promise<About>
   */
  static async updateImages(
    id: number,
    files: {
      image?: File;
      title_image?: File;
      subtitle_image?: File;
    }
  ): Promise<About> {
    try {
      const updates: Partial<About> = {};

      // Handle main image
      if (files.image) {
        const imagePath = `about/${id}/main-${Date.now()}`;
        const { error: uploadError } = await supabase.storage
          .from('public')
          .upload(imagePath, files.image);

        if (uploadError) throw uploadError;
        updates.image = imagePath;
      }

      // Handle title image
      if (files.title_image) {
        const titleImagePath = `about/${id}/title-${Date.now()}`;
        const { error: uploadError } = await supabase.storage
          .from('public')
          .upload(titleImagePath, files.title_image);

        if (uploadError) throw uploadError;
        updates.title_image = titleImagePath;
      }

      // Handle subtitle image
      if (files.subtitle_image) {
        const subtitleImagePath = `about/${id}/subtitle-${Date.now()}`;
        const { error: uploadError } = await supabase.storage
          .from('public')
          .upload(subtitleImagePath, files.subtitle_image);

        if (uploadError) throw uploadError;
        updates.subtitle_image = subtitleImagePath;
      }

      // Update the record with new image paths
      return await this.save({ ...updates, id });
    } catch (error) {
      console.error('Error updating about images:', error);
      throw error;
    }
  }

  /**
   * Delete the about images from storage
   * @param about - The about record containing image paths
   */
  static async deleteImages(about: About): Promise<void> {
    try {
      const imagesToDelete = [
        about.image,
        about.title_image,
        about.subtitle_image,
      ].filter(Boolean) as string[];

      if (imagesToDelete.length > 0) {
        const { error } = await supabase.storage
          .from('public')
          .remove(imagesToDelete);

        if (error) throw error;
      }
    } catch (error) {
      console.error('Error deleting about images:', error);
      throw error;
    }
  }
}