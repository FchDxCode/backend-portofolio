export interface Contact {
    id: number;
    email?: string;
    no_phone?: string;
    location?: Record<string, any>;
    created_at?: string;
    updated_at?: string;
  }
  
  export interface ContactForm {
    id: number;
    name: string;
    email: string;
    subject?: string;
    message?: string;
    created_at?: string;
    updated_at?: string;
  }