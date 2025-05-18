/* =========================================
 *  services/CertificateService.ts
 * ======================================= */

import { createClient } from '@/src/utils/supabase/client';
import {
  Certificate,
  CertificateSkillRelation,
} from '@/src/models/CertificateModels';
import { saveFile, deleteFile } from '@/src/utils/server/FileStorage';

const supabase = createClient();

export class CertificateService {
  private static TABLE = 'certificates';
  private static RELATION_TABLE = 'certificates_skills';
  private static FOLDER = 'certificates';

  /* ----------  helpers  ---------- */

  /** Rapi-kan result Supabase (nested) → objek Certificate dengan `skills:number[]`  */
  private static mapNested(row: any): Certificate {
    const skills: number[] =
      row.certificates_skills?.map(
        (r: CertificateSkillRelation) => r.skill_id
      ) ?? [];
    const { certificates_skills, ...rest } = row;
    return { ...rest, skills };
  }

  /** Validasi sederhana tanggal terbit vs kedaluwarsa */
  private static checkDate(issued?: string, validUntil?: string) {
    if (issued && validUntil && new Date(issued) >= new Date(validUntil)) {
      throw new Error('Issue date must be before valid-until date');
    }
  }

  /* ----------  queries  ---------- */

  /** Ambil 1 certificate + daftar skill */
  static async getById(id: number): Promise<Certificate | null> {
    const { data, error } = await supabase
      .from(this.TABLE)
      .select('*, certificates_skills(skill_id)')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data ? this.mapNested(data) : null;
  }

  /** List + filter + pagination  */
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
      let q = supabase
        .from(this.TABLE)
        .select('*, certificates_skills(skill_id)', { count: 'exact' });

      /* — filter skill — */
      if (params?.skillId) {
        q = q.eq('certificates_skills.skill_id', params.skillId);
      }

      /* — valid / expired — */
      if (params?.isValid !== undefined) {
        const now = new Date().toISOString();
        q = params.isValid ? q.gt('valid_until', now) : q.lte('valid_until', now);
      }

      /* — range tanggal — */
      if (params?.issuedDateStart) q = q.gte('issued_date', params.issuedDateStart);
      if (params?.issuedDateEnd) q = q.lte('issued_date', params.issuedDateEnd);

      /* — search keyword — */
      if (params?.search) {
        q = q.or(
          `title->en.ilike.%${params.search}%,title->id.ilike.%${params.search}%,issued_by.ilike.%${params.search}%`
        );
      }

      /* — sorting & pagination — */
      q = q.order(params?.sort ?? 'created_at', {
        ascending: params?.order === 'asc',
      });

      if (params?.page && params?.limit) {
        const from = (params.page - 1) * params.limit;
        q = q.range(from, from + params.limit - 1);
      }

      const { data, error, count } = await q;
      if (error) throw error;

