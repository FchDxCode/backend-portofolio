import { createClient } from "@/src/utils/supabase/client";
import { PromiseItem } from "@/src/models/ServiceModels";

const supabase = createClient();

export class PromiseItemService {
  private static TABLE_NAME = 'promise_items';
  private static STORAGE_BUCKET = 'promise-icons';
  private static MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  static async getAll(params?: {
    search?: string;
    sort?: 'created_at';
    order?: 'asc' | 'desc';
  }): Promise<PromiseItem[]> {
    try {
      let query = supabase
        .from(this.TABLE_NAME)
        .select('*');

      if (params?.search) {
        query = query.or(`
          title->en.ilike.%${params.search}%,
          title->id.ilike.%${params.search}%,
          subtitle->en.ilike.%${params.search}%,
          subtitle->id.ilike.%${params.search}%
        `);
      }

      if (params?.sort) {
        query = query.order(params.sort, { ascending: params.order === 'asc' });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching promise items:', error);
      throw error;
    }
  }

  static async getById(id: number): Promise<PromiseItem | null> {
    try {
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching promise item:', error);
      throw error;
    }
  }

  static async create(
    promise: Omit<PromiseItem, 'id' | 'created_at' | 'updated_at'>,
    iconFile?: File
  ): Promise<PromiseItem> {
    try {
      const promiseData = { ...promise };

      if (iconFile) {
        promiseData.icon = await this.uploadIcon(iconFile);
      } else if (promise.icon && !this.isValidIconClass(promise.icon)) {
        throw new Error('Invalid icon format');
      }

      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .insert({
          ...promiseData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating promise item:', error);
      throw error;
    }
  }

  static async update(
    id: number,
    promise: Partial<PromiseItem>,
    newIconFile?: File
  ): Promise<PromiseItem> {
    try {
      const updateData: Partial<PromiseItem> = {
        ...promise,
        updated_at: new Date().toISOString()
      };

      if (newIconFile) {
        const oldPromise = await this.getById(id);
        if (oldPromise?.icon && !this.isValidIconClass(oldPromise.icon)) {
          await this.deleteIcon(oldPromise.icon);
        }
        updateData.icon = await this.uploadIcon(newIconFile);
      } else if (promise.icon && !this.isValidIconClass(promise.icon)) {
        throw new Error('Invalid icon format');
      }

      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating promise item:', error);
      throw error;
    }
  }

  static async delete(id: number): Promise<void> {
    try {
      const promise = await this.getById(id);
      if (!promise) return;

      if (promise.icon && !this.isValidIconClass(promise.icon)) {
        await this.deleteIcon(promise.icon);
      }

      const { error } = await supabase
        .from(this.TABLE_NAME)
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting promise item:', error);
      throw error;
    }
  }

  private static isValidIconClass(icon: string): boolean {
    return /^(fa|bi|material-icons|icon-)/.test(icon);
  }

  private static async uploadIcon(file: File): Promise<string> {
    if (file.size > this.MAX_FILE_SIZE) {
      throw new Error('File size exceeds 5MB limit');
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${this.STORAGE_BUCKET}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('public')
      .upload(filePath, file);

    if (uploadError) throw uploadError;
    return filePath;
  }

  private static async deleteIcon(path: string): Promise<void> {
    const { error } = await supabase.storage
      .from('public')
      .remove([path]);

    if (error) throw error;
  }

  static getIconUrl(path: string): string {
    if (this.isValidIconClass(path)) return path;
    
    const { data } = supabase.storage
      .from('public')
      .getPublicUrl(path);
    
    return data.publicUrl;
  }
}