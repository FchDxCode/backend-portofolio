'use server';

import { createClient } from '@/src/utils/supabase/client';
import { WebSetting } from '@/src/models/WebSettingModels';
import { saveFile, deleteFile } from '@/src/utils/server/FileStorage'; 

const supabase = createClient();

export class WebSettingService {
  private static TABLE   = 'web_settings';
  private static FOLDER  = 'web-assets';  
  private static MAX_SIZE = 5 * 1024 * 1024; 

  static async getSetting(): Promise<WebSetting | null> {
    const { data, error } = await supabase
      .from(this.TABLE)
      .select('*')
      .order('id', { ascending: true })
      .limit(1)
      .single();
    if (error) throw error;
    return data;
  }

  static async upsertSetting(
    setting: Omit<WebSetting, 'id' | 'created_at' | 'updated_at'>,
    logoFile?: File,
    faviconFile?: File,
    cvFile?: File,
    portfolioFile?: File
  ): Promise<WebSetting> {
    try {
      const existing = await this.getSetting();
      const now = new Date().toISOString();
      const payload: any = { ...setting };

      if (logoFile) {
        if (existing?.logo) await this.removeFile(existing.logo);
        payload.logo = await this.upload(logoFile, 'logo');
      }
      if (faviconFile) {
        if (existing?.favicon) await this.removeFile(existing.favicon);
        payload.favicon = await this.upload(faviconFile, 'favicon');
      }
      if (cvFile) {
        if (existing?.cv) await this.removeFile(existing.cv);
        payload.cv = await this.upload(cvFile, 'cv');
      }
      if (portfolioFile) {
        if (existing?.portfolio) await this.removeFile(existing.portfolio);
        payload.portfolio = await this.upload(portfolioFile, 'portfolio');
      }

      if (existing) {
        const { data, error } = await supabase
          .from(this.TABLE)
          .update({ ...payload, updated_at: now })
          .eq('id', existing.id)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from(this.TABLE)
          .insert({ ...payload, created_at: now, updated_at: now })
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    } catch (err) {
      console.error('Error upserting web setting:', err);
      throw err;
    }
  }

  private static async upload(file: File, prefix: string) {
    if (file.size > this.MAX_SIZE) throw new Error('File size exceeds 5 MB');
    return saveFile(file, { folder: this.FOLDER, deletePrev: null, })  
      .then(path => {
        const ext = file.name.split('.').pop();
        const renamed = `/uploads/${this.FOLDER}/${prefix}-${Date.now()}.${ext}`;
        return path.startsWith('/uploads') ? renamed : path;
      });
  }

  private static async removeFile(path: string) {
    if (!path || path.startsWith('http')) return; 
    await deleteFile(path);
  }

  static getFileUrl(path?: string) {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return path.startsWith('/') ? path : `/${path}`;
  }

  static getDownloadUrl(path?: string) {
    return this.getFileUrl(path);
  }
}
