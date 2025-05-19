import { createClient } from "@/src/utils/supabase/client";
import { ExperienceSkill } from "@/src/models/ExperienceModels";

const supabase = createClient();

export class ExperienceSkillService {
  private static TABLE_NAME = 'experience_skills';

  static async getSkillsByExperienceId(experienceId: number): Promise<number[]> {
    try {
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .select('skill_id')
        .eq('experience_id', experienceId);

      if (error) throw error;
      return data ? data.map(item => item.skill_id) : [];
    } catch (error) {
      console.error('Error fetching skills for experience:', error);
      throw error;
    }
  }

  static async setSkillsForExperience(experienceId: number, skillIds: number[]): Promise<void> {
    try {
      // Start a transaction by getting the connection
      const { error: deleteError } = await supabase
        .from(this.TABLE_NAME)
        .delete()
        .eq('experience_id', experienceId);

      if (deleteError) throw deleteError;

      // Only insert if there are skills to add
      if (skillIds.length > 0) {
        const records = skillIds.map(skillId => ({
          experience_id: experienceId,
          skill_id: skillId
        }));

        const { error: insertError } = await supabase
          .from(this.TABLE_NAME)
          .insert(records);

        if (insertError) throw insertError;
      }
    } catch (error) {
      console.error('Error setting skills for experience:', error);
      throw error;
    }
  }

  static async removeSkillFromExperience(experienceId: number, skillId: number): Promise<void> {
    try {
      const { error } = await supabase
        .from(this.TABLE_NAME)
        .delete()
        .eq('experience_id', experienceId)
        .eq('skill_id', skillId);

      if (error) throw error;
    } catch (error) {
      console.error('Error removing skill from experience:', error);
      throw error;
    }
  }

  static async deleteAllSkillsForExperience(experienceId: number): Promise<void> {
    try {
      const { error } = await supabase
        .from(this.TABLE_NAME)
        .delete()
        .eq('experience_id', experienceId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting skills for experience:', error);
      throw error;
    }
  }
}