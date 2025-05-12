import { createClient } from '@/src/utils/supabase/client';
import { HomeHero } from '@/src/models/SingletonModels';
import { saveImage, deleteImage } from '@/src/utils/server/FileStorage';

const supabase = createClient();

export class HomeHeroService {
  private static TABLE = 'home_heros';

  static async get(): Promise<HomeHero | null> {
    const { data, error } = await supabase.from(this.TABLE).select('*').single();
    if (error) throw error;
    return data;
  }

  static async save(payload: Partial<HomeHero>): Promise<HomeHero> {
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

  static async updateImage(id: number, file: File): Promise<HomeHero> {
    try {
      const current = await this.get();

      const imagePath = await saveImage(file, {
        folder: 'home-hero',
        deletePrev: current?.image ?? null, 
      });

      return this.save({ id, image: imagePath });
    } catch (err) {
      console.error('Error updating hero image:', err);
      throw err;
    }
  }

  static async clearImage(): Promise<HomeHero> {
    const hero = await this.get();
    if (!hero?.image) return hero!;

    await deleteImage(hero.image);
    return this.save({ id: hero.id, image: undefined });
  }
}
