// models/SingletonModels.ts

export interface HomeHero {
    id: number;
    title?: Record<string, any>;
    subtitle?: Record<string, any>;
    description?: Record<string, any>;
    image?: string;
    created_at?: string;
    updated_at?: string;
  }
  
  export interface About {
    id: number;
    title?: Record<string, any>;
    subtitle?: Record<string, any>;
    description?: Record<string, any>;
    image?: string;
    title_image?: string;
    subtitle_image?: string;
    created_at?: string;
    updated_at?: string;
  }