import { createClient } from "@/src/utils/supabase/client";
import { TechStackSkill } from "@/src/models/ServiceModels";

const supabase = createClient();

export class TechStackSkillService {
  private static TABLE_NAME = 'tech_stack_skills';

  static async getAll(params?: {
    search?: string;
    sort?: 'created_at' | 'title';
    order?: 'asc' | 'desc';
  }): Promise<TechStackSkill[]> {
    try {
      let query = supabase
        .from(this.TABLE_NAME)
        .select('*');

      if (params?.search) {
        query = query.or(`title->en.ilike.%${params.search}%,title->id.ilike.%${params.search}%`);
      }

      if (params?.sort) {
        query = query.order(params.sort, { ascending: params.order === 'asc' });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching tech stack skills:', error);
      throw error;
    }
  }

  static async getById(id: number): Promise<TechStackSkill | null> {
    try {
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching tech stack skill:', error);
      throw error;
    }
  }

  static async create(skill: Omit<TechStackSkill, 'id' | 'created_at' | 'updated_at'>): Promise<TechStackSkill> {
    try {
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .insert({
          ...skill,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating tech stack skill:', error);
      throw error;
    }
  }

  static async update(id: number, skill: Partial<TechStackSkill>): Promise<TechStackSkill> {
    try {
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .update({
          ...skill,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating tech stack skill:', error);
      throw error;
    }
  }

  static async delete(id: number): Promise<void> {
    try {
      // Check if skill is being used in tech_stacks
      const { count: techStackCount } = await supabase
        .from('tech_stacks')
        .select('*', { count: 'exact' })
        .eq('tech_stack_skill_id', id);

      if (techStackCount && techStackCount > 0) {
        throw new Error('Cannot delete: This skill is being used by tech stacks');
      }

      const { error } = await supabase
        .from(this.TABLE_NAME)
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting tech stack skill:', error);
      throw error;
    }
  }

  static async getTechStackCount(skillId: number): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('tech_stacks')
        .select('*', { count: 'exact' })
        .eq('tech_stack_skill_id', skillId);

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Error getting tech stack count:', error);
      throw error;
    }
  }
}