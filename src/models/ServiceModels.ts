export interface Brand {
    id: number;
    title?: Record<string, any>;
    image?: string;
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

  export interface ServiceBenefit {
    id: number;
    title?: Record<string, any>;
    created_at?: string;
    updated_at?: string;
  }


// Featured Services
  export interface FeaturedService {
      id: number;
      title?: Record<string, any>;
      preview_description?: Record<string, any>;
      description?: Record<string, any>;
      icon?: string;
      created_at?: string;
      updated_at?: string;

      benefits?: ServiceBenefit[];
      skills?: TechStack[];
  }

  export interface FeaturedServiceBenefit {
      featured_service_id: number; 
      benefit_id: number;           
  }
  
  export interface FeaturedServiceSkill {
      featured_service_id: number; 
      skill_id: number;            
  }
  
// Service Process
  export interface ServiceProcess {
    id: number;
    title?: Record<string, any>;
    description?: Record<string, any>;
    work_duration?: Record<string, any>;
    icon?: string;
    order_no?: number;
    is_active?: boolean;
    created_at?: string;
    updated_at?: string;
  }
  
  export interface ProcessActivity {
    id: number;
    title?: Record<string, any>;
    created_at?: string;
    updated_at?: string;
  }
  
  export interface ServiceProcessActivityLink {
    service_process_id: number;
    process_activity_id: number;
  }
  
// Tech Stack
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
  
// Package Benefit
  export interface PackageBenefit {
    id: number;
    title?: Record<string, any>;
    created_at?: string;
    updated_at?: string;
  }

  export interface PackageExclusion {
    id: number;
    title?: Record<string, any>;
    created_at?: string;
    updated_at?: string;
  }

  export interface PackagePricing {
    id: number;
    title?: Record<string, any>;
    description?: Record<string, any>;
    work_duration?: Record<string, any>;
    price: Record<string, any>;
    created_at?: string;
    updated_at?: string;

    benefits?: PackageBenefit[];
    exclusions?: PackageExclusion[];
  }

  export interface PackagePricingBenefit {
    package_pricing_id: number;
    package_benefit_id: number;
  }

  export interface PackagePricingExclusion {
    package_pricing_id: number;
    package_exclusion_id: number;
  }

// Promise

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

// Testimonial
  
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
    job?: Record<string, any>;
    star?: number; 
    project?: Record<string, any>;
    industry?: Record<string, any>;
    year?: number;
    message?: Record<string, any>;
    testimonial_category_id?: number;
    created_at?: string;
    updated_at?: string;

    testimonial_categories?: TestimonialCategory; 
  }