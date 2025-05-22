import { createClient } from '@/src/utils/supabase/client';
import { ServiceProcess } from '@/src/models/ServiceModels';
import { saveFile, deleteFile } from '@/src/utils/server/FileStorage';  
import { ProcessActivityService } from '@/src/services/services/ProcessActivityServices';

const supabase = createClient();

export class ServiceProcessService {
  private static TABLE = 'service_processes';
  private static ACTIVITY_LINK_TABLE = 'service_process_activity_links'; // Junction table
  private static FOLDER = 'process-icons';         
  private static MAX_SIZE = 5 * 1024 * 1024;     

  // Mendapatkan semua service processes
  static async getAll(params?: {
    activityId?: number;
    isActive?: boolean;
    search?: string;
  }): Promise<ServiceProcess[]> {
    try {
      // Basic query untuk service processes
      let q = supabase
        .from(this.TABLE)
        .select('*')
        .order('order_no', { ascending: true });

      // Filter berdasarkan status aktif
      if (params?.isActive !== undefined) {
        q = q.eq('is_active', params.isActive);
      }

      // Filter berdasarkan pencarian
      if (params?.search) {
        q = q.or(
          `title->en.ilike.%${params.search}%,title->id.ilike.%${params.search}%,` +
            `description->en.ilike.%${params.search}%,description->id.ilike.%${params.search}%`
        );
      }

      // Dapatkan data services
      const { data: services, error } = await q;
      if (error) throw error;

      // Jika tidak ada filter activity, kembalikan semua services
      if (!params?.activityId) {
        return services ?? [];
      }

      // Jika ada filter activity, lakukan filter tambahan
      // Dapatkan semua link yang terhubung dengan activity tertentu
      const { data: links } = await supabase
        .from(this.ACTIVITY_LINK_TABLE)
        .select('service_process_id')
        .eq('process_activity_id', params.activityId);

      if (!links || links.length === 0) {
        return []; // Tidak ada service yang terhubung dengan activity ini
      }

      // Filter services berdasarkan links yang ditemukan
      const serviceIds = links.map(link => link.service_process_id);
      return services?.filter(service => serviceIds.includes(service.id)) ?? [];
    } catch (err) {
      console.error('Error fetching service processes:', err);
      throw err;
    }
  }

  // Mendapatkan service process berdasarkan ID
  static async getById(id: number): Promise<any> {
    try {
      // Ambil data service process
      const { data: process, error } = await supabase
        .from(this.TABLE)
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (!process) return null;

      // Ambil activities yang terkait
      const activities = await ProcessActivityService.getAll({ processId: id });
      
      // Kembalikan data process beserta activities
      return {
        ...process,
        activities
      };
    } catch (err) {
      console.error(`Error fetching service process with ID ${id}:`, err);
      throw err;
    }
  }

  // Membuat service process baru
  static async create(
    proc: Omit<ServiceProcess, 'id' | 'created_at' | 'updated_at' | 'order_no'> & {
      activityIds?: number[];
    },
    iconFile?: File
  ): Promise<ServiceProcess> {
    try {
      // Mendapatkan order_no tertinggi
      const { data: max } = await supabase
        .from(this.TABLE)
        .select('order_no')
        .order('order_no', { ascending: false })
        .limit(1)
        .single();
      const orderNo = (max?.order_no ?? 0) + 1;

      // Persiapkan payload
      const payload: any = { ...proc };
      delete payload.activityIds; // Hapus activityIds dari payload

      // Upload icon jika ada
      if (iconFile) {
        payload.icon = await this.uploadIcon(iconFile);
      } else if (proc.icon && !this.isValidIconClass(proc.icon)) {
        throw new Error('Invalid icon format');
      }

      // Insert service process
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from(this.TABLE)
        .insert({
          ...payload,
          order_no: orderNo,
          is_active: proc.is_active ?? true,
          created_at: now,
          updated_at: now,
        })
        .select()
        .single();
        
      if (error) throw error;

      // Tambahkan activity links jika ada
      if (proc.activityIds && proc.activityIds.length > 0 && data.id) {
        const links = proc.activityIds.map(activityId => ({
          service_process_id: data.id,
          process_activity_id: activityId
        }));

        const { error: linkError } = await supabase
          .from(this.ACTIVITY_LINK_TABLE)
          .insert(links);

        if (linkError) {
          console.error('Error creating activity links:', linkError);
          // Tidak throw error disini agar process tetap dibuat meskipun links gagal
        }
      }

      return data;
    } catch (err) {
      console.error('Error creating service process:', err);
      throw err;
    }
  }

