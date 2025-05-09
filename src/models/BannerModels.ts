// models/BannerModels.ts

export interface CallmeBanner {
    id: number;
    title?: Record<string, any>;
    subtitle?: Record<string, any>;
    description?: Record<string, any>;
    created_at?: string;
    updated_at?: string;
  }
  
  export interface CallmeBannerItem {
    id: number;
    banner_id: number;
    title?: Record<string, any>;
    subtitle?: Record<string, any>;
    created_at?: string;
    updated_at?: string;
  }

  export interface CallToAction {
    id: number;
    title?: Record<string, any>;
    subtitle?: Record<string, any>;
    description?: Record<string, any>;
    created_at?: string;
    updated_at?: string;
  }
  
  export interface HireMeBanner {
    id: number;
    title?: Record<string, any>;
    free_date?: string;
    created_at?: string;
    updated_at?: string;
  }