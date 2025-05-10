import { createClient } from "@/src/utils/supabase/client";
import { WebSetting } from "@/src/models/WebSettingModels";

const supabase = createClient();

export class WebSettingService {
  private static TABLE_NAME = 'web_settings';
  private static STORAGE_BUCKET = 'web-assets';
  private static MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  /**
   * Mendapatkan setting website (singleton)
   */
  static async getSetting(): Promise<WebSetting | null> {
    try {
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .select('*')
        .order('id', { ascending: true })
        .limit(1)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching web setting:', error);
      throw error;
    }
  }

  /**
   * Membuat setting baru jika belum ada, atau update jika sudah ada
   */
  static async upsertSetting(
    setting: Omit<WebSetting, 'id' | 'created_at' | 'updated_at'>,
    logoFile?: File,
    faviconFile?: File,
    cvFile?: File,
    portfolioFile?: File
  ): Promise<WebSetting> {
    try {
      // Cek apakah setting sudah ada
      const existingSetting = await this.getSetting();
      
      // Prepare data
      const settingData = { ...setting };
      const now = new Date().toISOString();
      
      // Handle file uploads if provided
      if (logoFile) {
        settingData.logo = await this.uploadFile(logoFile, 'logo');
      }
      
      if (faviconFile) {
        settingData.favicon = await this.uploadFile(faviconFile, 'favicon');
      }
      
      if (cvFile) {
        settingData.cv = await this.uploadFile(cvFile, 'cv');
      }
      
      if (portfolioFile) {
        settingData.portfolio = await this.uploadFile(portfolioFile, 'portfolio');
      }

      let result;
      
      if (existingSetting) {
        // Update existing record
        const { data, error } = await supabase
          .from(this.TABLE_NAME)
          .update({
            ...settingData,
            updated_at: now
          })
          .eq('id', existingSetting.id)
          .select()
          .single();

        if (error) throw error;
        result = data;
      } else {
        // Insert new record
        const { data, error } = await supabase
          .from(this.TABLE_NAME)
          .insert({
            ...settingData,
            created_at: now,
            updated_at: now
          })
          .select()
          .single();

        if (error) throw error;
        result = data;
      }

      return result;
    } catch (error) {
      console.error('Error upserting web setting:', error);
      throw error;
    }
  }

  /**
   * Upload file for website assets
   */
  private static async uploadFile(file: File, prefix: string): Promise<string> {
    if (file.size > this.MAX_FILE_SIZE) {
      throw new Error(`File size exceeds 5MB limit`);
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${prefix}-${Date.now()}.${fileExt}`;
    const filePath = `${this.STORAGE_BUCKET}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('public')
      .upload(filePath, file);

    if (uploadError) throw uploadError;
    return filePath;
  }

  /**
   * Delete file from storage
   */
  private static async deleteFile(path: string): Promise<void> {
    if (!path.startsWith('http')) {
      const { error } = await supabase.storage
        .from('public')
        .remove([path]);

      if (error) throw error;
    }
  }

  /**
   * Get public URL for file
   */
  static getFileUrl(path?: string): string {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    
    const { data } = supabase.storage
      .from('public')
      .getPublicUrl(path);
    
    return data.publicUrl;
  }

  /**
   * Get download URL for file (CV, Portfolio)
   */
  static getDownloadUrl(path?: string): string {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    
    const { data } = supabase.storage
      .from('public')
      .getPublicUrl(path, {
        download: true
      });
    
    return data.publicUrl;
  }
}