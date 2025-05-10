import { createClient } from "@/src/utils/supabase/client";
import { ServiceProcess } from "@/src/models/ServiceModels";

const supabase = createClient();

export class ServiceProcessService {
  private static TABLE_NAME = 'service_processes';
  private static STORAGE_BUCKET = 'process-icons';
  private static MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  static async getAll(params?: {
    benefitId?: number;
    isActive?: boolean;
    search?: string;
  }): Promise<ServiceProcess[]> {
    try {
      let query = supabase
        .from(this.TABLE_NAME)
        .select('*')
        .order('order_no', { ascending: true });

      if (params?.benefitId) {
        query = query.eq('benefit_id', params.benefitId);
      }

      if (params?.isActive !== undefined) {
        query = query.eq('is_active', params.isActive);
      }

      if (params?.search) {
        query = query.or(
          `title->en.ilike.%${params.search}%,title->id.ilike.%${params.search}%,` +
          `description->en.ilike.%${params.search}%,description->id.ilike.%${params.search}%`
        );
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching service processes:', error);
      throw error;
    }
  }

  static async getById(id: number): Promise<ServiceProcess | null> {
    try {
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .select(`
          *,
          service_benefits (id, title)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching service process:', error);
      throw error;
    }
  }

  static async create(
    process: Omit<ServiceProcess, 'id' | 'created_at' | 'updated_at' | 'order_no'>,
    iconFile?: File
  ): Promise<ServiceProcess> {
    try {
      // Get max order_no
      const { data: maxOrder } = await supabase
        .from(this.TABLE_NAME)
        .select('order_no')
        .order('order_no', { ascending: false })
        .limit(1)
        .single();

      const newOrderNo = (maxOrder?.order_no || 0) + 1;
      const processData = { ...process };

      if (iconFile) {
        processData.icon = await this.uploadIcon(iconFile);
      } else if (process.icon && !this.isValidIconClass(process.icon)) {
        throw new Error('Invalid icon format');
      }

      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .insert({
          ...processData,
          order_no: newOrderNo,
          is_active: process.is_active ?? true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating service process:', error);
      throw error;
    }
  }

  static async update(
    id: number,
    process: Partial<ServiceProcess>,
    newIconFile?: File
  ): Promise<ServiceProcess> {
    try {
      const updateData: Partial<ServiceProcess> = {
        ...process,
        updated_at: new Date().toISOString()
      };

      if (newIconFile) {
        const oldProcess = await this.getById(id);
        if (oldProcess?.icon && !this.isValidIconClass(oldProcess.icon)) {
          await this.deleteIcon(oldProcess.icon);
        }
        updateData.icon = await this.uploadIcon(newIconFile);
      } else if (process.icon && !this.isValidIconClass(process.icon)) {
        throw new Error('Invalid icon format');
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
      console.error('Error updating service process:', error);
      throw error;
    }
  }

  static async delete(id: number): Promise<void> {
    try {
      const process = await this.getById(id);
      if (!process) return;

      // Delete icon if exists and is not a class
      if (process.icon && !this.isValidIconClass(process.icon)) {
        await this.deleteIcon(process.icon);
      }

      // Delete process and reorder remaining items
      const { error } = await supabase
        .from(this.TABLE_NAME)
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Update order_no for remaining items
      await this.reorderAfterDelete(process.order_no ?? 0);
    } catch (error) {
      console.error('Error deleting service process:', error);
      throw error;
    }
  }

  static async reorder(newOrder: { id: number; order_no: number }[]): Promise<void> {
    try {
      const updates = newOrder.map(({ id, order_no }) => ({
        id,
        order_no,
        updated_at: new Date().toISOString()
      }));

      const { error } = await supabase
        .from(this.TABLE_NAME)
        .upsert(updates);

      if (error) throw error;
    } catch (error) {
      console.error('Error reordering processes:', error);
      throw error;
    }
  }

  private static async reorderAfterDelete(deletedOrderNo: number): Promise<void> {
    const { error } = await supabase.rpc('reorder_processes_after_delete', {
      deleted_order_no: deletedOrderNo
    });

    if (error) throw error;
  }

  private static isValidIconClass(icon: string): boolean {
    return /^(fa|bi|material-icons|icon-)/.test(icon);
  }

  private static async uploadIcon(file: File): Promise<string> {
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

  private static async deleteIcon(path: string): Promise<void> {
    const { error } = await supabase.storage
      .from('public')
      .remove([path]);

    if (error) throw error;
  }

  static getIconUrl(path: string): string {
    if (this.isValidIconClass(path)) return path;
    
    const { data } = supabase.storage
      .from('public')
      .getPublicUrl(path);
    
    return data.publicUrl;
  }

  static formatDuration(months: number): string {
    if (months >= 12 && months % 12 === 0) {
      const years = months / 12;
      return `${years} ${years === 1 ? 'year' : 'years'}`;
    }
    return `${months} ${months === 1 ? 'month' : 'months'}`;
  }
}