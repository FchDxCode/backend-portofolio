import { createClient } from '@/src/utils/supabase/client';
import { Project } from '@/src/models/ProjectModels';
import { deleteFile } from '@/src/utils/server/FileStorage';          // util lokal
import { ProjectImageService } from '@/src/services/project/ProjectImageServices';
const supabase = createClient();

export class ProjectService {
  private static TABLE_NAME = 'projects';
  private static SKILL_TABLE = 'project_skills';
  private static IMAGE_TABLE = 'project_images';

  /**
   * Get all projects with filters
   */
  static async getAll(params?: {
    skillId?: number;
    search?: string;
    sort?: 'created_at' | 'title';
    order?: 'asc' | 'desc';
    page?: number;
    limit?: number;
  }): Promise<{ data: Project[]; count: number }> {
    try {
      let query = supabase
        .from(this.TABLE_NAME)
        .select('*, project_skills!inner(*)', { count: 'exact' });

      // Apply filters
      if (params?.skillId) {
        query = query.eq('project_skills.skill_id', params.skillId);
      }

      if (params?.search) {
        query = query.or(
          `title->en.ilike.%${params.search}%,title->id.ilike.%${params.search}%,` +
          `description->en.ilike.%${params.search}%,description->id.ilike.%${params.search}%`
        );
      }

      // Apply sorting
      if (params?.sort) {
        query = query.order(params.sort, { ascending: params.order === 'asc' });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      // Apply pagination
      if (params?.page && params?.limit) {
        const from = (params.page - 1) * params.limit;
        const to = from + params.limit - 1;
        query = query.range(from, to);
      }

      const { data, error, count } = await query;

      if (error) throw error;
      return { data: data || [], count: count || 0 };
    } catch (error) {
      console.error('Error fetching projects:', error);
      throw error;
    }
  }

  /**
   * Get project by ID with related data
   */
  static async getById(id: number): Promise<Project | null> {
    try {
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .select(`
          *,
          project_images(*),
          project_skills(skill_id)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching project:', error);
      throw error;
    }
  }

  /**
   * Create new project with skills
   */
  static async create(
    project: Omit<Project, 'id' | 'created_at' | 'updated_at'>,
    skillIds: number[]
  ): Promise<Project> {
    try {
      // Validate URLs if provided
      if (project.link_demo && !this.isValidUrl(project.link_demo)) {
        throw new Error('Invalid demo link URL');
      }
      if (project.link_source_code && !this.isValidUrl(project.link_source_code)) {
        throw new Error('Invalid source code link URL');
      }

      // Start transaction
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .insert({
          ...project,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      // Add skills
      if (skillIds.length > 0) {
        await this.updateProjectSkills(data.id, skillIds);
      }

      return data;
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  }

  /**
   * Update project and its skills
   */
  static async update(
    id: number,
    project: Partial<Project>,
    skillIds?: number[]
  ): Promise<Project> {
    try {
      // Validate URLs if provided
      if (project.link_demo && !this.isValidUrl(project.link_demo)) {
        throw new Error('Invalid demo link URL');
      }
      if (project.link_source_code && !this.isValidUrl(project.link_source_code)) {
        throw new Error('Invalid source code link URL');
      }

      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .update({
          ...project,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Update skills if provided
      if (skillIds !== undefined) {
        await this.updateProjectSkills(id, skillIds);
      }

      return data;
    } catch (error) {
      console.error('Error updating project:', error);
      throw error;
    }
  }

  static async delete(id: number): Promise<void> {
    try {
      /* 1. hapus semua skill terkait */
      await supabase.from(this.SKILL_TABLE).delete().eq('project_id', id);

      /* 2. ambil & hapus semua image + file fisik */
      const { data: images, error: imgErr } = await supabase
        .from(this.IMAGE_TABLE)
        .select('*')
        .eq('project_id', id);

      if (imgErr) throw imgErr;

      if (images && images.length) {
        // hapus file lokal
        await Promise.all(images.map((img) => deleteFile(img.image)));

        // hapus record image
        await supabase.from(this.IMAGE_TABLE).delete().eq('project_id', id);
      }

      /* 3. hapus record project */
      const { error } = await supabase.from(this.TABLE_NAME).delete().eq('id', id);
      if (error) throw error;
    } catch (err) {
      console.error('Error deleting project:', err);
      throw err;
    }
  }

  /**
   * Update project skills
   */
  private static async updateProjectSkills(projectId: number, skillIds: number[]): Promise<void> {
    try {
      // Delete existing skills
      await supabase
        .from(this.SKILL_TABLE)
        .delete()
        .eq('project_id', projectId);

      // Add new skills
      if (skillIds.length > 0) {
        const skillRecords = skillIds.map(skillId => ({
          project_id: projectId,
          skill_id: skillId
        }));

        const { error } = await supabase
          .from(this.SKILL_TABLE)
          .insert(skillRecords);

        if (error) throw error;
      }
    } catch (error) {
      console.error('Error updating project skills:', error);
      throw error;
    }
  }

  /**
   * Get project skills
   */
  static async getProjectSkills(projectId: number): Promise<number[]> {
    try {
      const { data, error } = await supabase
        .from(this.SKILL_TABLE)
        .select('skill_id')
        .eq('project_id', projectId);

      if (error) throw error;
      return data.map(record => record.skill_id);
    } catch (error) {
      console.error('Error fetching project skills:', error);
      throw error;
    }
  }

  private static isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
}