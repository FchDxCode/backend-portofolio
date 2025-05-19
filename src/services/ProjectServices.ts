import { createClient } from '@/src/utils/supabase/client';
import {
  saveImage,
  deleteFile,      // alias dari deleteImage
} from '@/src/utils/server/FileStorage';

import {
  Project,
  ProjectImage,
  ProjectSkill,
} from '@/src/models/ProjectModels'; // sesuaikan path jika berbeda

const supabase = createClient();

/** Struktur project yang sudah dilengkapi relasi */
export interface ProjectFull extends Project {
  skills: number[];            // daftar skill_id
  images: ProjectImage[];      // seluruh image milik project
}

export class ProjectService {
  private static TABLE = 'projects';
  private static IMAGE_TABLE = 'project_images';
  private static SKILL_TABLE = 'project_skills';

  // ──────────────────────────── READ ────────────────────────────
  /** List seluruh project (termasuk skills & images) */
  static async list(): Promise<ProjectFull[]> {
    const { data, error } = await supabase
      .from(this.TABLE)
      .select('*, project_skills(skill_id), project_images(*)')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // rapikan relasi ke bentuk array id & ProjectImage[]
    return (data as any[]).map((p) => ({
      ...(p as Project),
      skills: p.project_skills.map((ps: ProjectSkill) => ps.skill_id),
      images: p.project_images as ProjectImage[],
    }));
  }

  /** Ambil detail satu project */
  static async get(id: number): Promise<ProjectFull | null> {
    const { data, error } = await supabase
      .from(this.TABLE)
      .select('*, project_skills(skill_id), project_images(*)')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) return null;

