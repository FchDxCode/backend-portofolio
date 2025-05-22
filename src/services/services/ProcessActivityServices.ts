import { createClient } from '@/src/utils/supabase/client';
import { ProcessActivity } from '@/src/models/ServiceModels';

const supabase = createClient();

export class ProcessActivityService {
  private static TABLE = 'process_activities';
  private static LINK_TABLE = 'service_process_activity_links';

  // Mendapatkan semua activities
  static async getAll(params?: {
    search?: string;
    processId?: number;
  }): Promise<ProcessActivity[]> {
    try {
      let q = supabase
        .from(this.TABLE)
        .select('*')
        .order('created_at', { ascending: false });

      // Filter berdasarkan search
      if (params?.search) {
        q = q.or(
          `title->en.ilike.%${params.search}%,title->id.ilike.%${params.search}%`
        );
      }

      const { data, error } = await q;
      if (error) throw error;

      // Jika tidak ada filter processId, kembalikan semua activities
      if (!params?.processId) {
        return data ?? [];
      }

      // Jika ada filter processId, filter berdasarkan links
      const { data: links } = await supabase
        .from(this.LINK_TABLE)
        .select('process_activity_id')
        .eq('service_process_id', params.processId);

      if (!links || links.length === 0) {
        return []; // Tidak ada activities yang terhubung dengan process ini
      }

      // Filter activities berdasarkan links
      const activityIds = links.map(link => link.process_activity_id);
      return data?.filter(activity => activityIds.includes(activity.id)) ?? [];
    } catch (err) {
      console.error('Error fetching process activities:', err);
      throw err;
    }
  }

  // Mendapatkan activity berdasarkan ID
  static async getById(id: number): Promise<ProcessActivity | null> {
    try {
      const { data, error } = await supabase
        .from(this.TABLE)
        .select('*')
        .eq('id', id)
        .single();
        
      if (error) throw error;
      return data;
    } catch (err) {
      console.error(`Error fetching process activity with ID ${id}:`, err);
      throw err;
    }
  }

  // Membuat activity baru
  static async create(
    activity: Omit<ProcessActivity, 'id' | 'created_at' | 'updated_at'>
  ): Promise<ProcessActivity> {
    try {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from(this.TABLE)
        .insert({
          ...activity,
          created_at: now,
          updated_at: now,
        })
        .select()
        .single();
        
      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error creating process activity:', err);
      throw err;
    }
  }

  // Mengupdate activity
  static async update(
    id: number,
    activity: Partial<ProcessActivity>
  ): Promise<ProcessActivity> {
    try {
      const { data, error } = await supabase
        .from(this.TABLE)
        .update({
          ...activity,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    } catch (err) {
      console.error(`Error updating process activity with ID ${id}:`, err);
      throw err;
    }
  }

  // Menghapus activity
  static async delete(id: number) {
    try {
      // Hapus semua links yang terhubung dengan activity ini
      const { error: linkError } = await supabase
        .from(this.LINK_TABLE)
        .delete()
        .eq('process_activity_id', id);
        
      if (linkError) {
        console.error('Error deleting activity links:', linkError);
      }

      // Hapus activity
      const { error } = await supabase
        .from(this.TABLE)
        .delete()
        .eq('id', id);
        
      if (error) throw error;
    } catch (err) {
      console.error(`Error deleting process activity with ID ${id}:`, err);
      throw err;
    }
  }

  // Mendapatkan semua service process yang terkait dengan activity tertentu
  static async getRelatedProcessIds(activityId: number): Promise<number[]> {
    try {
      const { data, error } = await supabase
        .from(this.LINK_TABLE)
        .select('service_process_id')
        .eq('process_activity_id', activityId);
        
      if (error) throw error;
      return data?.map(link => link.service_process_id) ?? [];
    } catch (err) {
      console.error(`Error fetching related processes for activity ${activityId}:`, err);
      throw err;
    }
  }
}