import { createClient } from "@/src/utils/supabase/client";
import { CallmeBannerItem } from "@/src/models/BannerModels";

const supabase = createClient();

export class CallmeBannerItemService {
  private static TABLE_NAME = 'callme_banner_items';

  static async getByBannerId(bannerId: number): Promise<CallmeBannerItem[]> {
    try {
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .select('*')
        .eq('banner_id', bannerId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching banner items:', error);
      throw error;
    }
  }

  static async create(item: Omit<CallmeBannerItem, 'id' | 'created_at' | 'updated_at'>): Promise<CallmeBannerItem> {
    try {
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .insert({
          ...item,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating banner item:', error);
      throw error;
    }
  }

  static async update(id: number, item: Partial<CallmeBannerItem>): Promise<CallmeBannerItem> {
    try {
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .update({
          ...item,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating banner item:', error);
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
      console.error('Error deleting banner item:', error);
      throw error;
    }
  }

  static async bulkCreate(bannerId: number, items: Omit<CallmeBannerItem, 'id' | 'created_at' | 'updated_at' | 'banner_id'>[]): Promise<CallmeBannerItem[]> {
    try {
      const itemsToCreate = items.map(item => ({
        ...item,
        banner_id: bannerId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));

      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .insert(itemsToCreate)
        .select();

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error bulk creating banner items:', error);
      throw error;
    }
  }

  static async bulkUpdate(items: { id: number; data: Partial<CallmeBannerItem> }[]): Promise<CallmeBannerItem[]> {
    try {
      const updates = items.map(async ({ id, data }) => {
        return this.update(id, data);
      });

      return await Promise.all(updates);
    } catch (error) {
      console.error('Error bulk updating banner items:', error);
      throw error;
    }
  }
}