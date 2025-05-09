export interface Brand {
    id: number;
    title?: Record<string, any>;
    image?: string;
    created_at?: string;
    updated_at?: string;
  }
  
  export interface ServiceBenefit {
    id: number;
    title?: Record<string, any>;
    created_at?: string;
    updated_at?: string;
  }
  
  export interface ServiceHero {
    id: number;
    title?: Record<string, any>;
    subtitle?: Record<string, any>;
    description?: Record<string, any>;
    icon?: string;
    created_at?: string;
    updated_at?: string;
  }
  
  export interface FeaturedService {
    id: number;
    title?: Record<string, any>;
    preview_description?: Record<string, any>;
    description?: Record<string, any>;
    icon?: string;
    benefit_id?: number;
    skill_id?: number;
    created_at?: string;
    updated_at?: string;
  }
  
  export interface ServiceProcess {
    id: number;
    title?: Record<string, any>;
    description?: Record<string, any>;
    work_duration?: number;
    icon?: string;
    order_no?: number;
    is_active?: boolean;
    benefit_id?: number;
    created_at?: string;
    updated_at?: string;
  }
  
  export interface TechStackSkill {
    id: number;
    title?: Record<string, any>;
    created_at?: string;
    updated_at?: string;
  }
  
  export interface TechStack {
    id: number;
    title?: Record<string, any>;
    icon?: string;
    tech_stack_skill_id?: number;
    created_at?: string;
    updated_at?: string;
  }
  
  export interface PackageBenefit {
    id: number;
    title?: Record<string, any>;
    slug: string;
    created_at?: string;
    updated_at?: string;
  }
  
  export interface PackageExclusion {
    id: number;
    title?: Record<string, any>;
    slug: string;
    created_at?: string;
    updated_at?: string;
  }
  
  export interface PackagePricing {
    id: number;
    title?: Record<string, any>;
    description?: Record<string, any>;
    work_duration?: number;
    price: number;
    tag?: string;
    benefit_id?: number;
    exclusion_id?: number;
    created_at?: string;
    updated_at?: string;
  }
  
  export interface PromiseItem {
    id: number;
    icon?: string;
    title?: Record<string, any>;
    subtitle?: Record<string, any>;
    created_at?: string;
    updated_at?: string;
  }
  
  export interface Faq {
    id: number;
    title?: Record<string, any>;
    description?: Record<string, any>;
    created_at?: string;
    updated_at?: string;
  }
  
  export interface TestimonialCategory {
    id: number;
    title?: Record<string, any>;
    created_at?: string;
    updated_at?: string;
  }
  
  export interface Testimonial {
    id: number;
    profile?: string;
    name?: string;
    job?: string;
    star?: number;
    project?: string;
    industry?: string;
    year?: number;
    message?: Record<string, any>;
    testimonial_category_id?: number;
    created_at?: string;
    updated_at?: string;
  }