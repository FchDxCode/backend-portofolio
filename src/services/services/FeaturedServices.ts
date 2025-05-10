import { createClient } from "@/src/utils/supabase/client";
import { FeaturedService } from "@/src/models/ServiceModels";

const supabase = createClient();

export class FeaturedServiceService {
  private static TABLE_NAME = 'featured_services';
  private static STORAGE_BUCKET = 'featured-icons';
  private static MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  static async getAll(params?: {
    benefitId?: number;
    skillId?: number;
    search?: string;
    sort?: 'created_at';
    order?: 'asc' | 'desc';
  }): Promise<FeaturedService[]> {
    try {
      let query = supabase
        .from(this.TABLE_NAME)
        .select('*');

      if (params?.benefitId) {
        query = query.eq('benefit_id', params.benefitId);
      }

      if (params?.skillId) {
        query = query.eq('skill_id', params.skillId);
      }

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
      console.error('Error fetching featured services:', error);
      throw error;
    }
  }

  static async getById(id: number): Promise<FeaturedService | null> {
    try {
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .select(`
          *,
          service_benefits (id, title),
          skills (id, title)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching featured service:', error);
      throw error;
    }
  }

  static async create(
    service: Omit<FeaturedService, 'id' | 'created_at' | 'updated_at'>,
    iconFile?: File
  ): Promise<FeaturedService> {
    try {
      // Validate relations
      await this.validateRelations(service);

      const serviceData = { ...service };

      if (iconFile) {
        serviceData.icon = await this.uploadIcon(iconFile);
      } else if (service.icon && !this.isValidIconClass(service.icon)) {
        throw new Error('Invalid icon format. Must be a file or valid icon class.');
      }

      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .insert({
          ...serviceData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating featured service:', error);
      throw error;
    }
  }

  static async update(
    id: number,
    service: Partial<FeaturedService>,
    newIconFile?: File
  ): Promise<FeaturedService> {
    try {
      // Validate relations if provided
      if (service.benefit_id || service.skill_id) {
        await this.validateRelations(service);
      }

      const updateData: Partial<FeaturedService> = {
        ...service,
        updated_at: new Date().toISOString()
      };

      if (newIconFile) {
        // Delete old icon if it's a file
        const oldService = await this.getById(id);
        if (oldService?.icon && !this.isValidIconClass(oldService.icon)) {
          await this.deleteIcon(oldService.icon);
        }
        updateData.icon = await this.uploadIcon(newIconFile);
      } else if (service.icon && !this.isValidIconClass(service.icon)) {
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
      console.error('Error updating featured service:', error);
      throw error;
    }
  }

  static async delete(id: number): Promise<void> {
    try {
      const service = await this.getById(id);
      if (service?.icon && !this.isValidIconClass(service.icon)) {
        await this.deleteIcon(service.icon);
      }

      const { error } = await supabase
        .from(this.TABLE_NAME)
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting featured service:', error);
      throw error;
    }
  }

  private static async validateRelations(service: Partial<FeaturedService>): Promise<void> {
    if (service.benefit_id) {
      const { data: benefit } = await supabase
        .from('service_benefits')
        .select('id')
        .eq('id', service.benefit_id)
        .single();

      if (!benefit) {
        throw new Error('Invalid benefit ID');
      }
    }

    if (service.skill_id) {
      const { data: skill } = await supabase
        .from('skills')
        .select('id')
        .eq('id', service.skill_id)
        .single();

      if (!skill) {
        throw new Error('Invalid skill ID');
      }
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