import { createClient } from "@/src/utils/supabase/client";
import { Brand } from "@/src/models/ServiceModels";

const supabase = createClient();

export class BrandService {
  private static TABLE_NAME = 'brands';
  private static STORAGE_BUCKET = 'brands';
  private static MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  /**
   * Get all brands with optional search and sorting
   */
  static async getAll(params?: {
    search?: string;
    sort?: 'created_at' | 'title';
    order?: 'asc' | 'desc';
  }): Promise<Brand[]> {
    try {
      let query = supabase
        .from(this.TABLE_NAME)
        .select('*');

      if (params?.search) {
        query = query.or(`title->en.ilike.%${params.search}%,title->id.ilike.%${params.search}%`);
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
      console.error('Error fetching brands:', error);
      throw error;
    }
  }

  static async getById(id: number): Promise<Brand | null> {
    try {
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching brand:', error);
      throw error;
    }
  }

  static async create(brand: Omit<Brand, 'id' | 'created_at' | 'updated_at'>, image?: File): Promise<Brand> {
    try {
      // Handle image upload if provided
      let imagePath = '';
      if (image) {
        imagePath = await this.uploadImage(image);
      }

      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .insert({
          ...brand,
          image: imagePath,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating brand:', error);
      throw error;
    }
  }

  static async update(id: number, brand: Partial<Brand>, newImage?: File): Promise<Brand> {
    try {
      const updateData: Partial<Brand> = {
        ...brand,
        updated_at: new Date().toISOString()
      };

      // Handle image update if provided
      if (newImage) {
        // Delete old image if exists
        const oldBrand = await this.getById(id);
        if (oldBrand?.image) {
          await this.deleteImage(oldBrand.image);
        }
        
        // Upload new image
        updateData.image = await this.uploadImage(newImage);
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
      console.error('Error updating brand:', error);
      throw error;
    }
  }

  static async delete(id: number): Promise<void> {
    try {
      const brand = await this.getById(id);
      if (brand?.image) {
        await this.deleteImage(brand.image);
      }

      const { error } = await supabase
        .from(this.TABLE_NAME)
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting brand:', error);
      throw error;
    }
  }

  private static async uploadImage(file: File): Promise<string> {
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

  private static async deleteImage(path: string): Promise<void> {
    const { error } = await supabase.storage
      .from('public')
      .remove([path]);

    if (error) throw error;
  }

  static getImageUrl(path: string): string {
    const { data } = supabase.storage
      .from('public')
      .getPublicUrl(path);
    
    return data.publicUrl;
  }
}