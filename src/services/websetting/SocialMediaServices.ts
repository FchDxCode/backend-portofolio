import { createClient } from "@/src/utils/supabase/client";
import { SocialMedia } from "@/src/models/WebSettingModels";

const supabase = createClient();

export class SocialMediaService {
  private static TABLE_NAME = 'social_media';
  private static STORAGE_BUCKET = 'social-media-icons';
  private static MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  static async getAll(params?: {
    search?: string;
    sort?: 'created_at';
    order?: 'asc' | 'desc';
  }): Promise<SocialMedia[]> {
    try {
      let query = supabase
        .from(this.TABLE_NAME)
        .select('*');

      if (params?.search) {
        query = query.or(`
          title->en.ilike.%${params.search}%,
          title->id.ilike.%${params.search}%,
          link.ilike.%${params.search}%
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
      console.error('Error fetching social media:', error);
      throw error;
    }
  }

  static async getById(id: number): Promise<SocialMedia | null> {
    try {
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching social media:', error);
      throw error;
    }
  }

  static async create(
    socialMedia: Omit<SocialMedia, 'id' | 'created_at' | 'updated_at'>,
    iconFile?: File
  ): Promise<SocialMedia> {
    try {
      const socialMediaData = { ...socialMedia };

      // Handle icon upload if provided
      if (iconFile) {
        socialMediaData.icon = await this.uploadIcon(iconFile);
      }

      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .insert({
          ...socialMediaData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating social media:', error);
      throw error;
    }
  }

  static async update(
    id: number,
    socialMedia: Partial<SocialMedia>,
    newIconFile?: File
  ): Promise<SocialMedia> {
    try {
      const updateData: Partial<SocialMedia> = {
        ...socialMedia,
        updated_at: new Date().toISOString()
      };

      // Handle icon update if provided
      if (newIconFile) {
        const oldSocialMedia = await this.getById(id);
        if (oldSocialMedia?.icon) {
          await this.deleteIcon(oldSocialMedia.icon);
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
      console.error('Error updating social media:', error);
      throw error;
    }
  }

  static async delete(id: number): Promise<void> {
    try {
      const socialMedia = await this.getById(id);
      if (!socialMedia) return;

      // Delete icon if exists
      if (socialMedia.icon) {
        await this.deleteIcon(socialMedia.icon);
      }

      const { error } = await supabase
        .from(this.TABLE_NAME)
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting social media:', error);
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
    
    // Handle fa icons (fontawesome)
    if (path.startsWith('fa') || path.startsWith('bi') || path.startsWith('icon-')) {
      return path;
    }
    
    // Handle direct URLs
    if (path.startsWith('http')) return path;
    
    // Handle storage paths
    const { data } = supabase.storage
      .from('public')
      .getPublicUrl(path);
    
    return data.publicUrl;
  }
}