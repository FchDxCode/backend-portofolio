export interface ExperienceCategory {
  id: number;
  title?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

export interface Experience {
  id: number;
  title?: Record<string, any>;
  subtitle?: Record<string, any>;
  description?: Record<string, any>;
  key_achievements?: Record<string, any>;
  location?: Record<string, any>;
  experience_long?: number;
  company_link?: string;
  company_logo?: string;
  experience_category_id?: number;
  created_at?: string;
  updated_at?: string;

  skillIds?: number[];
}

// Model untuk relasi antara Experience dan Skill
export interface ExperienceSkill {
  experience_id: number; // ID dari Experience
  skill_id: number;      // ID dari Skill
}