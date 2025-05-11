import { createClient } from "@/src/utils/supabase/client";
import { ContactForm } from "@/src/models/ContactModels";

const supabase = createClient();

export class ContactFormService {
  private static TABLE_NAME = 'contact_forms';

  static async getAll(params?: {
    search?: string;
    sort?: 'created_at';
    order?: 'asc' | 'desc';
    page?: number;
    limit?: number;
  }): Promise<{ data: ContactForm[]; count: number }> {
    try {
      let query = supabase
        .from(this.TABLE_NAME)
        .select('*', { count: 'exact' });

      if (params?.search) {
        query = query.or(
          `name.ilike.%${params.search}%,email.ilike.%${params.search}%,subject.ilike.%${params.search}%`
        );
      }

      if (params?.sort) {
        query = query.order(params.sort, { ascending: params.order === 'asc' });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      if (params?.page && params?.limit) {
        const from = (params.page - 1) * params.limit;
        const to = from + params.limit - 1;
        query = query.range(from, to);
      }

      const { data, error, count } = await query;

      if (error) throw error;
      return { data: data || [], count: count || 0 };
    } catch (error) {
      console.error('Error fetching contact form submissions:', error);
      throw error;
    }
  }

  static async submit(form: Omit<ContactForm, 'id' | 'created_at' | 'updated_at'>): Promise<ContactForm> {
    try {
      // Validate required fields
      if (!form.name?.trim()) throw new Error('Name is required');
      if (!form.email?.trim()) throw new Error('Email is required');
      if (!form.message?.trim()) throw new Error('Message is required');

      // Validate email format
      if (!this.isValidEmail(form.email)) {
        throw new Error('Invalid email format');
      }

      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .insert({
          ...form,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error submitting contact form:', error);
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
      console.error('Error deleting contact form submission:', error);
      throw error;
    }
  }

  static async bulkDelete(ids: number[]): Promise<void> {
    try {
      const { error } = await supabase
        .from(this.TABLE_NAME)
        .delete()
        .in('id', ids);

      if (error) throw error;
    } catch (error) {
      console.error('Error bulk deleting contact form submissions:', error);
      throw error;
    }
  }

  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}