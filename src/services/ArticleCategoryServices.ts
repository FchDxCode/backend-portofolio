import { createClient } from "../utils/supabase/client";
import { ArticleCategory } from "../models/ArticleModels";

const supabase = createClient();

export class ArticleCategoryService {
  private static TABLE_NAME = 'article_categories';

  /**
   * Get all article categories with optional filters
   */
  static async getAll(params?: {
    isActive?: boolean;
    sort?: 'created_at' | 'title';
    order?: 'asc' | 'desc';
  }): Promise<ArticleCategory[]> {
    try {
      let query = supabase
        .from(this.TABLE_NAME)
        .select('*');

      if (params?.isActive !== undefined) {
        query = query.eq('is_active', params.isActive);
      }

      if (params?.sort) {
        query = query.order(params.sort, { ascending: params.order === 'asc' });
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching article categories:', error);
      throw error;
    }
  }

  static async getById(id: number): Promise<ArticleCategory | null> {
    try {
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching article category:', error);
      throw error;
    }
  }

  static async create(category: Omit<ArticleCategory, 'id' | 'created_at' | 'updated_at'>): Promise<ArticleCategory> {
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
      console.error('Error creating article category:', error);
      throw error;
    }
  }

  static async update(id: number, category: Partial<ArticleCategory>): Promise<ArticleCategory> {
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
      console.error('Error updating article category:', error);
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
      console.error('Error deleting article category:', error);
      throw error;
    }
  }

  /**
   * Update category icon
   */
  static async updateIcon(id: number, file: File): Promise<ArticleCategory> {
    try {
      const iconPath = `article-categories/${id}/icon-${Date.now()}`;
      
      // Upload new icon
      const { error: uploadError } = await supabase.storage
        .from('public')
        .upload(iconPath, file);

      if (uploadError) throw uploadError;

      // Update category with new icon path
      return await this.update(id, { icon: iconPath });
    } catch (error) {
      console.error('Error updating category icon:', error);
      throw error;
    }
  }
}