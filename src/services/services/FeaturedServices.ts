'use server';

import { createClient } from '@/src/utils/supabase/client';
import { FeaturedService } from '@/src/models/ServiceModels';
import { saveFile, deleteFile } from '@/src/utils/server/FileStorage';   

const supabase = createClient();

export class FeaturedServiceService {
  private static TABLE = 'featured_services';
  private static FOLDER = 'featured-icons';     
  private static MAX_SIZE = 5 * 1024 * 1024;       

  static async getAll(params?: {
    benefitId?: number;
    skillId?: number;
    search?: string;
    sort?: 'created_at';
    order?: 'asc' | 'desc';
  }): Promise<FeaturedService[]> {
    try {
      let q = supabase.from(this.TABLE).select('*');

      if (params?.benefitId) q = q.eq('benefit_id', params.benefitId);
      if (params?.skillId) q = q.eq('skill_id', params.skillId);

      if (params?.search)
        q = q.or(
          `title->en.ilike.%${params.search}%,title->id.ilike.%${params.search}%,` +
            `description->en.ilike.%${params.search}%,description->id.ilike.%${params.search}%`
        );

      q = q.order(params?.sort ?? 'created_at', {
        ascending: params?.order === 'asc',
      });

      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    } catch (err) {
      console.error('Error fetching featured services:', err);
      throw err;
    }
  }

  static async getById(id: number): Promise<FeaturedService | null> {
    const { data, error } = await supabase
      .from(this.TABLE)
      .select(
        `
        *,
        service_benefits(id,title),
        skills(id,title)
      `
      )
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  }

  static async create(
    svc: Omit<FeaturedService, 'id' | 'created_at' | 'updated_at'>,
    iconFile?: File
  ): Promise<FeaturedService> {
    await this.validateRelations(svc);

    const now = new Date().toISOString();
    const icon =
      iconFile
        ? await this.uploadIcon(iconFile)
        : svc.icon && !this.isValidIconClass(svc.icon)
        ? (() => {
            throw new Error('Invalid icon format. Must be a file or valid icon class.');
          })()
        : svc.icon ?? '';

    const { data, error } = await supabase
      .from(this.TABLE)
      .insert({ ...svc, icon, created_at: now, updated_at: now })
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  static async update(
    id: number,
    svc: Partial<FeaturedService>,
    newIcon?: File
  ): Promise<FeaturedService> {
    if (svc.benefit_id || svc.skill_id) await this.validateRelations(svc);

    const update: Partial<FeaturedService> = { ...svc, updated_at: new Date().toISOString() };

    if (newIcon) {
      const old = await this.getById(id);
      if (old?.icon && !this.isValidIconClass(old.icon)) await this.deleteIcon(old.icon);
      update.icon = await this.uploadIcon(newIcon);
    } else if (svc.icon && !this.isValidIconClass(svc.icon)) {
      throw new Error('Invalid icon format. Must be a file or valid icon class.');
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
    const svc = await this.getById(id);
    if (svc?.icon && !this.isValidIconClass(svc.icon)) await this.deleteIcon(svc.icon);

    const { error } = await supabase.from(this.TABLE).delete().eq('id', id);
    if (error) throw error;
  }

  private static async validateRelations(svc: Partial<FeaturedService>) {
    if (svc.benefit_id) {
      const { data } = await supabase.from('service_benefits').select('id').eq('id', svc.benefit_id).single();
      if (!data) throw new Error('Invalid benefit ID');
    }
    if (svc.skill_id) {
      const { data } = await supabase.from('skills').select('id').eq('id', svc.skill_id).single();
      if (!data) throw new Error('Invalid skill ID');
    }
  }

  private static isValidIconClass(icon: string) {
    return /^(fa|bi|material-icons|icon-)/.test(icon);
  }

  private static async uploadIcon(file: File) {
    if (file.size > this.MAX_SIZE) throw new Error('File size exceeds 5 MB limit');
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
