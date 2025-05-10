import { createClient } from "@/src/utils/supabase/client";
import { ServiceBenefit } from "@/src/models/ServiceModels";

const supabase = createClient();

export class ServiceBenefitService {
  private static TABLE_NAME = 'service_benefits';

  /**
   * Get all service benefits with optional search and sorting
   */
  static async getAll(params?: {
    search?: string;
    sort?: 'created_at' | 'title';
    order?: 'asc' | 'desc';
  }): Promise<ServiceBenefit[]> {
    try {
      let query = supabase
        .from(this.TABLE_NAME)
        .select('*');

      if (params?.search) {
        query = query.or(`title->en.ilike.%${params.search}%,title->id.ilike.%${params.search}%`);
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
      console.error('Error fetching service benefits:', error);
      throw error;
    }
  }

  static async getById(id: number): Promise<ServiceBenefit | null> {
    try {
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching service benefit:', error);
      throw error;
    }
  }

  static async create(benefit: Omit<ServiceBenefit, 'id' | 'created_at' | 'updated_at'>): Promise<ServiceBenefit> {
    try {
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .insert({
          ...benefit,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating service benefit:', error);
      throw error;
    }
  }

  static async update(id: number, benefit: Partial<ServiceBenefit>): Promise<ServiceBenefit> {
    try {
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .update({
          ...benefit,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating service benefit:', error);
      throw error;
    }
  }

  static async delete(id: number): Promise<void> {
    try {
      // Check if benefit is being used in other tables
      const { count: featuredServiceCount } = await supabase
        .from('featured_services')
        .select('*', { count: 'exact' })
        .eq('benefit_id', id);

      const { count: serviceProcessCount } = await supabase
        .from('service_processes')
        .select('*', { count: 'exact' })
        .eq('benefit_id', id);

      if (featuredServiceCount && featuredServiceCount > 0 || serviceProcessCount && serviceProcessCount > 0) {
        throw new Error('Cannot delete: This benefit is being used by other services');
      }

      const { error } = await supabase
        .from(this.TABLE_NAME)
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting service benefit:', error);
      throw error;
    }
  }
}