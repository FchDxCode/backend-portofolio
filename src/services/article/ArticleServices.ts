'use server';

import { createClient } from '@/src/utils/supabase/client';
import { Article } from '@/src/models/ArticleModels';
import {
  saveFile,
  deleteFile,
} from '@/src/utils/server/FileStorage';   

const supabase = createClient();

export class ArticleService {
  private static TABLE = 'articles';
  private static FOLDER = 'articles';         

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
      let q = supabase.from(this.TABLE).select('*', { count: 'exact' });

      if (params?.isActive !== undefined) q = q.eq('is_active', params.isActive);
      if (params?.categoryId) q = q.eq('article_category_id', params.categoryId);
      if (params?.tagId) q = q.eq('article_tag_id', params.tagId);

      if (params?.search) {
        q = q.or(
          `title->en.ilike.%${params.search}%,title->id.ilike.%${params.search}%`
        );
      }

      if (params?.sort)
        q = q.order(params.sort, { ascending: params.order === 'asc' });

      if (params?.page && params?.limit) {
        const from = (params.page - 1) * params.limit;
        q = q.range(from, from + params.limit - 1);
      }

      const { data, error, count } = await q;
      if (error) throw error;
      return { data: data ?? [], count: count ?? 0 };
    } catch (err) {
      console.error('Error fetching articles:', err);
      throw err;
    }
  }

  static async getById(id: number): Promise<Article | null> {
    const { data, error } = await supabase
      .from(this.TABLE)
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  }

  static async create(
    art: Omit<Article, 'id' | 'created_at' | 'updated_at' | 'total_views' | 'like'>
  ): Promise<Article> {
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from(this.TABLE)
      .insert({ ...art, total_views: 0, like: 0, created_at: now, updated_at: now })
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  static async update(id: number, art: Partial<Article>): Promise<Article> {
    const { data, error } = await supabase
      .from(this.TABLE)
      .update({ ...art, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  static async delete(id: number) {
    const art = await this.getById(id);
    if (art?.image) await deleteFile(art.image);

    const { error } = await supabase.from(this.TABLE).delete().eq('id', id);
    if (error) throw error;
  }

  static async updateImage(id: number, file: File): Promise<Article> {
    try {
      const current = await this.getById(id);
      if (!current) throw new Error('Article not found');

      const imagePath = await saveFile(file, {
        folder: `${this.FOLDER}/${id}`,
        deletePrev: current.image ?? null,   
      });

      return this.update(id, { image: imagePath });
    } catch (err) {
      console.error('Error updating article image:', err);
      throw err;
    }
  }

  static async incrementView(id: number) {
    const { error } = await supabase.rpc('increment_article_view', {
      article_id: id,
    });
    if (error) {
      console.error('Error incrementing article view:', error);
      throw error;
    }
  }

  static async toggleLike(id: number): Promise<Article> {
    const art = await this.getById(id);
    if (!art) throw new Error('Article not found');
    return this.update(id, { like: (art.like ?? 0) + 1 });
  }
}
