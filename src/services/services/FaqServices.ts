import { createClient } from "@/src/utils/supabase/client";
import { Faq } from "@/src/models/ServiceModels";

const supabase = createClient();

export class FaqService {
  private static TABLE_NAME = 'faqs';

  static async getAll(params?: {
    search?: string;
    sort?: 'created_at';
    order?: 'asc' | 'desc';
  }): Promise<Faq[]> {
    try {
      let query = supabase
        .from(this.TABLE_NAME)
        .select('*');

      if (params?.search) {
        query = query.or(`
          title->en.ilike.%${params.search}%,
          title->id.ilike.%${params.search}%,
          description->en.ilike.%${params.search}%,
          description->id.ilike.%${params.search}%
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
      console.error('Error fetching FAQs:', error);
      throw error;
    }
  }

  static async getById(id: number): Promise<Faq | null> {
    try {
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching FAQ:', error);
      throw error;
    }
  }

  static async create(faq: Omit<Faq, 'id' | 'created_at' | 'updated_at'>): Promise<Faq> {
    try {
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .insert({
          ...faq,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating FAQ:', error);
      throw error;
    }
  }

  static async update(id: number, faq: Partial<Faq>): Promise<Faq> {
    try {
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .update({
          ...faq,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating FAQ:', error);
      throw error;
    }
  }

  static async delete(id: number): Promise<void> {
    try {
      const { error } = await supabase
        .from(this.TABLE_NAME)
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting FAQ:', error);
      throw error;
    }
  }
}