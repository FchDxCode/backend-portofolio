import { createClient } from "@/src/utils/supabase/client";
import { SkillCategory } from "@/src/models/SkillModels";

const supabase = createClient();

export class SkillCategoryService {
  private static TABLE_NAME = 'skill_categories';
  private static STORAGE_BUCKET = 'skill-category-icons';
  private static MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  static async getAll(params?: {
    search?: string;
    sort?: 'created_at';
    order?: 'asc' | 'desc';
  }): Promise<SkillCategory[]> {
    try {
      let query = supabase
        .from(this.TABLE_NAME)
        .select('*');

      if (params?.search) {
        query = query.or(`
          title->en.ilike.%${params.search}%,
          title->id.ilike.%${params.search}%,
          slug.ilike.%${params.search}%
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
      console.error('Error fetching skill categories:', error);
      throw error;
    }
  }

  static async getById(id: number): Promise<SkillCategory | null> {
    try {
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching skill category:', error);
      throw error;
    }
  }

  static async getBySlug(slug: string): Promise<SkillCategory | null> {
    try {
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .select('*')
        .eq('slug', slug)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching skill category by slug:', error);
      throw error;
    }
  }

  static async create(
    category: Omit<SkillCategory, 'id' | 'created_at' | 'updated_at'>,
    iconFile?: File
  ): Promise<SkillCategory> {
    try {
      const categoryData = { ...category };
      
      // Generate slug if not provided
      if (!categoryData.slug && categoryData.title?.en) {
        categoryData.slug = this.generateSlug(categoryData.title.en);
      }

      // Check if slug already exists
      const existingCategory = await this.getBySlug(categoryData.slug);
      if (existingCategory) {
        throw new Error('Slug already exists');
      }

      // Handle icon upload if provided
      if (iconFile) {
        categoryData.icon = await this.uploadIcon(iconFile);
      }

      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .insert({
          ...categoryData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating skill category:', error);
      throw error;
    }
  }

  static async update(
    id: number,
    category: Partial<SkillCategory>,
    newIconFile?: File
  ): Promise<SkillCategory> {
    try {
      const updateData: Partial<SkillCategory> = {
        ...category,
        updated_at: new Date().toISOString()
      };

      // Check if title is being updated, then generate new slug
      if (category.title?.en && !category.slug) {
        const oldCategory = await this.getById(id);
        // Only generate new slug if title has changed
        if (oldCategory?.title?.en !== category.title.en) {
          updateData.slug = this.generateSlug(category.title.en);
          
          // Check if new slug already exists (but not for the same category)
          const existingCategory = await this.getBySlug(updateData.slug);
          if (existingCategory && existingCategory.id !== id) {
            throw new Error('Generated slug already exists');
          }
        }
      }
      
      // Check if explicit slug is being provided and if it exists
      if (category.slug && category.slug !== (await this.getById(id))?.slug) {
        const existingCategory = await this.getBySlug(category.slug);
        if (existingCategory && existingCategory.id !== id) {
          throw new Error('Slug already exists');
        }
      }

      // Handle icon update if provided
      if (newIconFile) {
        const oldCategory = await this.getById(id);
        if (oldCategory?.icon) {
          await this.deleteIcon(oldCategory.icon);
        }
        updateData.icon = await this.uploadIcon(newIconFile);
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
      console.error('Error updating skill category:', error);
      throw error;
    }
  }

  static async delete(id: number): Promise<void> {
    try {
      // Check if category has skills
      const { count } = await supabase
        .from('skills')
        .select('*', { count: 'exact' })
        .eq('skill_category_id', id);

      if (count && count > 0) {
        throw new Error('Cannot delete: Category has associated skills');
      }

      const category = await this.getById(id);
      if (!category) return;

      // Delete icon if exists
      if (category.icon) {
        await this.deleteIcon(category.icon);
      }

      const { error } = await supabase
        .from(this.TABLE_NAME)
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting skill category:', error);
      throw error;
    }
  }

  static async getSkillCount(id: number): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('skills')
        .select('*', { count: 'exact' })
        .eq('skill_category_id', id);

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Error counting skills:', error);
      throw error;
    }
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
    if (!path.startsWith('http')) {
      const { error } = await supabase.storage
        .from('public')
        .remove([path]);

      if (error) throw error;
    }
  }

  static getIconUrl(path?: string): string {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    
    const { data } = supabase.storage
      .from('public')
      .getPublicUrl(path);
    
    return data.publicUrl;
  }

  private static generateSlug(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}