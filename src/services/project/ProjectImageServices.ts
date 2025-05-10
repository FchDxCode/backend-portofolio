import { createClient } from "@/src/utils/supabase/client";
import { ProjectImage } from "@/src/models/ProjectModels";

const supabase = createClient();

export class ProjectImageService {
  private static TABLE_NAME = 'project_images';
  private static STORAGE_BUCKET = 'project-images';
  
  /**
   * Upload project image
   */
  static async upload(file: File): Promise<ProjectImage> {
    try {
      // Upload file to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${this.STORAGE_BUCKET}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('public')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Create database record
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .insert({
          image: filePath,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error uploading project image:', error);
      throw error;
    }
  }

  /**
   * Upload multiple project images
   */
  static async uploadMultiple(files: File[]): Promise<ProjectImage[]> {
    try {
      const uploadPromises = files.map(file => this.upload(file));
      return await Promise.all(uploadPromises);
    } catch (error) {
      console.error('Error uploading multiple project images:', error);
      throw error;
    }
  }

  /**
   * Get project image by ID
   */
  static async getById(id: number): Promise<ProjectImage | null> {
    try {
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching project image:', error);
      throw error;
    }
  }

  /**
   * Delete project image
   */
  static async delete(id: number): Promise<void> {
    try {
      const image = await this.getById(id);
      if (!image) return;

      // Delete from storage
      if (image.image) {
        const { error: storageError } = await supabase.storage
          .from('public')
          .remove([image.image]);

        if (storageError) throw storageError;
      }

      // Delete database record
      const { error } = await supabase
        .from(this.TABLE_NAME)
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting project image:', error);
      throw error;
    }
  }

  /**
   * Get public URL for image
   */
  static getImageUrl(path: string): string {
    const { data } = supabase.storage
      .from('public')
      .getPublicUrl(path);
    
    return data.publicUrl;
  }
}