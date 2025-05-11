import { createClient } from '@/src/utils/supabase/client';
import { About } from '@/src/models/SingletonModels';
import {
  saveImage,
  deleteImage,
} from '@/src/utils/server/FileStorage'; 

const supabase = createClient();

export class AboutService {
  private static TABLE = 'abouts';

  static async get(): Promise<About | null> {
    const { data, error } = await supabase
      .from(this.TABLE)
      .select('*')
      .single();
    if (error) throw error;
    return data;
  }

  static async save(payload: Partial<About>): Promise<About> {
    const existing = await this.get();

    const base = { updated_at: new Date().toISOString() };
    if (existing) {
      const { data, error } = await supabase
        .from(this.TABLE)
        .update({ ...payload, ...base })
        .eq('id', existing.id)
        .select()
        .single();
      if (error) throw error;
      return data;
    }

    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from(this.TABLE)
      .insert({ ...payload, created_at: now, updated_at: now })
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  static async updateImage(
    id: number,
    image?: File
  ): Promise<About> {
    const current = await this.get();
    if (!current) throw new Error('About record not found');

    const updates: Partial<About> = {};

    if (image)
      updates.image = await saveImage(image, {
        folder: 'about',
        deletePrev: current.image,
      });

    return this.save({ id, ...updates });
  }

  static async updateTitleData(
    id: number, 
    titleData: Record<string, any>
  ): Promise<About> {
    return this.save({ 
      id, 
      title_image: titleData 
    });
  }

  static async updateSubtitleData(
    id: number, 
    subtitleData: Record<string, any>
  ): Promise<About> {
    return this.save({ 
      id, 
      subtitle_image: subtitleData 
    });
  }

  static async clearImage(): Promise<About> {
    const about = await this.get();
    if (!about) throw new Error('About record not found');

    await deleteImage(about.image ?? '');

    return this.save({
      id: about.id,
      image: undefined,
    });
  }
}
