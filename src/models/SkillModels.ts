  export interface SkillCategory {
    id: number;
    title?: Record<string, any>;
    icon?: string;
    created_at?: string;
    updated_at?: string;
  }
  
  export interface Skill {
    id: number;
    title?: Record<string, any>;
    icon?: string;
    percent_skills?: number;
    long_experience?: number;
    skill_category_id?: number;
    created_at?: string;
    updated_at?: string;
  }