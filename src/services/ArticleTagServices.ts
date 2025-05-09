import { createClient } from "../utils/supabase/client";
import { ArticleTag } from "../models/ArticleModels";

const supabase = createClient();

export class ArticleTagService {
  private static TABLE_NAME = 'article_tags';

  /**
   * Get all article tags with optional filters
   */
  static async getAll(params?: {
    isActive?: boolean;
    sort?: 'created_at' | 'title';
    order?: 'asc' | 'desc';
  }): Promise<ArticleTag[]> {
    try {
      let query = supabase
        .from(this.TABLE_NAME)
        .select('*');

      // Apply filters
      if (params?.isActive !== undefined) {
        query = query.eq('is_active', params.isActive);
      }

      // Apply sorting
      if (params?.sort) {
        query = query.order(params.sort, { ascending: params.order === 'asc' });
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching article tags:', error);
      throw error;
    }
  }

  /**
   * Get single article tag by id
   */
  static async getById(id: number): Promise<ArticleTag | null> {
    try {
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching article tag:', error);
      throw error;
    }
  }

  /**
   * Create new article tag
   */
  static async create(tag: Omit<ArticleTag, 'id' | 'created_at' | 'updated_at'>): Promise<ArticleTag> {
    try {
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .insert({
          ...tag,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating article tag:', error);
      throw error;
    }
  }

  /**
   * Update article tag
   */
  static async update(id: number, tag: Partial<ArticleTag>): Promise<ArticleTag> {
    try {
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .update({
          ...tag,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating article tag:', error);
      throw error;
    }
  }

  /**
   * Delete article tag
   */
  static async delete(id: number): Promise<void> {
    try {
      const { error } = await supabase
        .from(this.TABLE_NAME)
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting article tag:', error);
      throw error;
    }
  }

  /**
   * Toggle article tag active status
   */
  static async toggleActive(id: number): Promise<ArticleTag> {
    try {
      const tag = await this.getById(id);
      if (!tag) throw new Error('Tag not found');

      return await this.update(id, { is_active: !tag.is_active });
    } catch (error) {
      console.error('Error toggling article tag status:', error);
      throw error;
    }
  }
}