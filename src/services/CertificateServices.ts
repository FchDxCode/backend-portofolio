'use server';

import { createClient } from '@/src/utils/supabase/client';
import { Certificate } from '@/src/models/CertificateModels';
import {
  saveFile,
  deleteFile,
} from '@/src/utils/server/FileStorage'; 

const supabase = createClient();

export class CertificateService {
  private static TABLE = 'certificates';
  private static FOLDER = 'certificates';

  static async getById(id: number): Promise<Certificate | null> {
    const { data, error } = await supabase
      .from(this.TABLE)
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  }

  static async getAll(params?: {
    skillId?: number;
    isValid?: boolean;
    issuedDateStart?: string;
    issuedDateEnd?: string;
    sort?: 'issued_date' | 'valid_until' | 'created_at';
    order?: 'asc' | 'desc';
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: Certificate[]; count: number }> {
    try {
      let q = supabase.from(this.TABLE).select('*', { count: 'exact' });

      if (params?.skillId) q = q.eq('skill_id', params.skillId);

      if (params?.isValid !== undefined) {
        const now = new Date().toISOString();
        q = params.isValid ? q.gt('valid_until', now) : q.lte('valid_until', now);
      }

      if (params?.issuedDateStart) q = q.gte('issued_date', params.issuedDateStart);
      if (params?.issuedDateEnd) q = q.lte('issued_date', params.issuedDateEnd);

      if (params?.search) {
        q = q.or(
          `title->en.ilike.%${params.search}%,title->id.ilike.%${params.search}%,issued_by.ilike.%${params.search}%`
        );
      }

      q = q.order(params?.sort ?? 'created_at', {
        ascending: params?.order === 'asc',
      });

      if (params?.page && params?.limit) {
        const from = (params.page - 1) * params.limit;
        q = q.range(from, from + params.limit - 1);
      }

      const { data, error, count } = await q;
      if (error) throw error;
      return { data: data ?? [], count: count ?? 0 };
    } catch (err) {
      console.error('Error fetching certificates:', err);
      throw err;
    }
  }

  static async create(
    cert: Omit<Certificate, 'id' | 'created_at' | 'updated_at'>
  ): Promise<Certificate> {
    if (
      cert.issued_date &&
      cert.valid_until &&
      new Date(cert.issued_date) >= new Date(cert.valid_until)
    ) {
      throw new Error('Issue date must be before valid‑until date');
    }

    const { data, error } = await supabase
      .from(this.TABLE)
      .insert({
        ...cert,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  static async update(id: number, cert: Partial<Certificate>): Promise<Certificate> {
    if (
      cert.issued_date &&
      cert.valid_until &&
      new Date(cert.issued_date) >= new Date(cert.valid_until)
    ) {
      throw new Error('Issue date must be before valid‑until date');
    }

    const { data, error } = await supabase
      .from(this.TABLE)
      .update({ ...cert, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  static async uploadFiles(
    id: number,
    files: { pdf?: File; image?: File }
  ): Promise<Certificate> {
    try {
      const current = await this.getById(id);
      if (!current) throw new Error('Certificate not found');

      const folder = `${this.FOLDER}/${id}`;
      const updates: Partial<Certificate> = {};

      if (files.pdf) {
        updates.pdf = await saveFile(files.pdf, {
          folder,
          deletePrev: current.pdf ?? null,
        });
      }

      if (files.image) {
        updates.image = await saveFile(files.image, {
          folder,
          deletePrev: current.image ?? null,
        });
      }

      return this.update(id, updates);
    } catch (err) {
      console.error('Error uploading certificate files:', err);
      throw err;
    }
  }

  static async deleteFiles(id: number, type: 'pdf' | 'image' | 'both') {
    const cert = await this.getById(id);
    if (!cert) throw new Error('Certificate not found');

    const toDel: string[] = [];
    if ((type === 'pdf' || type === 'both') && cert.pdf) toDel.push(cert.pdf);
    if ((type === 'image' || type === 'both') && cert.image) toDel.push(cert.image);

    await Promise.all(toDel.map(deleteFile));

    const updates: Partial<Certificate> = {};
    if (type === 'pdf' || type === 'both') updates.pdf = undefined;
    if (type === 'image' || type === 'both') updates.image = undefined;

    await this.update(id, updates);
  }

  static async delete(id: number) {
    const cert = await this.getById(id);
    if (!cert) throw new Error('Certificate not found');

    await this.deleteFiles(id, 'both');

    const { error } = await supabase.from(this.TABLE).delete().eq('id', id);
    if (error) throw error;
  }

  static isValid(cert: Certificate) {
    return !cert.valid_until || new Date(cert.valid_until) > new Date();
  }

  static async getBySkill(skillId: number): Promise<Certificate[]> {
    const { data, error } = await supabase
      .from(this.TABLE)
      .select('*')
      .eq('skill_id', skillId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data ?? [];
  }
}
