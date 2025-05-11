import { createClient } from "@/src/utils/supabase/client";
import { TestimonialCategory } from "@/src/models/ServiceModels";

const supabase = createClient();

export class TestimonialCategoryService {
  private static TABLE_NAME = 'testimonial_categories';

  static async getAll(params?: {
    search?: string;
    sort?: 'created_at';
    order?: 'asc' | 'desc';
  }): Promise<TestimonialCategory[]> {
    try {
      let query = supabase
        .from(this.TABLE_NAME)
        .select('*');

      if (params?.search) {
        query = query.or(`
          title->en.ilike.%${params.search}%,
          title->id.ilike.%${params.search}%
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
      console.error('Error fetching testimonial categories:', error);
      throw error;
    }
  }

  static async getById(id: number): Promise<TestimonialCategory | null> {
    try {
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching testimonial category:', error);
      throw error;
    }
  }

  static async create(
    category: Omit<TestimonialCategory, 'id' | 'created_at' | 'updated_at'>
  ): Promise<TestimonialCategory> {
    try {
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
      console.error('Error creating testimonial category:', error);
      throw error;
    }
  }

  static async update(
    id: number,
    category: Partial<TestimonialCategory>
  ): Promise<TestimonialCategory> {
    try {
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
      console.error('Error updating testimonial category:', error);
      throw error;
    }
  }

  static async delete(id: number): Promise<void> {
    try {
      const { count } = await supabase
        .from('testimonials')
        .select('*', { count: 'exact' })
        .eq('testimonial_category_id', id);

      if (count && count > 0) {
        throw new Error('Cannot delete: Category is being used in testimonials');
      }

      const { error } = await supabase
        .from(this.TABLE_NAME)
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting testimonial category:', error);
      throw error;
    }
  }

  static async isUsedInTestimonials(id: number): Promise<boolean> {
    const { count } = await supabase
      .from('testimonials')
      .select('*', { count: 'exact' })
      .eq('testimonial_category_id', id);

    return count ? count > 0 : false;
  }
}