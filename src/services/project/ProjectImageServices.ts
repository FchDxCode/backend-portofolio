'use server';

import { createClient } from '@/src/utils/supabase/client';
import { ProjectImage } from '@/src/models/ProjectModels';
import { saveFile, deleteFile } from '@/src/utils/server/FileStorage';

const supabase = createClient();

export class ProjectImageService {
  private static TABLE = 'project_images';
  private static FOLDER = 'project-images'; 

  static async upload(file: File): Promise<ProjectImage> {
    try {
      const path = await saveFile(file, { folder: this.FOLDER });

      const { data, error } = await supabase
        .from(this.TABLE)
        .insert({
          image: path,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error uploading project image:', err);
      throw err;
    }
  }

  static async uploadMultiple(files: File[]): Promise<ProjectImage[]> {
    return Promise.all(files.map((f) => this.upload(f)));
  }

  static async getById(id: number): Promise<ProjectImage | null> {
    const { data, error } = await supabase
      .from(this.TABLE)
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  }

  static async delete(id: number): Promise<void> {
    try {
      const image = await this.getById(id);
      if (!image) return;

      if (image.image) await deleteFile(image.image);

      const { error } = await supabase.from(this.TABLE).delete().eq('id', id);
      if (error) throw error;
    } catch (err) {
      console.error('Error deleting project image:', err);
      throw err;
    }
  }

  static getImageUrl(path: string) {
    if (!path) return '';
    if (/^https?:\/\//i.test(path)) return path;
    return path.startsWith('/') ? path : `/${path}`;
  }
}
