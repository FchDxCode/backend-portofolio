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

  static async updateImages(
    id: number,
    files: { image?: File; title_image?: File; subtitle_image?: File }
  ): Promise<About> {
    const current = await this.get();
    if (!current) throw new Error('About record not found');

    const updates: Partial<About> = {};

    if (files.image)
      updates.image = await saveImage(files.image, {
        folder: 'about',
        deletePrev: current.image,
      });

    if (files.title_image)
      updates.title_image = await saveImage(files.title_image, {
        folder: 'about',
        deletePrev: current.title_image,
      });

    if (files.subtitle_image)
      updates.subtitle_image = await saveImage(files.subtitle_image, {
        folder: 'about',
        deletePrev: current.subtitle_image,
      });

    return this.save({ id, ...updates });
  }

  static async clearImages(): Promise<About> {
    const about = await this.get();
    if (!about) throw new Error('About record not found');

    await Promise.all([
      deleteImage(about.image ?? ''),
      deleteImage(about.title_image ?? ''),
      deleteImage(about.subtitle_image ?? ''),
    ]);

    return this.save({
      id: about.id,
      image: undefined,
      title_image: undefined,
      subtitle_image: undefined,
    });
  }
}
