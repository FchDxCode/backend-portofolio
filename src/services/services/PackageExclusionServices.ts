import { createClient } from "@/src/utils/supabase/client";
import { PackageExclusion } from "@/src/models/ServiceModels";

const supabase = createClient();

export class PackageExclusionService {
  private static TABLE_NAME = 'package_exclusions';

  static async getAll(params?: {
    search?: string;
    sort?: 'created_at' | 'title';
    order?: 'asc' | 'desc';
  }): Promise<PackageExclusion[]> {
    try {
      let query = supabase
        .from(this.TABLE_NAME)
        .select('*');

      if (params?.search) {
        query = query.or(`title->en.ilike.%${params.search}%,title->id.ilike.%${params.search}%,slug.ilike.%${params.search}%`);
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
      console.error('Error fetching package exclusions:', error);
      throw error;
    }
  }

  static async getById(id: number): Promise<PackageExclusion | null> {
    try {
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching package exclusion:', error);
      throw error;
    }
  }

  static async create(
    exclusion: Omit<PackageExclusion, 'id' | 'created_at' | 'updated_at'>
  ): Promise<PackageExclusion> {
    try {
      const exclusionData = {
        ...exclusion,
        slug: exclusion.slug || this.generateSlug(exclusion.title?.en || '')
      };

      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .insert({
          ...exclusionData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating package exclusion:', error);
      throw error;
    }
  }

  static async update(
    id: number,
    exclusion: Partial<PackageExclusion>
  ): Promise<PackageExclusion> {
    try {
      const updateData: Partial<PackageExclusion> = {
        ...exclusion,
        updated_at: new Date().toISOString()
      };

      // Auto-generate slug only if title is updated but slug isn't provided
      if (exclusion.title?.en && !exclusion.slug) {
        updateData.slug = this.generateSlug(exclusion.title.en);
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
      console.error('Error updating package exclusion:', error);
      throw error;
    }
  }

  static async delete(id: number): Promise<void> {
    try {
      // Check if exclusion is being used in package_pricing
      const { count: pricingCount } = await supabase
        .from('package_pricing')
        .select('*', { count: 'exact' })
        .eq('exclusion_id', id);

      if (pricingCount && pricingCount > 0) {
        throw new Error('Cannot delete: This exclusion is being used in package pricing');
      }

      const { error } = await supabase
        .from(this.TABLE_NAME)
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting package exclusion:', error);
      throw error;
    }
  }

  static async bulkCreate(
    exclusions: Omit<PackageExclusion, 'id' | 'created_at' | 'updated_at'>[]
  ): Promise<PackageExclusion[]> {
    try {
      const exclusionsData = exclusions.map(exclusion => ({
        ...exclusion,
        slug: exclusion.slug || this.generateSlug(exclusion.title?.en || ''),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));

      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .insert(exclusionsData)
        .select();

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error bulk creating package exclusions:', error);
      throw error;
    }
  }

  static async bulkUpdate(
    updates: { id: number; data: Partial<PackageExclusion> }[]
  ): Promise<PackageExclusion[]> {
    try {
      const updatePromises = updates.map(({ id, data }) => 
        this.update(id, data)
      );

      const results = await Promise.all(updatePromises);
      return results;
    } catch (error) {
      console.error('Error bulk updating package exclusions:', error);
      throw error;
    }
  }

  static async bulkDelete(ids: number[]): Promise<void> {
    try {
      // Check if any exclusions are being used
      const { count: pricingCount } = await supabase
        .from('package_pricing')
        .select('*', { count: 'exact' })
        .eq('exclusion_id', ids);

      if (pricingCount && pricingCount > 0) {
        throw new Error('Cannot delete: Some exclusions are being used in package pricing');
      }

      const { error } = await supabase
        .from(this.TABLE_NAME)
        .delete()
        .in('id', ids);

      if (error) throw error;
    } catch (error) {
      console.error('Error bulk deleting package exclusions:', error);
      throw error;
    }
  }

  private static generateSlug(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }
}