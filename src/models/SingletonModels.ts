// models/SingletonModels.ts

export interface HomeHero {
    id: number;
    title?: Record<string, any>; //json
    subtitle?: Record<string, any>; //json
    description?: Record<string, any>; //json
    image?: string;
    created_at?: string;
    updated_at?: string;
  }
  
  export interface About {
    id: number;
    title?: Record<string, any>; //json
    subtitle?: Record<string, any>; //json
    description?: Record<string, any>; //json
    image?: string;
    title_image?: Record<string, any>; //json data (was string path)
    subtitle_image?: Record<string, any>; //json data (was string path)
    created_at?: string;
    updated_at?: string;
  }