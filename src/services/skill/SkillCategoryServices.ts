'use server';

import { createClient } from '@/src/utils/supabase/client';
import { SkillCategory } from '@/src/models/SkillModels';
import { saveFile, deleteFile } from '@/src/utils/server/FileStorage'; 

const supabase = createClient();

export class SkillCategoryService {
  private static TABLE = 'skill_categories';
  private static FOLDER = 'skill-category-icons';      
  private static MAX_SIZE = 5 * 1024 * 1024;       

  static async getAll(params?: {
    search?: string;
    sort?: 'created_at';
    order?: 'asc' | 'desc';
  }): Promise<SkillCategory[]> {
    try {
      let q = supabase.from(this.TABLE).select('*');

      if (params?.search)
        q = q.or(
          `title->en.ilike.%${params.search}%,title->id.ilike.%${params.search}%,slug.ilike.%${params.search}%`
        );

      q = q.order(params?.sort ?? 'created_at', {
        ascending: params?.order === 'asc',
      });

      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    } catch (err) {
      console.error('Error fetching skill categories:', err);
      throw err;
    }
  }

  static async getById(id: number): Promise<SkillCategory | null> {
    const { data, error } = await supabase
      .from(this.TABLE)
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  }

  static async getBySlug(slug: string): Promise<SkillCategory | null> {
    const { data, error } = await supabase
      .from(this.TABLE)
      .select('*')
      .eq('slug', slug)
      .single();
    if (error) throw error;
    return data;
  }

  static async create(
    cat: Omit<SkillCategory, 'id' | 'created_at' | 'updated_at'>,
    iconFile?: File
  ): Promise<SkillCategory> {
    try {
      const payload: any = { ...cat };

      if (!payload.slug && payload.title?.en)
        payload.slug = this.generateSlug(payload.title.en);

      if (await this.getBySlug(payload.slug)) throw new Error('Slug already exists');

      if (iconFile) payload.icon = await this.uploadIcon(iconFile);

      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from(this.TABLE)
        .insert({ ...payload, created_at: now, updated_at: now })
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error creating skill category:', err);
      throw err;
    }
  }

  static async update(
    id: number,
    cat: Partial<SkillCategory>,
    newIcon?: File
  ): Promise<SkillCategory> {
    try {
      const update: any = { ...cat, updated_at: new Date().toISOString() };

      if (cat.title?.en && !cat.slug) {
        const old = await this.getById(id);
        if (old?.title?.en !== cat.title.en) {
          update.slug = this.generateSlug(cat.title.en);
          const dup = await this.getBySlug(update.slug);
          if (dup && dup.id !== id) throw new Error('Generated slug already exists');
        }
      }
      if (cat.slug) {
        const dup = await this.getBySlug(cat.slug);
        if (dup && dup.id !== id) throw new Error('Slug already exists');
      }

      if (newIcon) {
        const old = await this.getById(id);
        if (old?.icon) await this.deleteIcon(old.icon);
        update.icon = await this.uploadIcon(newIcon);
      }

      const { data, error } = await supabase
        .from(this.TABLE)
        .update(update)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error updating skill category:', err);
      throw err;
    }
  }

  static async delete(id: number) {
    try {
      const { count } = await supabase
        .from('skills')
        .select('*', { count: 'exact' })
        .eq('skill_category_id', id);
      if (count && count > 0) throw new Error('Cannot delete: Category has associated skills');

      const cat = await this.getById(id);
      if (cat?.icon) await this.deleteIcon(cat.icon);

      const { error } = await supabase.from(this.TABLE).delete().eq('id', id);
      if (error) throw error;
    } catch (err) {
      console.error('Error deleting skill category:', err);
      throw err;
    }
  }

  static async getSkillCount(id: number): Promise<number> {
    const { count, error } = await supabase
      .from('skills')
      .select('*', { count: 'exact' })
      .eq('skill_category_id', id);
    if (error) throw error;
    return count ?? 0;
  }

  private static generateSlug(text: string) {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  private static async uploadIcon(file: File) {
    if (file.size > this.MAX_SIZE) throw new Error('File size exceeds 5 MB');
    return saveFile(file, { folder: this.FOLDER });
  }

  private static async deleteIcon(path: string) {
    if (!path || path.startsWith('http')) return;
    await deleteFile(path);
  }

  static getIconUrl(path?: string) {
    if (!path) return '';
    return path.startsWith('http') ? path : path.startsWith('/') ? path : `/${path}`;
  }
}
