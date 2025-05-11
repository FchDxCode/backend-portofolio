// services/SocialMediaService.ts
'use server';

import { createClient } from '@/src/utils/supabase/client';
import { SocialMedia } from '@/src/models/WebSettingModels';
import { saveFile, deleteFile } from '@/src/utils/server/FileStorage';  

const supabase = createClient();

export class SocialMediaService {
  private static TABLE  = 'social_media';
  private static FOLDER = 'social-media-icons';      
  private static MAX_SIZE = 5 * 1024 * 1024;        

  static async getAll(params?: {
    search?: string;
    sort?: 'created_at';
    order?: 'asc' | 'desc';
  }): Promise<SocialMedia[]> {
    try {
      let q = supabase.from(this.TABLE).select('*');

      if (params?.search) {
        q = q.or(
          `title->en.ilike.%${params.search}%,
           title->id.ilike.%${params.search}%,
           link.ilike.%${params.search}%`
        );
      }

      q = q.order(params?.sort ?? 'created_at', {
        ascending: params?.order === 'asc',
      });

      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    } catch (err) {
      console.error('Error fetching social media:', err);
      throw err;
    }
  }

  static async getById(id: number): Promise<SocialMedia | null> {
    const { data, error } = await supabase
      .from(this.TABLE)
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  }

  static async create(
    sm: Omit<SocialMedia, 'id' | 'created_at' | 'updated_at'>,
    iconFile?: File
  ): Promise<SocialMedia> {
    try {
      const payload: any = { ...sm };

      if (iconFile) payload.icon = await this.uploadIcon(iconFile);

      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from(this.TABLE)
        .insert({ ...payload, created_at: now, updated_at: now })
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error creating social media:', err);
      throw err;
    }
  }

  static async update(
    id: number,
    sm: Partial<SocialMedia>,
    newIconFile?: File
  ): Promise<SocialMedia> {
    try {
      const update: any = { ...sm, updated_at: new Date().toISOString() };

      if (newIconFile) {
        const old = await this.getById(id);
        if (old?.icon) await this.deleteIcon(old.icon);
        update.icon = await this.uploadIcon(newIconFile);
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
      console.error('Error updating social media:', err);
      throw err;
    }
  }

  static async delete(id: number) {
    try {
      const sm = await this.getById(id);
      if (sm?.icon) await this.deleteIcon(sm.icon);

      const { error } = await supabase.from(this.TABLE).delete().eq('id', id);
      if (error) throw error;
    } catch (err) {
      console.error('Error deleting social media:', err);
      throw err;
    }
  }

  private static async uploadIcon(file: File) {
    if (file.size > this.MAX_SIZE) throw new Error('File size exceeds 5 MB');
    return saveFile(file, { folder: this.FOLDER });
  }

  private static async deleteIcon(path: string) {
    if (!path || path.startsWith('http')) return;   
    await deleteFile(path);
  }

  static getIconUrl(path?: string) {
    if (!path) return '';

    if (path.startsWith('fa') || path.startsWith('bi') || path.startsWith('icon-'))
      return path;

    if (path.startsWith('http')) return path;

    return path.startsWith('/') ? path : `/${path}`;
  }
}