    return {
      ...(data as Project),
      skills: data.project_skills.map((ps: ProjectSkill) => ps.skill_id),
      images: data.project_images as ProjectImage[],
    };
  }

  // ───────────────────────── CREATE ────────────────────────────
  /**
   * Buat project baru.
   * @param payload kolom‐kolom Project
   * @param skillIds daftar skill yang ingin dilekatkan
   * @param imageFiles array File (opsional); tiap file otomatis di‐upload & disimpan
   */
  static async create(
    payload: Omit<Project, 'id' | 'created_at' | 'updated_at'>,
    skillIds: number[] = [],
    imageFiles: File[] = []
  ): Promise<ProjectFull> {
    const now = new Date().toISOString();

    // 1) insert project
    const { data: project, error: errInsert } = await supabase
      .from(this.TABLE)
      .insert({ ...payload, created_at: now, updated_at: now })
      .select()
      .single();
    if (errInsert) throw errInsert;

    // 2) insert skills (bulk)
    if (skillIds.length) {
      const skillRows = skillIds.map((sid) => ({
        project_id: project.id,
        skill_id: sid,
      }));
      const { error } = await supabase
        .from(this.SKILL_TABLE)
        .insert(skillRows);
      if (error) throw error;
    }

    // 3) upload images & insert rows
    const images: ProjectImage[] = [];
    for (const file of imageFiles) {
      const publicPath = await saveImage(file, {
        folder: `projects/${project.id}`,
      });
      const { data: img, error } = await supabase
        .from(this.IMAGE_TABLE)
        .insert({
          project_id: project.id,
          image: publicPath,
          created_at: now,
          updated_at: now,
        })
        .select()
        .single();
      if (error) throw error;
      images.push(img as ProjectImage);
    }

    return {
      ...(project as Project),
      skills: skillIds,
      images,
    };
  }

  // ───────────────────────── UPDATE ────────────────────────────
  /**
   * Update kolom project + set ulang skills + tambahkan / hapus image.
   * Jika ingin mempertahankan skills lama, kirimkan full daftar skillIds terbaru.
   */
  static async update(
    id: number,
    payload: Partial<Project>,
    skillIds?: number[],
    newImageFiles: File[] = [],
    removeImageIds: number[] = []
  ): Promise<ProjectFull> {
    const base = { updated_at: new Date().toISOString() };

    // 1) update project columns
    if (Object.keys(payload).length) {
      const { error } = await supabase
        .from(this.TABLE)
        .update({ ...payload, ...base })
        .eq('id', id);
      if (error) throw error;
    }

    // 2) replace skills (jika parameter diberikan)
    if (skillIds) {
      // hapus semua skill lama
      const { error: errDel } = await supabase
        .from(this.SKILL_TABLE)
        .delete()
        .eq('project_id', id);
      if (errDel) throw errDel;

      if (skillIds.length) {
        const rows = skillIds.map((sid) => ({
          project_id: id,
          skill_id: sid,
        }));
        const { error } = await supabase
          .from(this.SKILL_TABLE)
          .insert(rows);
        if (error) throw error;
      }
    }

    // 3) hapus image yg diminta
    if (removeImageIds.length) {
      // ambil path public dulu untuk di-unlink
      const { data: imgs, error } = await supabase
        .from(this.IMAGE_TABLE)
        .select('id, image')
        .in('id', removeImageIds);
      if (error) throw error;

      for (const img of imgs as ProjectImage[]) {
        await deleteFile(img.image ?? '');
      }
      const { error: errImgDel } = await supabase
        .from(this.IMAGE_TABLE)
        .delete()
        .in('id', removeImageIds);
      if (errImgDel) throw errImgDel;
    }

    // 4) tambahkan image baru
    for (const file of newImageFiles) {
      const publicPath = await saveImage(file, {
        folder: `projects/${id}`,
      });
      const { error } = await supabase
        .from(this.IMAGE_TABLE)
        .insert({
          project_id: id,
          image: publicPath,
          created_at: base.updated_at,
          updated_at: base.updated_at,
        });
      if (error) throw error;
    }

    // 5) return fresh data
    return await this.get(id) as ProjectFull;
  }

  // ───────────────────────── DELETE ────────────────────────────
  /** Hapus project beserta skills & images (+ fisik file) */
  static async delete(id: number): Promise<void> {
    // ambil seluruh images untuk di-unlink
    const { data: imgs, error: errImgs } = await supabase
      .from(this.IMAGE_TABLE)
      .select('id, image')
      .eq('project_id', id);
    if (errImgs) throw errImgs;

    for (const img of imgs as ProjectImage[]) {
      await deleteFile(img.image ?? '');
    }

    // hapus relasi skills & images -> lalu project
    const { error: errRel1 } = await supabase
      .from(this.SKILL_TABLE)
      .delete()
      .eq('project_id', id);
    if (errRel1) throw errRel1;

    const { error: errRel2 } = await supabase
      .from(this.IMAGE_TABLE)
      .delete()
      .eq('project_id', id);
    if (errRel2) throw errRel2;

    const { error } = await supabase
      .from(this.TABLE)
      .delete()
      .eq('id', id);
    if (error) throw error;
  }

  // ───────────────────────── Helper (add/remove 1 item) ─────────────────────────
  static async addSkill(id: number, skillId: number) {
    const { error } = await supabase
      .from(this.SKILL_TABLE)
      .insert({ project_id: id, skill_id: skillId });
    if (error) throw error;
    return this.get(id);
  }

  static async removeSkill(id: number, skillId: number) {
    const { error } = await supabase
      .from(this.SKILL_TABLE)
      .delete()
      .eq('project_id', id)
      .eq('skill_id', skillId);
    if (error) throw error;
    return this.get(id);
  }

  static async addImage(id: number, file: File) {
    const publicPath = await saveImage(file, {
      folder: `projects/${id}`,
    });
    const now = new Date().toISOString();
    const { error } = await supabase
      .from(this.IMAGE_TABLE)
      .insert({
        project_id: id,
        image: publicPath,
        created_at: now,
        updated_at: now,
      });
    if (error) throw error;
    return this.get(id);
  }

  static async removeImage(id: number, imageId: number) {
    const { data, error: errSel } = await supabase
      .from(this.IMAGE_TABLE)
      .select('image')
      .eq('id', imageId)
      .single();
    if (errSel) throw errSel;

    await deleteFile(data?.image ?? '');

    const { error } = await supabase
      .from(this.IMAGE_TABLE)
      .delete()
      .eq('id', imageId);
    if (error) throw error;
    return this.get(id);
  }
}
