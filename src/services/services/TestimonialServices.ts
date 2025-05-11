"use server";

import { createClient } from "@/src/utils/supabase/client";
import { Testimonial } from "@/src/models/ServiceModels";
import { saveFile, deleteFile } from '@/src/utils/server/FileStorage';

const supabase = createClient();

export class TestimonialService {
  private static TABLE_NAME = 'testimonials';
  private static STORAGE_BUCKET = 'testimonial-profiles';
  private static MAX_FILE_SIZE = 5 * 1024 * 1024; 

  static async getAll(params?: {
    search?: string;
    categoryId?: number;
    status?: 'draft' | 'published';
    rating?: number;
    sort?: 'rating' | 'name' | 'created_at' | 'star' | 'year';
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
          const sortField = params.sort === 'rating' ? 'star' : params.sort;
          query = query.order(sortField, { ascending: params.order === 'asc' });
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
          const sortField = params.sort === 'rating' ? 'star' : params.sort;
          query = query.order(sortField, { ascending: params.order === 'asc' });
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

    const update: any = { ...testimonial, updated_at: new Date().toISOString() };

    if (newProfileFile) {
      const old = await this.getById(id);
      if (old?.profile) await this.deleteProfile(old.profile);
      update.profile = await this.uploadProfile(newProfileFile);
    }

    const { data, error } = await supabase
      .from(this.TABLE_NAME)
      .update(update)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  static async delete(id: number) {
    const t = await this.getById(id);
    if (t?.profile) await this.deleteProfile(t.profile);

    const { error } = await supabase.from(this.TABLE_NAME).delete().eq('id', id);
    if (error) throw error;
  }

  private static async uploadProfile(file: File) {
    if (file.size > this.MAX_FILE_SIZE) throw new Error('File size exceeds 5 MB');
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