import { createClient } from "@/src/utils/supabase/client";
import { TechStack } from "@/src/models/ServiceModels";

const supabase = createClient();

export class TechStackService {
  private static TABLE_NAME = 'tech_stacks';
  private static STORAGE_BUCKET = 'tech-stack-icons';
  private static MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  /**
   * Get all tech stacks with optional filtering & relations
   */
  static async getAll(params?: {
    skillId?: number;
    search?: string;
    sort?: 'created_at' | 'title';
    order?: 'asc' | 'desc';
    withSkill?: boolean; // Include skill details
  }): Promise<TechStack[]> {
    try {
      // Base query with optional skill relation
      let query = supabase
        .from(this.TABLE_NAME)
        .select('*,tech_stack_skills(id,title)');

      // Apply filters
      if (params?.skillId) {
        query = query.eq('tech_stack_skill_id', params.skillId);
      }

      if (params?.search) {
        query = query.or(`title->en.ilike.%${params.search}%,title->id.ilike.%${params.search}%`);
      }

      // Apply sorting
      if (params?.sort) {
        query = query.order(params.sort, { ascending: params.order === 'asc' });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching tech stacks:', error);
      throw error;
    }
  }

  /**
   * Get single tech stack with complete relations
   */
  static async getById(id: number): Promise<TechStack | null> {
    try {
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .select(`
          *,
          tech_stack_skills (
            id,
            title
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching tech stack:', error);
      throw error;
    }
  }

  /**
   * Create new tech stack with icon handling
   */
  static async create(
    techStack: Omit<TechStack, 'id' | 'created_at' | 'updated_at'>,
    iconFile?: File
  ): Promise<TechStack> {
    try {
      // Validate skill relation
      await this.validateSkillId(techStack.tech_stack_skill_id);

      const techStackData = { ...techStack };

      // Handle icon upload or validation
      if (iconFile) {
        techStackData.icon = await this.uploadIcon(iconFile);
      } else if (techStack.icon && !this.isValidIconClass(techStack.icon)) {
        throw new Error('Invalid icon format. Must be a file or valid icon class.');
      }

      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .insert({
          ...techStackData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating tech stack:', error);
      throw error;
    }
  }

  /**
   * Update tech stack with icon handling
   */
  static async update(
    id: number,
    techStack: Partial<TechStack>,
    newIconFile?: File
  ): Promise<TechStack> {
    try {
      // Validate skill relation if provided
      if (techStack.tech_stack_skill_id) {
        await this.validateSkillId(techStack.tech_stack_skill_id);
      }

      const updateData: Partial<TechStack> = {
        ...techStack,
        updated_at: new Date().toISOString()
      };

      // Handle icon update
      if (newIconFile) {
        const oldTechStack = await this.getById(id);
        if (oldTechStack?.icon && !this.isValidIconClass(oldTechStack.icon)) {
          await this.deleteIcon(oldTechStack.icon);
        }
        updateData.icon = await this.uploadIcon(newIconFile);
      } else if (techStack.icon && !this.isValidIconClass(techStack.icon)) {
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
      console.error('Error updating tech stack:', error);
      throw error;
    }
  }

  /**
   * Delete tech stack and cleanup icon
   */
  static async delete(id: number): Promise<void> {
    try {
      const techStack = await this.getById(id);
      if (!techStack) return;

      // Delete icon if exists and is not a class
      if (techStack.icon && !this.isValidIconClass(techStack.icon)) {
        await this.deleteIcon(techStack.icon);
      }

      const { error } = await supabase
        .from(this.TABLE_NAME)
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting tech stack:', error);
      throw error;
    }
  }

  /**
   * Validate tech stack skill exists
   */
  private static async validateSkillId(skillId?: number): Promise<void> {
    if (!skillId) return;

    const { data } = await supabase
      .from('tech_stack_skills')
      .select('id')
      .eq('id', skillId)
      .single();

    if (!data) {
      throw new Error('Invalid tech stack skill ID');
    }
  }

  /**
   * Validate icon class format
   */
  private static isValidIconClass(icon: string): boolean {
    return /^(fa|bi|material-icons|icon-)/.test(icon);
  }

  /**
   * Upload icon file
   */
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

  /**
   * Delete icon file
   */
  private static async deleteIcon(path: string): Promise<void> {
    const { error } = await supabase.storage
      .from('public')
      .remove([path]);

    if (error) throw error;
  }

  /**
   * Get public URL for icon
   */
  static getIconUrl(path: string): string {
    if (this.isValidIconClass(path)) return path;
    
    const { data } = supabase.storage
      .from('public')
      .getPublicUrl(path);
    
    return data.publicUrl;
  }
}