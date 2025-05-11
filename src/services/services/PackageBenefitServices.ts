import { createClient } from "@/src/utils/supabase/client";
import { PackageBenefit } from "@/src/models/ServiceModels";

const supabase = createClient();

export class PackageBenefitService {
  private static TABLE_NAME = 'package_benefits';

  static async getAll(params?: {
    search?: string;
    sort?: 'created_at' | 'title';
    order?: 'asc' | 'desc';
  }): Promise<PackageBenefit[]> {
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
      console.error('Error fetching package benefits:', error);
      throw error;
    }
  }

  static async getById(id: number): Promise<PackageBenefit | null> {
    try {
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching package benefit:', error);
      throw error;
    }
  }

  static async create(
    benefit: Omit<PackageBenefit, 'id' | 'created_at' | 'updated_at'>
  ): Promise<PackageBenefit> {
    try {
      const benefitData = {
        ...benefit,
        slug: benefit.slug || this.generateSlug(benefit.title?.en || '')
      };

      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .insert({
          ...benefitData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating package benefit:', error);
      throw error;
    }
  }

  static async update(
    id: number,
    benefit: Partial<PackageBenefit>
  ): Promise<PackageBenefit> {
    try {
      const updateData: Partial<PackageBenefit> = {
        ...benefit,
        updated_at: new Date().toISOString()
      };

      if (benefit.title?.en && !benefit.slug) {
        updateData.slug = this.generateSlug(benefit.title.en);
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
      console.error('Error updating package benefit:', error);
      throw error;
    }
  }

  static async delete(id: number): Promise<void> {
    try {
      const { count: pricingCount } = await supabase
        .from('package_pricing')
        .select('*', { count: 'exact' })
        .eq('benefit_id', id);

      if (pricingCount && pricingCount > 0) {
        throw new Error('Cannot delete: This benefit is being used in package pricing');
      }

      const { error } = await supabase
        .from(this.TABLE_NAME)
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting package benefit:', error);
      throw error;
    }
  }

  static async bulkCreate(
    benefits: Omit<PackageBenefit, 'id' | 'created_at' | 'updated_at'>[]
  ): Promise<PackageBenefit[]> {
    try {
      const benefitsData = benefits.map(benefit => ({
        ...benefit,
        slug: benefit.slug || this.generateSlug(benefit.title?.en || ''),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));

      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .insert(benefitsData)
        .select();

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error bulk creating package benefits:', error);
      throw error;
    }
  }

  static async bulkUpdate(
    updates: { id: number; data: Partial<PackageBenefit> }[]
  ): Promise<PackageBenefit[]> {
    try {
      const updatePromises = updates.map(({ id, data }) => 
        this.update(id, data)
      );

      const results = await Promise.all(updatePromises);
      return results;
    } catch (error) {
      console.error('Error bulk updating package benefits:', error);
      throw error;
    }
  }

  static async bulkDelete(ids: number[]): Promise<void> {
    try {
      const { count: pricingCount } = await supabase
        .from('package_pricing')
        .select('*', { count: 'exact' })
        .in('benefit_id', ids);

      if (pricingCount && pricingCount > 0) {
        throw new Error('Cannot delete: Some benefits are being used in package pricing');
      }

      const { error } = await supabase
        .from(this.TABLE_NAME)
        .delete()
        .in('id', ids);

      if (error) throw error;
    } catch (error) {
      console.error('Error bulk deleting package benefits:', error);
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