'use server';

import { createClient } from '@/src/utils/supabase/client';
import { ServiceHero } from '@/src/models/ServiceModels';
import { saveFile, deleteFile } from '@/src/utils/server/FileStorage';   

const supabase = createClient();

export class ServiceHeroService {
  private static TABLE = 'service_heroes';
  private static FOLDER = 'service-icons';         
  private static MAX_SIZE = 5 * 1024 * 1024;       

  static async getAll(params?: {
    search?: string;
    sort?: 'created_at';
    order?: 'asc' | 'desc';
  }): Promise<ServiceHero[]> {
    try {
      let q = supabase.from(this.TABLE).select('*');

      if (params?.search)
        q = q.or(
          `title->en.ilike.%${params.search}%,title->id.ilike.%${params.search}%,` +
            `description->en.ilike.%${params.search}%,description->id.ilike.%${params.search}%`
        );

      q = q.order(params?.sort ?? 'created_at', {
        ascending: params?.order === 'asc',
      });

      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    } catch (err) {
      console.error('Error fetching service heroes:', err);
      throw err;
    }
  }

  static async getById(id: number): Promise<ServiceHero | null> {
    const { data, error } = await supabase
      .from(this.TABLE)
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  }

  static async create(
    hero: Omit<ServiceHero, 'id' | 'created_at' | 'updated_at'>,
    iconFile?: File
  ): Promise<ServiceHero> {
    try {
      const now = new Date().toISOString();
      const icon =
        iconFile
          ? await this.uploadIcon(iconFile)
          : hero.icon && !this.isValidIconClass(hero.icon)
          ? (() => {
              throw new Error(
                'Invalid icon format. Must be a file or valid icon class.'
              );
            })()
          : hero.icon ?? '';

      const { data, error } = await supabase
        .from(this.TABLE)
        .insert({ ...hero, icon, created_at: now, updated_at: now })
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error creating service hero:', err);
      throw err;
    }
  }

  static async update(
    id: number,
    hero: Partial<ServiceHero>,
    newIconFile?: File
  ): Promise<ServiceHero> {
    try {
      const update: Partial<ServiceHero> = {
        ...hero,
        updated_at: new Date().toISOString(),
      };

      if (newIconFile) {
        const old = await this.getById(id);
        if (old?.icon && !this.isValidIconClass(old.icon))
          await this.deleteIcon(old.icon);
        update.icon = await this.uploadIcon(newIconFile);
      } else if (hero.icon && !this.isValidIconClass(hero.icon)) {
        throw new Error('Invalid icon format. Must be a file or valid icon class.');
      }

      const { data, error } = await supabase
        .from(this.TABLE)
        .update(update)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error updating service hero:', err);
      throw err;
    }
  }

  static async delete(id: number) {
    try {
      const hero = await this.getById(id);
      if (hero?.icon && !this.isValidIconClass(hero.icon))
        await this.deleteIcon(hero.icon);

      const { error } = await supabase.from(this.TABLE).delete().eq('id', id);
      if (error) throw error;
    } catch (err) {
      console.error('Error deleting service hero:', err);
      throw err;
    }
  }

  private static isValidIconClass(icon: string) {
    return /^(fa|bi|material-icons|icon-)/.test(icon);
  }

  private static async uploadIcon(file: File) {
    if (file.size > this.MAX_SIZE) throw new Error('File size exceeds 5 MB limit');
    return saveFile(file, { folder: this.FOLDER });
  }

  private static async deleteIcon(path: string) {
    await deleteFile(path);
  }

  static getIconUrl(path: string) {
    if (this.isValidIconClass(path)) return path;
    return /^https?:\/\//i.test(path) ? path : path.startsWith('/') ? path : `/${path}`;
  }
}
