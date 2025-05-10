import { createClient } from "@/src/utils/supabase/client";
import { ServiceHero } from "@/src/models/ServiceModels";

const supabase = createClient();

export class ServiceHeroService {
  private static TABLE_NAME = 'service_heroes';
  private static STORAGE_BUCKET = 'service-icons';
  private static MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  static async getAll(params?: {
    search?: string;
    sort?: 'created_at';
    order?: 'asc' | 'desc';
  }): Promise<ServiceHero[]> {
    try {
      let query = supabase
        .from(this.TABLE_NAME)
        .select('*');

      if (params?.search) {
        query = query.or(
          `title->en.ilike.%${params.search}%,title->id.ilike.%${params.search}%,` +
          `description->en.ilike.%${params.search}%,description->id.ilike.%${params.search}%`
        );
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
      console.error('Error fetching service heroes:', error);
      throw error;
    }
  }

  static async getById(id: number): Promise<ServiceHero | null> {
    try {
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching service hero:', error);
      throw error;
    }
  }

  static async create(
    hero: Omit<ServiceHero, 'id' | 'created_at' | 'updated_at'>, 
    iconFile?: File
  ): Promise<ServiceHero> {
    try {
      const heroData = { ...hero };

      if (iconFile) {
        heroData.icon = await this.uploadIcon(iconFile);
      } else if (hero.icon && !this.isValidIconClass(hero.icon)) {
        throw new Error('Invalid icon format. Must be a file or valid icon class.');
      }

      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .insert({
          ...heroData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating service hero:', error);
      throw error;
    }
  }

  static async update(
    id: number, 
    hero: Partial<ServiceHero>, 
    newIconFile?: File
  ): Promise<ServiceHero> {
    try {
      const updateData: Partial<ServiceHero> = {
        ...hero,
        updated_at: new Date().toISOString()
      };

      if (newIconFile) {
        // Delete old icon if it's a file
        const oldHero = await this.getById(id);
        if (oldHero?.icon && !this.isValidIconClass(oldHero.icon)) {
          await this.deleteIcon(oldHero.icon);
        }
        updateData.icon = await this.uploadIcon(newIconFile);
      } else if (hero.icon && !this.isValidIconClass(hero.icon)) {
        throw new Error('Invalid icon format. Must be a file or valid icon class.');
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
      console.error('Error updating service hero:', error);
      throw error;
    }
  }

  static async delete(id: number): Promise<void> {
    try {
      const hero = await this.getById(id);
      if (hero?.icon && !this.isValidIconClass(hero.icon)) {
        await this.deleteIcon(hero.icon);
      }

      const { error } = await supabase
        .from(this.TABLE_NAME)
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting service hero:', error);
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