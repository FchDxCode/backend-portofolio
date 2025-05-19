export interface ProjectImage {
    id: number;
    project_id: number;
    image?: string;
    created_at?: string;
    updated_at?: string;
  }
  
  export interface Project {
    id: number;
    title?: Record<string, any>;
    subtitle?: Record<string, any>;
    description?: Record<string, any>;
    meta_title?: string;
    meta_description?: string;
    skill_id?: number;
    image_id?: number;
    link_demo?: string;
    link_source_code?: string;
    created_at?: string;
    updated_at?: string;
  }
  
  export interface ProjectSkill {
    project_id: number;
    skill_id: number;
  }