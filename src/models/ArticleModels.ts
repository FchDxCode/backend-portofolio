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
  article_category_id?: number;
  minute_read?: number;
  total_views?: number;
  like?: number;
  created_at?: string;
  updated_at?: string;

  // Baru di tambahkan
  slug?: string;
  meta_title?: string;
  meta_description?: string;
  canonical_url?: string;
  og_title?: string;
  og_description?: string;
  og_image?: string;
}

// Model untuk relasi antara Article dan ArticleTag
// nama table: article_tags_articles
export interface ArticleTagRelation {
  article_id: number;
  article_tag_id: number;
}