import { createClient } from "@/src/utils/supabase/client";
import { Testimonial } from "@/src/models/ServiceModels";

const supabase = createClient();

export class TestimonialService {
  private static TABLE_NAME = 'testimonials';
  private static STORAGE_BUCKET = 'testimonial-profiles';
  private static MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  static async getAll(params?: {
    search?: string;
    categoryId?: number;
    status?: 'draft' | 'published';
    rating?: number;
    sort?: 'rating' | 'created_at' | 'name';
    order?: 'asc' | 'desc';
    withCategory?: boolean;
    year?: number;
    star?: number;
  }): Promise<Testimonial[]> {
    try {
      if (params?.withCategory) {
        let query = supabase
          .from(this.TABLE_NAME)
          .select('*');
        
        if (params?.search) {
          query = query.or(`
            name.ilike.%${params.search}%,
            company.ilike.%${params.search}%,
            review->en.ilike.%${params.search}%,
            review->id.ilike.%${params.search}%
          `);
        }

        if (params?.categoryId) {
          query = query.eq('testimonial_category_id', params.categoryId);
        }

        if (params?.status) {
          query = query.eq('status', params.status);
        }

        if (params?.rating) {
          query = query.eq('rating', params.rating);
        }

        if (params?.year) {
          query = query.eq('year', params.year);
        }

        if (params?.star) {
          query = query.eq('star', params.star);
        }

        if (params?.sort) {
          query = query.order(params.sort, { ascending: params.order === 'asc' });
        } else {
          query = query.order('created_at', { ascending: false });
        }

        const { data, error } = await query;
        if (error) throw error;
        
        if (!data || data.length === 0) {
          return [];
        }
        
        const categoryIds = Array.from(new Set(
          data
            .filter(item => item.testimonial_category_id)
            .map(item => item.testimonial_category_id)
        ));
        
        let categories: Record<number, any> = {};
        if (categoryIds.length > 0) {
          const { data: categoryData } = await supabase
            .from('testimonial_categories')
            .select('id,title')
            .in('id', categoryIds);
            
          if (categoryData) {
            categories = categoryData.reduce((acc, cat) => {
              acc[cat.id] = cat;
              return acc;
            }, {} as Record<number, any>);
          }
        }
        
        return data.map(item => ({
          ...item,
          testimonial_categories: item.testimonial_category_id ? 
            categories[item.testimonial_category_id] : null
        }));
      } else {
        let query = supabase
          .from(this.TABLE_NAME)
          .select('*');
          
        if (params?.search) {
          query = query.or(`
            name.ilike.%${params.search}%,
            company.ilike.%${params.search}%,
            review->en.ilike.%${params.search}%,
            review->id.ilike.%${params.search}%
          `);
        }

        if (params?.categoryId) {
          query = query.eq('testimonial_category_id', params.categoryId);
        }

        if (params?.status) {
          query = query.eq('status', params.status);
        }

        if (params?.rating) {
          query = query.eq('rating', params.rating);
        }

        if (params?.year) {
          query = query.eq('year', params.year);
        }

        if (params?.star) {
          query = query.eq('star', params.star);
        }

        if (params?.sort) {
          query = query.order(params.sort, { ascending: params.order === 'asc' });
        } else {
          query = query.order('created_at', { ascending: false });
        }
        
        const { data, error } = await query;
        if (error) throw error;
        return data || [];
      }
    } catch (error) {
      console.error('Error fetching testimonials:', error);
      throw error;
    }
  }

  static async getById(id: number, withCategory = false): Promise<Testimonial | null> {
    try {
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (!data) return null;
      
      if (!withCategory || !data.testimonial_category_id) {
        return data;
      }
      
      const { data: category, error: categoryError } = await supabase
        .from('testimonial_categories')
        .select('id,title')
        .eq('id', data.testimonial_category_id)
        .single();
      
      if (categoryError) {
        console.warn('Error fetching category:', categoryError);
        return data;
      }
      
      return {
        ...data,
        testimonial_categories: category
      };
    } catch (error) {
      console.error('Error fetching testimonial:', error);
      throw error;
    }
  }

  static async create(
    testimonial: Omit<Testimonial, 'id' | 'created_at' | 'updated_at'>,
    profileFile?: File
  ): Promise<Testimonial> {
    try {
      if (testimonial.star !== undefined && (testimonial.star < 1 || testimonial.star > 5)) {
        throw new Error('Star rating must be between 1 and 5');
      }

      const testimonialData = { ...testimonial };

      if (profileFile) {
        testimonialData.profile = await this.uploadProfile(profileFile);
      }

      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .insert({
          ...testimonialData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating testimonial:', error);
      throw error;
    }
  }

  static async update(
    id: number,
    testimonial: Partial<Testimonial>,
    newProfileFile?: File
  ): Promise<Testimonial> {
    try {
      if (testimonial.star !== undefined && (testimonial.star < 1 || testimonial.star > 5)) {
        throw new Error('Star rating must be between 1 and 5');
      }

      const updateData: Partial<Testimonial> = {
        ...testimonial,
        updated_at: new Date().toISOString()
      };

      if (newProfileFile) {
        const oldTestimonial = await this.getById(id);
        if (oldTestimonial?.profile) {
          await this.deleteProfile(oldTestimonial.profile);
        }
        updateData.profile = await this.uploadProfile(newProfileFile);
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
      console.error('Error updating testimonial:', error);
      throw error;
    }
  }

  static async delete(id: number): Promise<void> {
    try {
      const testimonial = await this.getById(id);
      if (!testimonial) return;

      if (testimonial.profile) {
        await this.deleteProfile(testimonial.profile);
      }

      const { error } = await supabase
        .from(this.TABLE_NAME)
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting testimonial:', error);
      throw error;
    }
  }

  private static async uploadProfile(file: File): Promise<string> {
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

  private static async deleteProfile(path: string): Promise<void> {
    if (!path.startsWith('http')) {
      const { error } = await supabase.storage
        .from('public')
        .remove([path]);

      if (error) throw error;
    }
  }

  static getProfileUrl(path: string): string {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    
    const { data } = supabase.storage
      .from('public')
      .getPublicUrl(path);
    
    return data.publicUrl;
  }

  static formatStars(stars: number = 0): string {
    return '⭐'.repeat(Math.min(Math.max(stars, 0), 5));
  }

  static async getUniqueIndustries(): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .select('industry')
        .not('industry', 'is', null);

      if (error) throw error;
      
      const industries = data
        .map(item => item.industry)
        .filter((value, index, self) => self.indexOf(value) === index);
        
      return industries;
    } catch (error) {
      console.error('Error fetching unique industries:', error);
      throw error;
    }
  }

  static async getUniqueYears(): Promise<number[]> {
    try {
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .select('year')
        .not('year', 'is', null);

      if (error) throw error;
      
      const years = data
        .map(item => item.year)
        .filter((value, index, self) => self.indexOf(value) === index)
        .sort((a, b) => b - a);
        
      return years;
    } catch (error) {
      console.error('Error fetching unique years:', error);
      throw error;
    }
  }
}