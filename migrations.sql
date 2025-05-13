-- EXTENSION 
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- VISITORS
CREATE TABLE visitors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id VARCHAR(64) NOT NULL,
    user_agent TEXT,
    browser VARCHAR(64),
    os VARCHAR(64),
    device_type VARCHAR(16),
    is_bot BOOLEAN DEFAULT FALSE,
    ip_address VARCHAR(64),
    country VARCHAR(64),
    region VARCHAR(64),
    city VARCHAR(64),
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    page_url TEXT NOT NULL,
    referer TEXT,
    visited_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    duration_seconds INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE visitor_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    visitor_id UUID REFERENCES visitors(id) ON DELETE CASCADE,
    event_type VARCHAR(64),
    event_data JSONB,
    event_time TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- HERO_HOME (singleton)
CREATE TABLE home_heros (
    id SERIAL PRIMARY KEY,
    title JSONB,
    subtitle JSONB,
    description JSONB,
    image TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ABOUT (singleton)
CREATE TABLE abouts (
    id SERIAL PRIMARY KEY,
    title JSONB,
    subtitle JSONB,
    description JSONB,
    image TEXT,
    title_image JSONB,
    subtitle_image JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- SKILL CATEGORIES
CREATE TABLE skill_categories (
    id SERIAL PRIMARY KEY,
    title JSONB,
    slug VARCHAR(128) NOT NULL UNIQUE,
    icon TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- SKILLS
CREATE TABLE skills (
    id SERIAL PRIMARY KEY,
    title JSONB,
    slug VARCHAR(128) NOT NULL UNIQUE,
    icon TEXT,
    percent_skills INTEGER,
    long_experience INTEGER,
    skill_category_id INTEGER REFERENCES skill_categories(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- CERTIFICATES
CREATE TABLE certificates (
    id SERIAL PRIMARY KEY,
    title JSONB,
    description JSONB,
    skill_id INTEGER REFERENCES skills(id),
    pdf TEXT,
    image TEXT,
    issued_by TEXT,
    issued_date DATE,
    credential_id TEXT,
    valid_until DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- PROJECT IMAGES
CREATE TABLE project_images (
    id SERIAL PRIMARY KEY,
    image TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- PROJECTS
CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    title JSONB,
    subtitle JSONB,
    description JSONB,
    meta_description TEXT,
    meta_keyword TEXT,
    skill_id INTEGER REFERENCES skills(id),
    image_id INTEGER REFERENCES project_images(id),
    link_demo TEXT,
    link_source_code TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- PROJECT <-> SKILL (Many-to-Many, optional)
CREATE TABLE project_skills (
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    skill_id INTEGER REFERENCES skills(id) ON DELETE CASCADE,
    PRIMARY KEY (project_id, skill_id)
);

-- CALLME_BANNER (singleton)
CREATE TABLE callme_banners (
    id SERIAL PRIMARY KEY,
    title JSONB,
    subtitle JSONB,
    description JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE callme_banner_items (
    id SERIAL PRIMARY KEY,
    banner_id INTEGER REFERENCES callme_banners(id) ON DELETE CASCADE,
    title JSONB,
    subtitle JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- CONTACTS (singleton)
CREATE TABLE contacts (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255),
    no_phone VARCHAR(32),
    location JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- CONTACT FORMS (user message)
CREATE TABLE contact_forms (
    id SERIAL PRIMARY KEY,
    name VARCHAR(128),
    email VARCHAR(255),
    subject TEXT,
    message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- SOCIAL MEDIAS
CREATE TABLE social_medias (
    id SERIAL PRIMARY KEY,
    title JSONB,
    icon TEXT,
    link TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- EXPERIENCE_CATEGORY
CREATE TABLE experience_categories (
    id SERIAL PRIMARY KEY,
    title JSONB,
    slug VARCHAR(128) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- EXPERIENCES
CREATE TABLE experiences (
    id SERIAL PRIMARY KEY,
    title JSONB,
    subtitle JSONB,
    description JSONB,
    key_achievements JSONB,
    location JSONB,
    experience_long INTEGER,
    company_link TEXT,
    skill_id INTEGER REFERENCES skills(id),
    experience_category_id INTEGER REFERENCES experience_categories(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- CALL TO ACTION (singleton)
CREATE TABLE call_to_actions (
    id SERIAL PRIMARY KEY,
    title JSONB,
    subtitle JSONB,
    description JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- HIRE ME BANNER (singleton)
CREATE TABLE hire_me_banners (
    id SERIAL PRIMARY KEY,
    title JSONB,
    free_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- BRANDS
CREATE TABLE brands (
    id SERIAL PRIMARY KEY,
    title JSONB,
    image TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- SERVICE BENEFITS
CREATE TABLE service_benefits (
    id SERIAL PRIMARY KEY,
    title JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- SERVICE HERO (singleton)
CREATE TABLE service_heros (
    id SERIAL PRIMARY KEY,
    title JSONB,
    subtitle JSONB,
    description JSONB,
    icon TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- FEATURED SERVICES
CREATE TABLE featured_services (
    id SERIAL PRIMARY KEY,
    title JSONB,
    preview_description JSONB,
    description JSONB,
    icon TEXT,
    benefit_id INTEGER REFERENCES service_benefits(id),
    skill_id INTEGER REFERENCES skills(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- SERVICE PROCESSES
CREATE TABLE service_processes (
    id SERIAL PRIMARY KEY,
    title JSONB,
    description JSONB,
    work_duration INTEGER,
    icon TEXT,
    order_no INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    benefit_id INTEGER REFERENCES service_benefits(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- TECH STACK SKILLS
CREATE TABLE tech_stack_skills (
    id SERIAL PRIMARY KEY,
    title JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- TECH STACKS
CREATE TABLE tech_stacks (
    id SERIAL PRIMARY KEY,
    title JSONB,
    icon TEXT,
    tech_stack_skill_id INTEGER REFERENCES tech_stack_skills(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- PACKAGE BENEFITS
CREATE TABLE package_benefits (
    id SERIAL PRIMARY KEY,
    title JSONB,
    slug VARCHAR(128) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- PACKAGE EXCLUSIONS
CREATE TABLE package_exclusions (
    id SERIAL PRIMARY KEY,
    title JSONB,
    slug VARCHAR(128) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- PACKAGE PRICINGS
CREATE TABLE package_pricings (
    id SERIAL PRIMARY KEY,
    title JSONB,
    description JSONB,
    work_duration INTEGER,
    price NUMERIC(12,2),
    tag VARCHAR(128),
    benefit_id INTEGER REFERENCES package_benefits(id),
    exclusion_id INTEGER REFERENCES package_exclusions(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- PROMISES
CREATE TABLE promises (
    id SERIAL PRIMARY KEY,
    icon TEXT,
    title JSONB,
    subtitle JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- FAQS (Questions)
CREATE TABLE faqs (
    id SERIAL PRIMARY KEY,
    title JSONB,
    description JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- TESTIMONIAL CATEGORIES
CREATE TABLE testimonial_categories (
    id SERIAL PRIMARY KEY,
    title JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- TESTIMONIALS
CREATE TABLE testimonials (
    id SERIAL PRIMARY KEY,
    profile TEXT,
    name VARCHAR(128),
    job VARCHAR(128),
    star INTEGER,
    project TEXT,
    industry TEXT,
    year INTEGER,
    message JSONB,
    testimonial_category_id INTEGER REFERENCES testimonial_categories(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ARTICLE TAGS
CREATE TABLE article_tags (
    id SERIAL PRIMARY KEY,
    title JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ARTICLE CATEGORIES
CREATE TABLE article_categories (
    id SERIAL PRIMARY KEY,
    icon TEXT,
    title JSONB,
    subtitle JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ARTICLES
CREATE TABLE articles (
    id SERIAL PRIMARY KEY,
    image TEXT,
    title JSONB,
    preview_description JSONB,
    description JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    post_schedule TIMESTAMP WITH TIME ZONE,
    article_tag_id INTEGER REFERENCES article_tags(id),
    article_category_id INTEGER REFERENCES article_categories(id),
    minute_read INTEGER,
    total_views INTEGER DEFAULT 0,
    like INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- PRIVACY POLICY (singleton)
CREATE TABLE privacy_policies (
    id SERIAL PRIMARY KEY,
    title JSONB,
    description JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- TERMS OF SERVICE (singleton)
CREATE TABLE terms_of_service (
    id SERIAL PRIMARY KEY,
    title JSONB,
    description JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- COOKIE POLICIES
CREATE TABLE cookie_policies (
    id SERIAL PRIMARY KEY,
    title JSONB,
    description JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- WEB SETTINGS (singleton)
CREATE TABLE web_settings (
    id SERIAL PRIMARY KEY,
    title_website JSONB,
    logo TEXT,
    favicon TEXT,
    copyright TEXT,
    cv_id TEXT,
    cv_en TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);