  // Mengupdate service process
  static async update(
    id: number,
    proc: Partial<ServiceProcess> & {
      activityIds?: number[];
    },
    newIcon?: File
  ): Promise<ServiceProcess> {
    try {
      // Persiapkan data update
      const update: any = { ...proc, updated_at: new Date().toISOString() };
      delete update.activityIds; // Hapus activityIds dari data update

      // Handle icon
      if (newIcon) {
        const old = await this.getById(id);
        if (old?.icon && !this.isValidIconClass(old.icon)) {
          await this.deleteIcon(old.icon);
        }
        update.icon = await this.uploadIcon(newIcon);
      } else if (proc.icon && !this.isValidIconClass(proc.icon)) {
        throw new Error('Invalid icon format');
      }

      // Update service process
      const { data, error } = await supabase
        .from(this.TABLE)
        .update(update)
        .eq('id', id)
        .select()
        .single();
        
      if (error) throw error;

      // Update activity links jika ada
      if (proc.activityIds !== undefined) {
        // Hapus semua links yang ada
        const { error: deleteError } = await supabase
          .from(this.ACTIVITY_LINK_TABLE)
          .delete()
          .eq('service_process_id', id);
          
        if (deleteError) {
          console.error('Error deleting existing activity links:', deleteError);
        }

        // Insert links baru jika ada
        if (proc.activityIds.length > 0) {
          const links = proc.activityIds.map(activityId => ({
            service_process_id: id,
            process_activity_id: activityId
          }));

          const { error: insertError } = await supabase
            .from(this.ACTIVITY_LINK_TABLE)
            .insert(links);
            
          if (insertError) {
            console.error('Error creating new activity links:', insertError);
          }
        }
      }

      return data;
    } catch (err) {
      console.error('Error updating service process:', err);
      throw err;
    }
  }

  // Menghapus service process
  static async delete(id: number) {
    try {
      const proc = await this.getById(id);
      if (!proc) return;

      // Hapus icon jika ada
      if (proc.icon && !this.isValidIconClass(proc.icon)) {
        await this.deleteIcon(proc.icon);
      }

      // Hapus semua activity links
      const { error: linkError } = await supabase
        .from(this.ACTIVITY_LINK_TABLE)
        .delete()
        .eq('service_process_id', id);
        
      if (linkError) {
        console.error('Error deleting activity links:', linkError);
      }

      // Hapus service process
      const { error } = await supabase
        .from(this.TABLE)
        .delete()
        .eq('id', id);
        
      if (error) throw error;

      // Reorder processes
      await this.reorderAfterDelete(proc.order_no ?? 0);
    } catch (err) {
      console.error('Error deleting service process:', err);
      throw err;
    }
  }

  // Mengatur ulang urutan process
  static async reorder(newOrder: { id: number; order_no: number }[]) {
    const payload = newOrder.map((o) => ({
      id: o.id,
      order_no: o.order_no,
      updated_at: new Date().toISOString(),
    }));
    
    const { error } = await supabase
      .from(this.TABLE)
      .upsert(payload);
      
    if (error) throw error;
  }

  // Helper methods untuk reordering after delete
  private static async reorderAfterDelete(no: number) {
    const { error } = await supabase.rpc('reorder_processes_after_delete', {
      deleted_order_no: no,
    });
    
    if (error) throw error;
  }

  // Helper methods untuk icon validation & handling
  private static isValidIconClass(icon: string) {
    return /^(fa|bi|material-icons|icon-)/.test(icon);
  }

  private static async uploadIcon(file: File) {
    if (file.size > this.MAX_SIZE) throw new Error('File exceeds 5 MB');
    return saveFile(file, { folder: this.FOLDER });
  }

  private static async deleteIcon(path: string) {
    await deleteFile(path);
  }

  // Utility methods
  static getIconUrl(path: string) {
    if (this.isValidIconClass(path)) return path;
    return /^https?:\/\//i.test(path) ? path : path.startsWith('/') ? path : `/${path}`;
  }

  // Mendapatkan activity IDs dari service process
  static async getActivityIds(processId: number): Promise<number[]> {
    try {
      const { data, error } = await supabase
        .from(this.ACTIVITY_LINK_TABLE)
        .select('process_activity_id')
        .eq('service_process_id', processId);
        
      if (error) throw error;
      return data?.map(link => link.process_activity_id) ?? [];
    } catch (err) {
      console.error(`Error fetching activity IDs for process ${processId}:`, err);
      throw err;
    }
  }
}