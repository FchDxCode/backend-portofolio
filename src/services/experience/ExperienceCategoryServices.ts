import { createClient } from "@/src/utils/supabase/client";
import { ExperienceCategory } from "@/src/models/ExperienceModels";

const supabase = createClient();

export class ExperienceCategoryService {
  private static TABLE_NAME = 'experience_categories';

  static async getAll(params?: {
    sort?: 'created_at' | 'title';
    order?: 'asc' | 'desc';
    search?: string;
  }): Promise<ExperienceCategory[]> {
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
      console.error('Error fetching experience categories:', error);
      throw error;
    }
  }

  static async getById(id: number): Promise<ExperienceCategory | null> {
    try {
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching experience category:', error);
      throw error;
    }
  }

  static async create(category: Omit<ExperienceCategory, 'id' | 'created_at' | 'updated_at'>): Promise<ExperienceCategory> {
    try {
      if (!category.slug) {
        category.slug = this.generateSlug(category.title?.en || '');
      }

      const { data: existing } = await supabase
        .from(this.TABLE_NAME)
        .select('slug')
        .eq('slug', category.slug)
        .single();

      if (existing) {
        throw new Error('Category with this slug already exists');
      }

      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .insert({
          ...category,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating experience category:', error);
      throw error;
    }
  }

  static async update(id: number, category: Partial<ExperienceCategory>): Promise<ExperienceCategory> {
    try {
      if (category.slug) {
        const { data: existing } = await supabase
          .from(this.TABLE_NAME)
          .select('slug')
          .eq('slug', category.slug)
          .neq('id', id)
          .single();

        if (existing) {
          throw new Error('Category with this slug already exists');
        }
      }

      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .update({
          ...category,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating experience category:', error);
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
      console.error('Error deleting experience category:', error);
      throw error;
    }
  }

  private static generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
}