import { createClient } from "@/src/utils/supabase/client";
import { Experience } from "@/src/models/ExperienceModels";

const supabase = createClient();

export class ExperienceService {
  private static TABLE_NAME = 'experiences';

  /**
   * Get all experiences with filters and sorting
   */
  static async getAll(params?: {
    categoryId?: number;
    skillId?: number;
    search?: string;
    sort?: 'created_at' | 'experience_long';
    order?: 'asc' | 'desc';
    page?: number;
    limit?: number;
  }): Promise<{ data: Experience[]; count: number }> {
    try {
      let query = supabase
        .from(this.TABLE_NAME)
        .select('*', { count: 'exact' });

      // Apply filters
      if (params?.categoryId) {
        query = query.eq('experience_category_id', params.categoryId);
      }

      if (params?.skillId) {
        query = query.eq('skill_id', params.skillId);
      }

      if (params?.search) {
        query = query.or(
          `title->en.ilike.%${params.search}%,title->id.ilike.%${params.search}%,` +
          `subtitle->en.ilike.%${params.search}%,subtitle->id.ilike.%${params.search}%`
        );
      }

      // Apply sorting
      if (params?.sort) {
        query = query.order(params.sort, { ascending: params.order === 'asc' });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      // Apply pagination
      if (params?.page && params?.limit) {
        const from = (params.page - 1) * params.limit;
        const to = from + params.limit - 1;
        query = query.range(from, to);
      }

      const { data, error, count } = await query;

      if (error) throw error;
      return { data: data || [], count: count || 0 };
    } catch (error) {
      console.error('Error fetching experiences:', error);
      throw error;
    }
  }

  static async getById(id: number): Promise<Experience | null> {
    try {
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching experience:', error);
      throw error;
    }
  }

  static async create(experience: Omit<Experience, 'id' | 'created_at' | 'updated_at'>): Promise<Experience> {
    try {
      // Validate required relations
      await this.validateRelations(experience);
      
      // Validate company link if provided
      if (experience.company_link && !this.isValidUrl(experience.company_link)) {
        throw new Error('Invalid company link URL');
      }

      // Validate experience_long
      if (experience.experience_long !== undefined && experience.experience_long < 0) {
        throw new Error('Experience duration cannot be negative');
      }

      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .insert({
          ...experience,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating experience:', error);
      throw error;
    }
  }

  static async update(id: number, experience: Partial<Experience>): Promise<Experience> {
    try {
      // Validate relations if provided
      await this.validateRelations(experience);

      // Validate company link if provided
      if (experience.company_link && !this.isValidUrl(experience.company_link)) {
        throw new Error('Invalid company link URL');
      }

      // Validate experience_long if provided
      if (experience.experience_long !== undefined && experience.experience_long < 0) {
        throw new Error('Experience duration cannot be negative');
      }

      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .update({
          ...experience,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating experience:', error);
      throw error;
    }
  }

  static async delete(id: number): Promise<void> {
    try {
      const { error } = await supabase
        .from(this.TABLE_NAME)
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting experience:', error);
      throw error;
    }
  }

  private static async validateRelations(experience: Partial<Experience>): Promise<void> {
    if (experience.experience_category_id) {
      const { data } = await supabase
        .from('experience_categories')
        .select('id')
        .eq('id', experience.experience_category_id)
        .single();

      if (!data) {
        throw new Error('Invalid experience category ID');
      }
    }

    if (experience.skill_id) {
      const { data } = await supabase
        .from('skills')
        .select('id')
        .eq('id', experience.skill_id)
        .single();

      if (!data) {
        throw new Error('Invalid skill ID');
      }
    }
  }

  private static isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
}