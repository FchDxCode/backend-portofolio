'use server';

import { createClient } from '@/src/utils/supabase/client';
import { PromiseItem } from '@/src/models/ServiceModels';
import { saveFile, deleteFile } from '@/src/utils/server/FileStorage';  

const supabase = createClient();

export class PromiseItemService {
  private static TABLE = 'promise_items';
  private static FOLDER = 'promise-icons';        
  private static MAX_SIZE = 5 * 1024 * 1024;       

  /* ───────────── list ───────────── */
  static async getAll(params?: {
    search?: string;
    sort?: 'created_at';
    order?: 'asc' | 'desc';
  }): Promise<PromiseItem[]> {
    try {
      let q = supabase.from(this.TABLE).select('*');

      if (params?.search)
        q = q.or(
          `title->en.ilike.%${params.search}%,
           title->id.ilike.%${params.search}%,
           subtitle->en.ilike.%${params.search}%,
           subtitle->id.ilike.%${params.search}%`
        );

      q = q.order(params?.sort ?? 'created_at', {
        ascending: params?.order === 'asc',
      });

      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    } catch (err) {
      console.error('Error fetching promise items:', err);
      throw err;
    }
  }

  static async getById(id: number): Promise<PromiseItem | null> {
    const { data, error } = await supabase
      .from(this.TABLE)
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  }

  static async create(
    promise: Omit<PromiseItem, 'id' | 'created_at' | 'updated_at'>,
    iconFile?: File
  ): Promise<PromiseItem> {
    try {
      const payload: any = { ...promise };

      if (iconFile) {
        payload.icon = await this.uploadIcon(iconFile);
      } else if (promise.icon && !this.isValidIconClass(promise.icon)) {
        throw new Error('Invalid icon format');
      }

      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from(this.TABLE)
        .insert({ ...payload, created_at: now, updated_at: now })
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error creating promise item:', err);
      throw err;
    }
  }

  static async update(
    id: number,
    promise: Partial<PromiseItem>,
    newIconFile?: File
  ): Promise<PromiseItem> {
    try {
      const update: any = { ...promise, updated_at: new Date().toISOString() };

      if (newIconFile) {
        const old = await this.getById(id);
        if (old?.icon && !this.isValidIconClass(old.icon))
          await this.deleteIcon(old.icon);
        update.icon = await this.uploadIcon(newIconFile);
      } else if (promise.icon && !this.isValidIconClass(promise.icon)) {
        throw new Error('Invalid icon format');
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
      console.error('Error updating promise item:', err);
      throw err;
    }
  }

  static async delete(id: number) {
    try {
      const item = await this.getById(id);
      if (item?.icon && !this.isValidIconClass(item.icon))
        await this.deleteIcon(item.icon);

      const { error } = await supabase.from(this.TABLE).delete().eq('id', id);
      if (error) throw error;
    } catch (err) {
      console.error('Error deleting promise item:', err);
      throw err;
    }
  }

  private static isValidIconClass(icon: string) {
    return /^(fa|bi|material-icons|icon-)/.test(icon);
  }

  private static async uploadIcon(file: File) {
    if (file.size > this.MAX_SIZE) throw new Error('File size exceeds 5 MB');
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
