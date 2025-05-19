import { createClient } from "@/src/utils/supabase/client";
import { Experience } from "@/src/models/ExperienceModels";
import { ExperienceSkillService } from "@/src/services/experience/ExperienceSkillsServices";

const supabase = createClient();

export class ExperienceService {
  private static TABLE_NAME = 'experiences';

  static async getAll(params?: {
    categoryId?: number;
    skillId?: number; // Tambahkan filter by skill
    search?: string;
    sort?: 'created_at' | 'experience_long';
    order?: 'asc' | 'desc';
    page?: number;
    limit?: number;
  }): Promise<{ data: Experience[]; count: number }> {
    try {
      let query = supabase
        .from(this.TABLE_NAME)
        .select('*', { count: 'exact' });

      if (params?.categoryId) {
        query = query.eq('experience_category_id', params.categoryId);
      }

      // Filter by skill ID jika diperlukan
      if (params?.skillId) {
        // Dapatkan experience_ids yang memiliki skill tersebut
        const { data: experienceSkills } = await supabase
          .from('experience_skills')
          .select('experience_id')
          .eq('skill_id', params.skillId);

        if (experienceSkills && experienceSkills.length > 0) {
          const experienceIds = experienceSkills.map(es => es.experience_id);
          query = query.in('id', experienceIds);
        } else {
          // Jika tidak ada experience dengan skill tersebut, kembalikan array kosong
          return { data: [], count: 0 };
        }
      }

      if (params?.search) {
        query = query.or(
          `title->en.ilike.%${params.search}%,title->id.ilike.%${params.search}%,` +
          `subtitle->en.ilike.%${params.search}%,subtitle->id.ilike.%${params.search}%`
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
      console.error('Error fetching experiences:', error);
      throw error;
    }
  }

  static async getById(id: number, includeSkills: boolean = false): Promise<Experience | null> {
    try {
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      
      // Jika includeSkills true, tambahkan data skills ke experience
      if (data && includeSkills) {
        const skillIds = await ExperienceSkillService.getSkillsByExperienceId(id);
        return { ...data, skillIds };
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching experience:', error);
      throw error;
    }
  }

  static async create(
    experience: Omit<Experience, 'id' | 'created_at' | 'updated_at'>, 
    skillIds?: number[]
  ): Promise<Experience> {
    try {
      await this.validateRelations(experience);
      
      if (experience.company_link && !this.isValidUrl(experience.company_link)) {
        throw new Error('Invalid company link URL');
      }

      if (experience.experience_long !== undefined && experience.experience_long < 0) {
        throw new Error('Experience duration cannot be negative');
      }

      // Validate company_logo if provided (should be a valid path)
      if (experience.company_logo && !experience.company_logo.startsWith('/uploads/')) {
        throw new Error('Invalid company logo path');
      }

      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .insert({
          ...experience,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      
      // Jika ada skillIds, tambahkan ke relasi experience_skills
      if (data && skillIds && skillIds.length > 0) {
        await ExperienceSkillService.setSkillsForExperience(data.id, skillIds);
      }
      
      return data;
    } catch (error) {
      console.error('Error creating experience:', error);
      throw error;
    }
  }

  static async update(
    id: number, 
    experience: Partial<Experience>,
    skillIds?: number[]
  ): Promise<Experience> {
    try {
      await this.validateRelations(experience);

      if (experience.company_link && !this.isValidUrl(experience.company_link)) {
        throw new Error('Invalid company link URL');
      }

      if (experience.experience_long !== undefined && experience.experience_long < 0) {
        throw new Error('Experience duration cannot be negative');
      }

      // Validate company_logo if provided (should be a valid path)
      if (experience.company_logo && !experience.company_logo.startsWith('/uploads/')) {
        throw new Error('Invalid company logo path');
      }

      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .update({
          ...experience,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      // Jika skillIds disediakan (bisa [] kosong atau array dengan nilai), update skills
      if (data && skillIds !== undefined) {
        await ExperienceSkillService.setSkillsForExperience(id, skillIds);
      }
      
      return data;
    } catch (error) {
      console.error('Error updating experience:', error);
      throw error;
    }
  }

  static async delete(id: number): Promise<string | undefined> {
    try {
      // Get the experience to check if it has a company logo
      const { data: experience } = await supabase
        .from(this.TABLE_NAME)
        .select('company_logo')
        .eq('id', id)
        .single();

      // Hapus semua relasi skill terlebih dahulu
      await ExperienceSkillService.deleteAllSkillsForExperience(id);
      
      // Delete the experience
      const { error } = await supabase
        .from(this.TABLE_NAME)
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      // Return the company_logo path if it exists (for optional cleanup)
      return experience?.company_logo;
    } catch (error) {
      console.error('Error deleting experience:', error);
      throw error;
    }
  }

  private static async validateRelations(experience: Partial<Experience>): Promise<void> {
    if (experience.experience_category_id) {
      const { data } = await supabase
        .from('experience_categories')
        .select('id')
        .eq('id', experience.experience_category_id)
        .single();

      if (!data) {
        throw new Error('Invalid experience category ID');
      }
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