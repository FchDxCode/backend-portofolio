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
      // Buat query dasar dengan count exact
      let query = supabase.from(this.TABLE).select('*', { count: 'exact' });

      // Terapkan filter dasar
      if (params?.isActive !== undefined) {
        query = query.eq('is_active', params.isActive);
      }
      
      if (params?.categoryId) {
        query = query.eq('article_category_id', params.categoryId);
      }

      // Untuk filter tag, kita perlu mencari di tabel relasi
      if (params?.tagId) {
        // Gunakan query manual untuk mendapatkan artikel dengan tag tertentu
        const { data: taggedArticles, error: tagError } = await supabase
          .from('article_tags_articles')
          .select('article_id')
          .eq('article_tag_id', params.tagId);

        if (tagError) throw tagError;

        if (taggedArticles && taggedArticles.length > 0) {
          // Jika ada artikel dengan tag tersebut, filter berdasarkan ID artikel
          const articleIds = taggedArticles.map(item => item.article_id);
          query = query.in('id', articleIds);
        } else {
          // Jika tidak ada artikel dengan tag tersebut, return kosong
          return { data: [], count: 0 };
        }
      }

      // Filter pencarian pada judul
      if (params?.search) {
        query = query.or(
          `title->en.ilike.%${params.search}%,title->id.ilike.%${params.search}%`
        );
      }

      // Pengurutan data
      if (params?.sort) {
        query = query.order(params.sort, { ascending: params.order === 'asc' });
      }

      // Pagination
      if (params?.page !== undefined && params?.limit !== undefined) {
        const from = (params.page - 1) * params.limit;
        const to = from + params.limit - 1;
        query = query.range(from, to);
      }

      // Eksekusi query
      const { data, error, count } = await query;
      
      if (error) throw error;

      // Get tags for each article using manual query
      if (data && data.length > 0) {
        const articleIds = data.map(article => article.id);
        
        // Get all tag relations for these articles
        const { data: tagRelations, error: relError } = await supabase
          .from('article_tags_articles')
          .select('article_id, article_tag_id')
          .in('article_id', articleIds);

        if (relError) throw relError;

        // Get all tag ids
        if (tagRelations && tagRelations.length > 0) {
          const tagIdsMap: Record<number, boolean> = {};
          tagRelations.forEach(rel => {
            tagIdsMap[rel.article_tag_id] = true;
          });
          const tagIds = Object.keys(tagIdsMap).map(id => parseInt(id));
          
          // Get all tags
          const { data: tags, error: tagError } = await supabase
            .from('article_tags')
            .select('*')
            .in('id', tagIds);
            
          if (tagError) throw tagError;
          
          // Assign tags to each article
          data.forEach(article => {
            const articleTagRelations = tagRelations.filter(rel => rel.article_id === article.id);
            const articleTags = articleTagRelations
              .map(rel => tags.find(tag => tag.id === rel.article_tag_id))
              .filter(Boolean);
            
            // Add tags to article object
            article.tags = articleTags;
          });
        }
      }
      
      return { data: data || [], count: count || 0 };
    } catch (err) {
      console.error('Error fetching articles:', err);
      throw err;
    }
  }

  static async getById(id: number): Promise<Article | null> {
    try {
      // Get the article
      const { data: article, error } = await supabase
        .from(this.TABLE)
        .select('*')
        .eq('id', id)
        .single();
        
      if (error) throw error;
      if (!article) return null;
      
      // Get tags for this article using manual query
      const { data: tagRelations, error: relError } = await supabase
        .from('article_tags_articles')
        .select('article_tag_id')
        .eq('article_id', id);
        
      if (relError) throw relError;
      
      if (tagRelations && tagRelations.length > 0) {
        const tagIds = tagRelations.map(rel => rel.article_tag_id);
        
        // Get tags
        const { data: tags, error: tagError } = await supabase
          .from('article_tags')
          .select('*')
          .in('id', tagIds);
          
        if (tagError) throw tagError;
        
        // Add tags to article
        article.tags = tags || [];
      } else {
        article.tags = [];
      }
      
      return article;
    } catch (err) {
      console.error('Error getting article by ID:', err);
      throw err;
    }
  }

  static async create(
    art: Omit<Article, 'id' | 'created_at' | 'updated_at' | 'total_views' | 'like'>,
    tagIds?: number[]
  ): Promise<Article> {
    try {
      const now = new Date().toISOString();
      
      // Log what we're trying to insert for debugging
      console.log('Creating article with data:', art);
      
      // Create article
      const { data, error } = await supabase
        .from(this.TABLE)
        .insert({ 
          ...art, 
          total_views: 0, 
          like: 0, 
          created_at: now, 
          updated_at: now 
        })
        .select()
        .single();
        
      if (error) {
        console.error('Supabase error creating article:', error);
        throw new Error(`Database error: ${error.message}`);
      }
      
      if (!data) {
        throw new Error('No data returned after article creation');
      }
      
      // Add tags if provided
      if (tagIds && tagIds.length > 0 && data?.id) {
        const tagRelations = tagIds.map(tagId => ({
          article_id: data.id,
          article_tag_id: tagId
        }));
        
        console.log('Creating tag relations:', tagRelations);
        
        const { error: tagError } = await supabase
          .from('article_tags_articles')
          .insert(tagRelations);
          
        if (tagError) {
          console.error('Error creating tag relations:', tagError);
          throw new Error(`Error adding tags: ${tagError.message}`);
        }
        
        // Get article with tags
        const articleWithTags = await this.getById(data.id);
        // Return non-null article or the original data
        return articleWithTags || data;
      }
      
      return data;
    } catch (err) {
      console.error('Error in ArticleService.create:', err);
      throw err; // Re-throw to propagate up
    }
  }

  static async update(
    id: number, 
    art: Partial<Article>,
    tagIds?: number[]
  ): Promise<Article> {
    try {
      // Update the article
      const { data, error } = await supabase
        .from(this.TABLE)
        .update({ ...art, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
        
      if (error) throw error;
      
      // If tagIds are provided, update article tags
      if (tagIds !== undefined) {
        // First delete existing relations
        const { error: delError } = await supabase
          .from('article_tags_articles')
          .delete()
          .eq('article_id', id);
          
        if (delError) throw delError;
        
        // If there are tags to add
        if (tagIds.length > 0) {
          const tagRelations = tagIds.map(tagId => ({
            article_id: id,
            article_tag_id: tagId
          }));
          
          const { error: insError } = await supabase
            .from('article_tags_articles')
            .insert(tagRelations);
            
          if (insError) throw insError;
        }
      }
      
      // Return updated article with tags
      const updatedArticle = await this.getById(id);
      if (!updatedArticle) throw new Error('Failed to retrieve updated article');
      return updatedArticle;
    } catch (err) {
      console.error('Error updating article:', err);
      throw err;
    }
  }

  static async delete(id: number): Promise<void> {
    try {
      // Get article to delete image file later
      const art = await this.getById(id);
      
      // Delete article tags relations first (cascade would work, but let's be explicit)
      await supabase
        .from('article_tags_articles')
        .delete()
        .eq('article_id', id);

      // Delete the article
      const { error } = await supabase
        .from(this.TABLE)
        .delete()
        .eq('id', id);
        
      if (error) throw error;

      // Delete associated image file if exists
      if (art?.image) {
        await deleteFile(art.image);
      }
    } catch (err) {
      console.error('Error deleting article:', err);
      throw err;
    }
  }

  static async updateImage(id: number, file: File): Promise<Article> {
    try {
      // Get current article
      const current = await this.getById(id);
      if (!current) throw new Error('Article not found');

      // Save new image file
      const imagePath = await saveFile(file, {
        folder: `${this.FOLDER}/${id}`,
        deletePrev: current.image ?? null,   
      });

      // Update article with new image
      return this.update(id, { image: imagePath });
    } catch (err) {
      console.error('Error updating article image:', err);
      throw err;
    }
  }

  static async incrementView(id: number, readTime?: number): Promise<void> {
    try {
      // Get current article
      const { data: article, error } = await supabase
        .from(this.TABLE)
        .select('total_views, minute_read')
        .eq('id', id)
        .single();
        
      if (error) throw error;
      
      // Prepare update data
      const updateData: Partial<Article> = {
        total_views: (article?.total_views || 0) + 1
      };
      
      // If readTime is provided, update minute_read as running average
      if (readTime !== undefined && article) {
        const currentTotalViews = article.total_views || 0;
        const currentMinuteRead = article.minute_read || 0;
        
        // Calculate new running average: ((old_avg * n) + new_value) / (n + 1)
        const newMinuteRead = currentTotalViews > 0
          ? ((currentMinuteRead * currentTotalViews) + readTime) / (currentTotalViews + 1)
          : readTime;
          
        updateData.minute_read = newMinuteRead;
      }
      
      // Update the article
      const { error: updateError } = await supabase
        .from(this.TABLE)
        .update(updateData)
        .eq('id', id);
        
      if (updateError) throw updateError;
    } catch (err) {
      console.error('Error incrementing article view:', err);
      throw err;
    }
  }

  static async toggleLike(id: number): Promise<Article> {
    try {
      // Get current article
      const article = await this.getById(id);
      if (!article) throw new Error('Article not found');
      
      // Update with incremented like
      const updatedArticle = await this.update(id, { like: (article.like ?? 0) + 1 });
      return updatedArticle;
    } catch (err) {
      console.error('Error toggling article like:', err);
      throw err;
    }
  }
  
  static async getArticleTags(articleId: number) {
    try {
      const { data, error } = await supabase.rpc('get_article_tags', {
        article_id: articleId
      });
      
      if (error) {
        // Jika RPC tidak tersedia, gunakan query manual
        const { data: relations, error: relError } = await supabase
          .from('article_tags_articles')
          .select('article_tag_id')
          .eq('article_id', articleId);
          
        if (relError) throw relError;
        
        if (!relations || relations.length === 0) {
          return [];
        }
        
        const tagIds = relations.map(rel => rel.article_tag_id);
        
        const { data: tags, error: tagError } = await supabase
          .from('article_tags')
          .select('*')
          .in('id', tagIds);
          
        if (tagError) throw tagError;
        
        return tags || [];
      }
      
      return data || [];
    } catch (err) {
      console.error('Error getting article tags:', err);
      throw err;
    }
  }
  
  static async getAllTags() {
    try {
      const { data, error } = await supabase
        .from('article_tags')
        .select('*')
        .eq('is_active', true)
        .order('id', { ascending: true });
        
      if (error) throw error;
      
      return data || [];
    } catch (err) {
      console.error('Error getting all tags:', err);
      throw err;
    }
  }
}