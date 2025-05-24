import { createClient } from '@/src/utils/supabase/client';
import { Skill } from '@/src/models/SkillModels';
import { saveFile, deleteFile } from '@/src/utils/server/FileStorage'; 

const supabase = createClient();

export class SkillService {
  private static TABLE   = 'skills';
  private static FOLDER  = 'skill-icons';          
  private static MAX_SIZE = 5 * 1024 * 1024;       

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
      let q = supabase.from(this.TABLE).select('*');

      if (params?.search) {
        q = q.or(
          `title->en.ilike.%${params.search}%,
           title->id.ilike.%${params.search}%,
           slug.ilike.%${params.search}%`
        );
      }
      if (params?.categoryId)   q = q.eq('skill_category_id', params.categoryId);
      if (params?.minPercent)   q = q.gte('percent_skills', params.minPercent);
      if (params?.minExperience)q = q.gte('long_experience', params.minExperience);

      q = q.order(params?.sort ?? 'created_at', {
        ascending: params?.order === 'asc',
      });

      const { data, error } = await q;
      if (error) throw error;

      if (!data?.length || !params?.withCategory) return data || [];

      const catIds = Array.from(
        new Set(data.filter(s => s.skill_category_id).map(s => s.skill_category_id))
      );
      if (!catIds.length) return data;

      const { data: cats } = await supabase
        .from('skill_categories')
        .select('id,title,slug,icon')
        .in('id', catIds);

      const catMap: Record<number, any> = {};
      cats?.forEach(c => (catMap[c.id] = c));

      return data.map(s => ({
        ...s,
        skill_categories: s.skill_category_id ? catMap[s.skill_category_id] : null,
      }));
    } catch (err) {
      console.error('Error fetching skills:', err);
      throw err;
    }
  }

  static async getById(id: number, withCategory = false): Promise<Skill | null> {
    const { data, error } = await supabase
      .from(this.TABLE)
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    if (!data) return null;

    if (!withCategory || !data.skill_category_id) return data;

    const { data: cat } = await supabase
      .from('skill_categories')
      .select('id,title,slug,icon')
      .eq('id', data.skill_category_id)
      .single();

    return { ...data, skill_categories: cat || null };
  }

  static async getBySlug(slug: string): Promise<Skill | null> {
    const { data, error } = await supabase
      .from(this.TABLE)
      .select('*')
      .eq('slug', slug)
      .single();
    if (error) throw error;
    return data;
  }

  static async create(
    skill: Omit<Skill, 'id' | 'created_at' | 'updated_at'>,
    iconFile?: File
  ): Promise<Skill> {
    try {
      const payload: any = { ...skill };

      if (!payload.slug && payload.title?.en) payload.slug = this.generateSlug(payload.title.en);
      if (await this.getBySlug(payload.slug)) throw new Error('Slug already exists');

      if (payload.percent_skills !== undefined && (payload.percent_skills < 0 || payload.percent_skills > 100))
        throw new Error('Percent skills must be between 0 and 100');
      if (payload.long_experience !== undefined && payload.long_experience < 0)
        throw new Error('Experience years cannot be negative');

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
      console.error('Error creating skill:', err);
      throw err;
    }
  }

  static async update(
    id: number,
    skill: Partial<Skill>,
    newIconFile?: File
  ): Promise<Skill> {
    try {
      const update: any = { ...skill, updated_at: new Date().toISOString() };

      if (skill.title?.en) {
        const old = await this.getById(id);
        if (old?.title?.en !== skill.title.en) {
          update.slug = this.generateSlug(skill.title.en);
          const dup = await this.getBySlug(update.slug);
          if (dup && dup.id !== id) throw new Error('Generated slug already exists');
        }
      }

      if (update.percent_skills !== undefined && (update.percent_skills < 0 || update.percent_skills > 100))
        throw new Error('Percent skills must be between 0 and 100');
      if (update.long_experience !== undefined && update.long_experience < 0)
        throw new Error('Experience years cannot be negative');

      if (newIconFile) {
        const old = await this.getById(id);
        if (old?.icon) await this.deleteIcon(old.icon);
        update.icon = await this.uploadIcon(newIconFile);
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
      console.error('Error updating skill:', err);
      throw err;
    }
  }

  static async delete(id: number) {
    const skill = await this.getById(id);
    if (skill?.icon) await this.deleteIcon(skill.icon);

    const { error } = await supabase.from(this.TABLE).delete().eq('id', id);
    if (error) throw error;
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

  private static generateSlug(text: string) {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  static formatPercent(p?: number) {
    if (p === undefined || p === null) return '0%';
    return `${p}%`;
  }

  static formatExperience(years?: number) {
    if (years === undefined || years === null) return '0 years';
    if (years < 1) {
      const months = Math.round(years * 12);
      return `${months} month${months !== 1 ? 's' : ''}`;
    }
    return `${years} year${years !== 1 ? 's' : ''}`;
  }
}
