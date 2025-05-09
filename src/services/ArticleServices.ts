import { createClient } from "../utils/supabase/client";
import { Article } from "../models/ArticleModels";

const supabase = createClient();

export class ArticleService {
  private static TABLE_NAME = 'articles';

  /**
   * Get all articles with optional filters and pagination
   */
  static async getAll(params?: {
    isActive?: boolean;
    categoryId?: number;
    tagId?: number;
    sort?: 'created_at' | 'total_views' | 'like';
    order?: 'asc' | 'desc';
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<{ data: Article[]; count: number }> {
    try {
      let query = supabase
        .from(this.TABLE_NAME)
        .select('*', { count: 'exact' });

      // Apply filters
      if (params?.isActive !== undefined) {
        query = query.eq('is_active', params.isActive);
      }

      if (params?.categoryId) {
        query = query.eq('article_category_id', params.categoryId);
      }

      if (params?.tagId) {
        query = query.eq('article_tag_id', params.tagId);
      }

      if (params?.search) {
        query = query.or(`title->en.ilike.%${params.search}%,title->id.ilike.%${params.search}%`);
      }

      // Apply sorting
      if (params?.sort) {
        query = query.order(params.sort, { ascending: params.order === 'asc' });
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
      console.error('Error fetching articles:', error);
      throw error;
    }
  }

  static async getById(id: number): Promise<Article | null> {
    try {
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching article:', error);
      throw error;
    }
  }

  static async create(article: Omit<Article, 'id' | 'created_at' | 'updated_at' | 'total_views' | 'like'>): Promise<Article> {
    try {
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .insert({
          ...article,
          total_views: 0,
          like: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating article:', error);
      throw error;
    }
  }

  static async update(id: number, article: Partial<Article>): Promise<Article> {
    try {
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .update({
          ...article,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating article:', error);
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
      console.error('Error deleting article:', error);
      throw error;
    }
  }

  /**
   * Update article image
   */
  static async updateImage(id: number, file: File): Promise<Article> {
    try {
      const imagePath = `articles/${id}/image-${Date.now()}`;
      
      // Upload new image
      const { error: uploadError } = await supabase.storage
        .from('public')
        .upload(imagePath, file);

      if (uploadError) throw uploadError;

      // Update article with new image path
      return await this.update(id, { image: imagePath });
    } catch (error) {
      console.error('Error updating article image:', error);
      throw error;
    }
  }

  /**
   * Increment view count
   */
  static async incrementView(id: number): Promise<void> {
    try {
      const { error } = await supabase.rpc('increment_article_view', { article_id: id });
      if (error) throw error;
    } catch (error) {
      console.error('Error incrementing article view:', error);
      throw error;
    }
  }

  /**
   * Toggle like
   */
  static async toggleLike(id: number): Promise<Article> {
    try {
      const article = await this.getById(id);
      if (!article) throw new Error('Article not found');

      return await this.update(id, { like: (article.like || 0) + 1 });
    } catch (error) {
      console.error('Error toggling article like:', error);
      throw error;
    }
  }
}