      return {
        data: (data ?? []).map(this.mapNested),
        count: count ?? 0,
      };
    } catch (err) {
      console.error('Error fetching certificates:', err);
      throw err;
    }
  }

  /* ----------  mutations  ---------- */

  /** Buat certificate + relasi skills  */
  static async create(
    cert: Omit<Certificate, 'id' | 'created_at' | 'updated_at'> & {
      skills?: number[];
    }
  ): Promise<Certificate> {
    const { skills = [], ...payload } = cert;
    this.checkDate(payload.issued_date, payload.valid_until);

    /* 1. insert certificate */
    const { data: inserted, error } = await supabase
      .from(this.TABLE)
      .insert({
        ...payload,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();
    if (error) throw error;

    /* 2. insert pivot rows */
    if (skills.length) {
      const relations: CertificateSkillRelation[] = skills.map((skill_id) => ({
        certificate_id: inserted.id,
        skill_id,
      }));
      const { error: relErr } = await supabase
        .from(this.RELATION_TABLE)
        .insert(relations);
      if (relErr) throw relErr;
    }

    return { ...inserted, skills };
  }

  /** Perbarui certificate + sinkronisasi skill */
  static async update(
    id: number,
    cert: Partial<Omit<Certificate, 'skills'>> & { skills?: number[] }
  ): Promise<Certificate> {
    const { skills, ...payload } = cert;
    this.checkDate(payload.issued_date, payload.valid_until);

    /* 1. update row utama */
    const { data: updated, error } = await supabase
      .from(this.TABLE)
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;

    /* 2. jika skills disertakan → replace seluruh relasi */
    if (skills) {
      /* hapus lama */
      const { error: delErr } = await supabase
        .from(this.RELATION_TABLE)
        .delete()
        .eq('certificate_id', id);
      if (delErr) throw delErr;

      /* insert baru */
      if (skills.length) {
        const relations = skills.map((skill_id) => ({ certificate_id: id, skill_id }));
        const { error: insErr } = await supabase
          .from(this.RELATION_TABLE)
          .insert(relations);
        if (insErr) throw insErr;
      }
    }

    return { ...updated, skills: skills ?? (await this.getSkillIds(id)) };
  }

  /** Hapus certificate + file + relasi */
  static async delete(id: number): Promise<void> {
    /* hapus relasi agar FK aman */
    await supabase.from(this.RELATION_TABLE).delete().eq('certificate_id', id);

    /* hapus file */
    await this.deleteFiles(id, 'both');

    /* hapus rows utama */
    const { error } = await supabase.from(this.TABLE).delete().eq('id', id);
    if (error) throw error;
  }

  /* ----------  relation helpers  ---------- */

  static async addSkills(id: number, skillIds: number[]): Promise<void> {
    if (!skillIds.length) return;
    const relations = skillIds.map((skill_id) => ({ certificate_id: id, skill_id }));
    const { error } = await supabase.from(this.RELATION_TABLE).insert(relations);
    if (error) throw error;
  }

  static async removeSkills(id: number, skillIds: number[]): Promise<void> {
    if (!skillIds.length) return;
    const { error } = await supabase
      .from(this.RELATION_TABLE)
      .delete()
      .eq('certificate_id', id)
      .in('skill_id', skillIds);
    if (error) throw error;
  }

  static async getBySkill(skillId: number): Promise<Certificate[]> {
    const { data, error } = await supabase
      .from(this.TABLE)
      .select('*, certificates_skills(skill_id)')
      .eq('certificates_skills.skill_id', skillId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map(this.mapNested);
  }

  /* ----------  file helpers  ---------- */

  /** Upload/update file PDF maupun image  */
  static async uploadFiles(
    id: number,
    files: { pdf?: File; image?: File }
  ): Promise<Certificate> {
    try {
      const current = await this.getById(id);
      if (!current) throw new Error('Certificate not found');

      const folderPath = `${this.FOLDER}/${id}`;
      const updates: Partial<Certificate> = {};

      /* – PDF – */
      if (files.pdf) {
        updates.pdf = await saveFile(files.pdf, {
          folder: folderPath,
          deletePrev: current.pdf ?? null,
        });
      }

      /* – Image – */
      if (files.image) {
        updates.image = await saveFile(files.image, {
          folder: folderPath,
          deletePrev: current.image ?? null,
        });
      }

      if (Object.keys(updates).length) {
        return this.update(id, updates);
      }
      return current; // tidak ada perubahan
    } catch (err) {
      console.error('Error uploading certificate files:', err);
      throw err;
    }
  }

  /** Hapus file PDF, image, atau keduanya  */
  static async deleteFiles(
    id: number,
    type: 'pdf' | 'image' | 'both'
  ): Promise<void> {
    const cert = await this.getById(id);
    if (!cert) throw new Error('Certificate not found');

    const targets: string[] = [];
    if ((type === 'pdf' || type === 'both') && cert.pdf) targets.push(cert.pdf);
    if ((type === 'image' || type === 'both') && cert.image) targets.push(cert.image);

    // hapus fisik
    await Promise.all(targets.map(deleteFile));

    // kosongkan kolom di DB
    const updates: Partial<Certificate> = {};
    if (type === 'pdf' || type === 'both') updates.pdf = undefined;
    if (type === 'image' || type === 'both') updates.image = undefined;

    if (Object.keys(updates).length) {
      await this.update(id, updates);
    }
  }

  /* ----------  util publik  ---------- */

  /** Cek masih berlaku (valid_until > today atau null) */
  static isValid(cert: Certificate): boolean {
    return !cert.valid_until || new Date(cert.valid_until) > new Date();
  }

  /* ----------  private ---------- */

  /** Ambil daftar skill id (helper internal) */
  private static async getSkillIds(id: number): Promise<number[]> {
    const { data, error } = await supabase
      .from(this.RELATION_TABLE)
      .select('skill_id')
      .eq('certificate_id', id);
    if (error) throw error;
    return (data ?? []).map((r) => r.skill_id);
  }
}
