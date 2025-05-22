import { createClient } from '@/src/utils/supabase/client';
import { Brand } from '@/src/models/ServiceModels';
import {
  saveFile,
  deleteFile,
} from '@/src/utils/server/FileStorage';          

const supabase = createClient();

export class BrandService {
  private static TABLE = 'brands';
  private static FOLDER = 'brands';                 
  private static MAX_SIZE = 5 * 1024 * 1024;        

  static async getAll(params?: {
    search?: string;
    sort?: 'created_at' | 'title';
    order?: 'asc' | 'desc';
  }): Promise<Brand[]> {
    try {
      let q = supabase.from(this.TABLE).select('*');

      if (params?.search)
        q = q.or(
          `title->en.ilike.%${params.search}%,title->id.ilike.%${params.search}%`
        );

      q = q.order(params?.sort ?? 'created_at', {
        ascending: params?.order === 'asc',
      });

      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    } catch (err) {
      console.error('Error fetching brands:', err);
      throw err;
    }
  }

  static async getById(id: number): Promise<Brand | null> {
    const { data, error } = await supabase
      .from(this.TABLE)
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  }


  static async create(
    brand: Omit<Brand, 'id' | 'created_at' | 'updated_at'>,
    image?: File
  ): Promise<Brand> {
    try {
      const now = new Date().toISOString();
      const imgPath = image ? await this.uploadImage(image) : '';

      const { data, error } = await supabase
        .from(this.TABLE)
        .insert({ ...brand, image: imgPath, created_at: now, updated_at: now })
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error creating brand:', err);
      throw err;
    }
  }

  static async update(
    id: number,
    brand: Partial<Brand>,
    newImage?: File
  ): Promise<Brand> {
    try {
      const updates: Partial<Brand> = { ...brand, updated_at: new Date().toISOString() };

      if (newImage) {
        const old = await this.getById(id);
        if (old?.image) await this.deleteImage(old.image);
        updates.image = await this.uploadImage(newImage);
      }

      const { data, error } = await supabase
        .from(this.TABLE)
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error updating brand:', err);
      throw err;
    }
  }

  static async delete(id: number) {
    try {
      const brand = await this.getById(id);
      if (brand?.image) await this.deleteImage(brand.image);

      const { error } = await supabase.from(this.TABLE).delete().eq('id', id);
      if (error) throw error;
    } catch (err) {
      console.error('Error deleting brand:', err);
      throw err;
    }
  }

  private static async uploadImage(file: File) {
    if (file.size > this.MAX_SIZE) throw new Error('File exceeds 5 MB limit');

    return saveFile(file, { folder: this.FOLDER });
  }

  private static async deleteImage(path: string) {
    await deleteFile(path);
  }

  static getImageUrl(path: string) {
    if (!path) return '';
    return /^https?:\/\//i.test(path) ? path : path.startsWith('/') ? path : `/${path}`;
  }
}
