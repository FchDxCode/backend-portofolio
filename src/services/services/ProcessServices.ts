'use server';

import { createClient } from '@/src/utils/supabase/client';
import { ServiceProcess } from '@/src/models/ServiceModels';
import { saveFile, deleteFile } from '@/src/utils/server/FileStorage';  

const supabase = createClient();

export class ServiceProcessService {
  private static TABLE = 'service_processes';
  private static FOLDER = 'process-icons';         
  private static MAX_SIZE = 5 * 1024 * 1024;     

  static async getAll(params?: {
    benefitId?: number;
    isActive?: boolean;
    search?: string;
  }): Promise<ServiceProcess[]> {
    try {
      let q = supabase
        .from(this.TABLE)
        .select('*')
        .order('order_no', { ascending: true });

      if (params?.benefitId) q = q.eq('benefit_id', params.benefitId);
      if (params?.isActive !== undefined) q = q.eq('is_active', params.isActive);

      if (params?.search)
        q = q.or(
          `title->en.ilike.%${params.search}%,title->id.ilike.%${params.search}%,` +
            `description->en.ilike.%${params.search}%,description->id.ilike.%${params.search}%`
        );

      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    } catch (err) {
      console.error('Error fetching service processes:', err);
      throw err;
    }
  }

  static async getById(id: number): Promise<ServiceProcess | null> {
    const { data, error } = await supabase
      .from(this.TABLE)
      .select(
        `
        *,
        service_benefits(id,title)
      `
      )
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  }

  static async create(
    proc: Omit<ServiceProcess, 'id' | 'created_at' | 'updated_at' | 'order_no'>,
    iconFile?: File
  ): Promise<ServiceProcess> {
    try {
      const { data: max } = await supabase
        .from(this.TABLE)
        .select('order_no')
        .order('order_no', { ascending: false })
        .limit(1)
        .single();
      const orderNo = (max?.order_no ?? 0) + 1;

      const payload: any = { ...proc };

      if (iconFile) {
        payload.icon = await this.uploadIcon(iconFile);
      } else if (proc.icon && !this.isValidIconClass(proc.icon)) {
        throw new Error('Invalid icon format');
      }

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
      return data;
    } catch (err) {
      console.error('Error creating service process:', err);
      throw err;
    }
  }

  static async update(
    id: number,
    proc: Partial<ServiceProcess>,
    newIcon?: File
  ): Promise<ServiceProcess> {
    try {
      const update: any = { ...proc, updated_at: new Date().toISOString() };

      if (newIcon) {
        const old = await this.getById(id);
        if (old?.icon && !this.isValidIconClass(old.icon))
          await this.deleteIcon(old.icon);
        update.icon = await this.uploadIcon(newIcon);
      } else if (proc.icon && !this.isValidIconClass(proc.icon)) {
        throw new Error('Invalid icon format');
      }

      const { data, error } = await supabase
        .from(this.TABLE)
        .update(update)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error updating service process:', err);
      throw err;
    }
  }

  static async delete(id: number) {
    try {
      const proc = await this.getById(id);
      if (!proc) return;

      if (proc.icon && !this.isValidIconClass(proc.icon))
        await this.deleteIcon(proc.icon);

      const { error } = await supabase.from(this.TABLE).delete().eq('id', id);
      if (error) throw error;

      await this.reorderAfterDelete(proc.order_no ?? 0);
    } catch (err) {
      console.error('Error deleting service process:', err);
      throw err;
    }
  }

  static async reorder(newOrder: { id: number; order_no: number }[]) {
    const payload = newOrder.map((o) => ({
      id: o.id,
      order_no: o.order_no,
      updated_at: new Date().toISOString(),
    }));
    const { error } = await supabase.from(this.TABLE).upsert(payload);
    if (error) throw error;
  }

  private static async reorderAfterDelete(no: number) {
    const { error } = await supabase.rpc('reorder_processes_after_delete', {
      deleted_order_no: no,
    });
    if (error) throw error;
  }

  private static isValidIconClass(icon: string) {
    return /^(fa|bi|material-icons|icon-)/.test(icon);
  }

  private static async uploadIcon(file: File) {
    if (file.size > this.MAX_SIZE) throw new Error('File exceeds 5 MB');
    return saveFile(file, { folder: this.FOLDER });
  }

  private static async deleteIcon(path: string) {
    await deleteFile(path);
  }

  static getIconUrl(path: string) {
    if (this.isValidIconClass(path)) return path;
    return /^https?:\/\//i.test(path) ? path : path.startsWith('/') ? path : `/${path}`;
  }

  static formatDuration(months: number) {
    if (months >= 12 && months % 12 === 0) {
      const years = months / 12;
      return `${years} ${years === 1 ? 'year' : 'years'}`;
    }
    return `${months} ${months === 1 ? 'month' : 'months'}`;
  }
}
