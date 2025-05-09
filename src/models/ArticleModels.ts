// models/ArticleModels.ts

export interface ArticleTag {
    id: number;
    title?: Record<string, any>;
    is_active?: boolean;
    created_at?: string;
    updated_at?: string;
  }
  
  export interface ArticleCategory {
    id: number;
    icon?: string;
    title?: Record<string, any>;
    subtitle?: Record<string, any>;
    is_active?: boolean;
    created_at?: string;
    updated_at?: string;
  }
  
  export interface Article {
    id: number;
    image?: string;
    title?: Record<string, any>;
    preview_description?: Record<string, any>;
    description?: Record<string, any>;
    is_active?: boolean;
    post_schedule?: string;
    article_tag_id?: number;
    article_category_id?: number;
    minute_read?: number;
    total_views?: number;
    like?: number;
    created_at?: string;
    updated_at?: string;
  }