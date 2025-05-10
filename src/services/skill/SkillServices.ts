import { createClient } from "@/src/utils/supabase/client";
import { Skill } from "@/src/models/SkillModels";

const supabase = createClient();

export class SkillService {
  private static TABLE_NAME = 'skills';
  private static STORAGE_BUCKET = 'skill-icons';
  private static MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  static async getAll(params?: {
    search?: string;
    categoryId?: number;
    minPercent?: number;
    minExperience?: number;
    sort?: 'percent_skills' | 'long_experience' | 'created_at' | 'title';
    order?: 'asc' | 'desc';
    withCategory?: boolean;
  }): Promise<Skill[]> {
    try {
      // Gunakan pendekatan query terpisah untuk menghindari masalah parser
      
      // 1. Ambil data skill dasar dulu
      let query = supabase
        .from(this.TABLE_NAME)
        .select('*');

      // Terapkan filter yang sama
      if (params?.search) {
        query = query.or(`
          title->en.ilike.%${params.search}%,
          title->id.ilike.%${params.search}%,
          slug.ilike.%${params.search}%
        `);
      }

      if (params?.categoryId) {
        query = query.eq('skill_category_id', params.categoryId);
      }

      if (params?.minPercent) {
        query = query.gte('percent_skills', params.minPercent);
      }

      if (params?.minExperience) {
        query = query.gte('long_experience', params.minExperience);
      }

      if (params?.sort) {
        query = query.order(params.sort, { ascending: params.order === 'asc' });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query;
      if (error) throw error;
      
      // Jika tidak ada data atau tidak perlu kategori, return cepat
      if (!data?.length || !params?.withCategory) {
        return data || [];
      }
      
      // 2. Jika butuh data kategori, ambil semua ID kategori yang unik
      const categoryIds = Array.from(new Set(
        data
          .filter(item => item.skill_category_id)
          .map(item => item.skill_category_id)
      ));
      
      // Jika tidak ada kategori untuk diambil, return data dasar
      if (!categoryIds.length) {
        return data;
      }
      
      // 3. Ambil data kategori terpisah
      const { data: categories } = await supabase
        .from('skill_categories')
        .select('id,title,slug,icon')
        .in('id', categoryIds);
      
      // 4. Buat map untuk lookup cepat
      const categoryMap: Record<number, any> = {};
      if (categories) {
        categories.forEach(category => {
          categoryMap[category.id] = category;
        });
      }
      
      // 5. Gabungkan data
      return data.map(skill => ({
        ...skill,
        skill_categories: skill.skill_category_id ? 
          categoryMap[skill.skill_category_id] : null
      }));
    } catch (error) {
      console.error('Error fetching skills:', error);
      throw error;
    }
  }

  static async getById(id: number, withCategory = false): Promise<Skill | null> {
    try {
      // Ambil data skill dasar
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (!data) return null;
      
      // Jika tidak perlu data kategori, return cepat
      if (!withCategory || !data.skill_category_id) {
        return data;
      }
      
      // Ambil data kategori terpisah
      const { data: category } = await supabase
        .from('skill_categories')
        .select('id,title,slug,icon')
        .eq('id', data.skill_category_id)
        .single();
      
      // Gabungkan data
      return {
        ...data,
        skill_categories: category || null
      };
    } catch (error) {
      console.error('Error fetching skill:', error);
      throw error;
    }
  }

  static async getBySlug(slug: string): Promise<Skill | null> {
    try {
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .select('*')
        .eq('slug', slug)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching skill by slug:', error);
      throw error;
    }
  }

  static async create(
    skill: Omit<Skill, 'id' | 'created_at' | 'updated_at'>,
    iconFile?: File
  ): Promise<Skill> {
    try {
      const skillData = { ...skill };
      
      // Generate slug if not provided
      if (!skillData.slug && skillData.title?.en) {
        skillData.slug = this.generateSlug(skillData.title.en);
      }

      // Check if slug already exists
      const existingSkill = await this.getBySlug(skillData.slug);
      if (existingSkill) {
        throw new Error('Slug already exists');
      }

      // Validate percent_skills if provided
      if (skillData.percent_skills !== undefined) {
        if (skillData.percent_skills < 0 || skillData.percent_skills > 100) {
          throw new Error('Percent skills must be between 0 and 100');
        }
      }

      // Validate long_experience if provided
      if (skillData.long_experience !== undefined && skillData.long_experience < 0) {
        throw new Error('Experience years cannot be negative');
      }

      // Handle icon upload if provided
      if (iconFile) {
        skillData.icon = await this.uploadIcon(iconFile);
      }

      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .insert({
          ...skillData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating skill:', error);
      throw error;
    }
  }

  static async update(
    id: number,
    skill: Partial<Skill>,
    newIconFile?: File
  ): Promise<Skill> {
    try {
      const updateData: Partial<Skill> = {
        ...skill,
        updated_at: new Date().toISOString()
      };

      // Check if title is being updated, then generate new slug
      if (skill.title?.en && !skill.slug) {
        const oldSkill = await this.getById(id);
        // Only generate new slug if title has changed
        if (oldSkill?.title?.en !== skill.title.en) {
          updateData.slug = this.generateSlug(skill.title.en);
          
          // Check if new slug already exists (but not for the same skill)
          const existingSkill = await this.getBySlug(updateData.slug);
          if (existingSkill && existingSkill.id !== id) {
            throw new Error('Generated slug already exists');
          }
        }
      }
      
      // Check if explicit slug is being provided and if it exists
      if (skill.slug && skill.slug !== (await this.getById(id))?.slug) {
        const existingSkill = await this.getBySlug(skill.slug);
        if (existingSkill && existingSkill.id !== id) {
          throw new Error('Slug already exists');
        }
      }

      // Validate percent_skills if provided
      if (updateData.percent_skills !== undefined) {
        if (updateData.percent_skills < 0 || updateData.percent_skills > 100) {
          throw new Error('Percent skills must be between 0 and 100');
        }
      }

      // Validate long_experience if provided
      if (updateData.long_experience !== undefined && updateData.long_experience < 0) {
        throw new Error('Experience years cannot be negative');
      }

      // Handle icon update if provided
      if (newIconFile) {
        const oldSkill = await this.getById(id);
        if (oldSkill?.icon) {
          await this.deleteIcon(oldSkill.icon);
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
      console.error('Error updating skill:', error);
      throw error;
    }
  }

  static async delete(id: number): Promise<void> {
    try {
      const skill = await this.getById(id);
      if (!skill) return;

      // Delete icon if exists
      if (skill.icon) {
        await this.deleteIcon(skill.icon);
      }

      const { error } = await supabase
        .from(this.TABLE_NAME)
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting skill:', error);
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

  static formatPercent(percent?: number): string {
    if (percent === undefined || percent === null) return '0%';
    return `${percent}%`;
  }

  static formatExperience(years?: number): string {
    if (years === undefined || years === null) return '0 years';
    if (years < 1) {
      const months = Math.round(years * 12);
      return `${months} month${months !== 1 ? 's' : ''}`;
    }
    return `${years} year${years !== 1 ? 's' : ''}`;
  }
}