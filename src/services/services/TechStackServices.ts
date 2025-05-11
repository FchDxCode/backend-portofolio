// services/TechStackService.ts
'use server';

import { createClient } from '@/src/utils/supabase/client';
import { TechStack } from '@/src/models/ServiceModels';
import { saveFile, deleteFile } from '@/src/utils/server/FileStorage';   

const supabase = createClient();

export class TechStackService {
  private static TABLE = 'tech_stacks';
  private static FOLDER = 'tech-stack-icons';      
  private static MAX_SIZE = 5 * 1024 * 1024;       

  static async getAll(params?: {
    skillId?: number;
    search?: string;
    sort?: 'created_at' | 'title';
    order?: 'asc' | 'desc';
  }): Promise<TechStack[]> {
    try {
      let q = supabase
        .from(this.TABLE)
        .select('*,tech_stack_skills(id,title)');

      if (params?.skillId) q = q.eq('tech_stack_skill_id', params.skillId);

      if (params?.search)
        q = q.or(
          `title->en.ilike.%${params.search}%,title->id.ilike.%${params.search}%`
        );

      q = q.order(params?.sort ?? 'created_at', {
        ascending: params?.order === 'asc',
      });

      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    } catch (err) {
      console.error('Error fetching tech stacks:', err);
      throw err;
    }
  }

  static async getById(id: number): Promise<TechStack | null> {
    const { data, error } = await supabase
      .from(this.TABLE)
      .select(
        `
        *,
        tech_stack_skills(id,title)
      `
      )
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  }

  static async create(
    tech: Omit<TechStack, 'id' | 'created_at' | 'updated_at'>,
    iconFile?: File
  ): Promise<TechStack> {
    await this.validateSkillId(tech.tech_stack_skill_id);

    const payload: any = { ...tech };

    if (iconFile) {
      payload.icon = await this.uploadIcon(iconFile);
    } else if (tech.icon && !this.isValidIconClass(tech.icon)) {
      throw new Error('Invalid icon format. Must be a file or valid icon class.');
    }

    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from(this.TABLE)
      .insert({ ...payload, created_at: now, updated_at: now })
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  static async update(
    id: number,
    tech: Partial<TechStack>,
    newIconFile?: File
  ): Promise<TechStack> {
    if (tech.tech_stack_skill_id) await this.validateSkillId(tech.tech_stack_skill_id);

    const update: any = { ...tech, updated_at: new Date().toISOString() };

    if (newIconFile) {
      const old = await this.getById(id);
      if (old?.icon && !this.isValidIconClass(old.icon)) await this.deleteIcon(old.icon);
      update.icon = await this.uploadIcon(newIconFile);
    } else if (tech.icon && !this.isValidIconClass(tech.icon)) {
      throw new Error('Invalid icon format');
    }

    const { data, error } = await supabase
      .from(this.TABLE)
      .update(update)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  static async delete(id: number) {
    const tech = await this.getById(id);
    if (tech?.icon && !this.isValidIconClass(tech.icon)) await this.deleteIcon(tech.icon);

    const { error } = await supabase.from(this.TABLE).delete().eq('id', id);
    if (error) throw error;
  }

  private static async validateSkillId(skillId?: number) {
    if (!skillId) return;
    const { data } = await supabase.from('tech_stack_skills').select('id').eq('id', skillId).single();
    if (!data) throw new Error('Invalid tech stack skill ID');
  }

  private static isValidIconClass(icon: string) {
    return /^(fa|bi|material-icons|icon-)/.test(icon);
  }

  private static async uploadIcon(file: File) {
    if (file.size > this.MAX_SIZE) throw new Error('File size exceeds 5 MB');
    return saveFile(file, { folder: this.FOLDER });
  }

  private static async deleteIcon(path: string) {
    await deleteFile(path);
  }

  static getIconUrl(path: string) {
    if (this.isValidIconClass(path)) return path;
    return /^https?:\/\//i.test(path) ? path : path.startsWith('/') ? path : `/${path}`;
  }
}
