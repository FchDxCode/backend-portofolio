export interface WebSetting {
    id: number;
    title_website?: Record<string, any>;
    logo?: string;
    favicon?: string;
    copyright?: string;
    cv?: string;
    portfolio?: string;
    created_at?: string;
    updated_at?: string;
  }

export interface SocialMedia {
    id: number;
    title?: Record<string, any>;
    icon?: string;
    link?: string;
    created_at?: string;
    updated_at?: string;
  }

  export interface PrivacyPolicy {
    id: number;
    title?: Record<string, any>;
    description?: Record<string, any>;
    created_at?: string;
    updated_at?: string;
  }
  
  export interface TermsOfService {
    id: number;
    title?: Record<string, any>;
    description?: Record<string, any>;
    created_at?: string;
    updated_at?: string;
  }
  
  export interface CookiePolicy {
    id: number;
    title?: Record<string, any>;
    description?: Record<string, any>;
    created_at?: string;
    updated_at?: string;
  }
  
