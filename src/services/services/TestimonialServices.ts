import { createClient } from "@/src/utils/supabase/client";
import { Testimonial, TestimonialCategory } from "@/src/models/ServiceModels";
import { saveFile, deleteFile } from "@/src/utils/server/FileStorage";

const supabase = createClient();

export class TestimonialService {
  private static TABLE_NAME = 'testimonials';
  private static STORAGE_BUCKET = 'testimonial-profiles';
  private static MAX_FILE_SIZE = 5 * 1024 * 1024; 

  static async getAll(params?: {
    search?: string;
    categoryId?: number;
    status?: 'draft' | 'published';
    star?: number;
    sort?: 'star' | 'name' | 'created_at';
    order?: 'asc' | 'desc';
    withCategory?: boolean;
  }): Promise<Testimonial[]> {
    try {
      // pilih fields
      const selectStr = params?.withCategory
        ? '*, testimonial_categories(id, title)'
        : '*';

      let query = supabase
        .from(this.TABLE_NAME)
        .select(selectStr);

      // full-text search across beberapa JSON/text field
      if (params?.search) {
        const term = `%${params.search}%`;
        const filters = [
          `name.ilike.${term}`,
          `job->en.ilike.${term}`,
          `job->id.ilike.${term}`,
          `message->en.ilike.${term}`,
          `message->id.ilike.${term}`,
          `project->name.ilike.${term}`,
          `industry->name.ilike.${term}`,
        ].join(',');
        query = query.or(filters);
      }

      // filter kategori
      if (params?.categoryId) {
        query = query.eq('testimonial_category_id', params.categoryId);
      }

      // filter rating
      if (params?.star) {
        query = query.eq('star', params.star);
      }

      // filter status
      if (params?.status) {
        query = query.eq('status', params.status);
      }

      // sorting
      if (params?.sort) {
        query = query.order(params.sort, {
          ascending: params.order === 'asc',
        });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as unknown as Testimonial[];
    } catch (error) {
      console.error('Error fetching testimonials:', error);
      throw error;
    }
  }

  /**
   * Ambil satu testimonial by ID.
   * Jika withCategory=true, include kategori sekaligus.
   */
  static async getById(
    id: number,
    withCategory = false
  ): Promise<Testimonial | null> {
    try {
      const selectStr = withCategory
        ? '*, testimonial_categories(id, title)'
        : '*';

      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .select(selectStr)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as unknown as Testimonial | null;
    } catch (error) {
      console.error('Error fetching testimonial by ID:', error);
      throw error;
    }
  }

  static async create(
    testimonial: Omit<Testimonial, 'id' | 'created_at' | 'updated_at'>,
    profileFile?: File
  ): Promise<Testimonial> {
    if (
      testimonial.star !== undefined &&
      (testimonial.star < 1 || testimonial.star > 5)
    ) {
      throw new Error('Star rating must be between 1 and 5');
    }

    const payload: any = { ...testimonial };
    if (profileFile) payload.profile = await this.uploadProfile(profileFile);

    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from(this.TABLE_NAME)
      .insert({ ...payload, created_at: now, updated_at: now })
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  static async update(
    id: number,
    testimonial: Partial<Testimonial>,
    newProfileFile?: File
  ): Promise<Testimonial> {
    if (
      testimonial.star !== undefined &&
      (testimonial.star < 1 || testimonial.star > 5)
    ) {
      throw new Error('Star rating must be between 1 and 5');
    }

    const updatePayload: any = {
      ...testimonial,
      updated_at: new Date().toISOString(),
    };

    if (newProfileFile) {
      const old = await this.getById(id);
      if (old?.profile) await this.deleteProfile(old.profile);
      updatePayload.profile = await this.uploadProfile(newProfileFile);
    }

    const { data, error } = await supabase
      .from(this.TABLE_NAME)
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  static async delete(id: number) {
    const t = await this.getById(id);
    if (t?.profile) await this.deleteProfile(t.profile);
    const { error } = await supabase
      .from(this.TABLE_NAME)
      .delete()
      .eq('id', id);
    if (error) throw error;
  }

  private static async uploadProfile(file: File) {
    if (file.size > this.MAX_FILE_SIZE)
      throw new Error('File size exceeds 5 MB');
    return saveFile(file, { folder: this.STORAGE_BUCKET });
  }

  private static async deleteProfile(path: string) {
    if (!path || path.startsWith('http')) return;
    await deleteFile(path);
  }

  static getProfileUrl(path: string) {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return path.startsWith('/') ? path : `/${path}`;
  }

  static formatStars(stars = 0) {
    return '⭐'.repeat(Math.min(Math.max(stars, 0), 5));
  }

  static getLocalizedText(
    field: Record<string, any> | string | undefined,
    locale: string = 'en'
  ): string {
    if (!field) return '';
    if (typeof field === 'string') return field;
    return (
      field[locale] ||
      field.en ||
      field.id ||
      Object.values(field)[0] ||
      ''
    );
  }

  static getProjectName(project: Record<string, any> | undefined): string {
    if (!project) return '';
    return project.name || project.title || '';
  }

  static getIndustryName(industry: Record<string, any> | undefined): string {
    if (!industry) return '';
    return industry.name || industry.title || '';
  }
}
