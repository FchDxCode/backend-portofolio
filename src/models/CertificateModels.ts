export interface Certificate {
    id: number;
    title?: Record<string, any>;
    description?: Record<string, any>;
    skill_id?: number;
    pdf?: string;
    image?: string;
    issued_by?: string;
    issued_date?: string;
    credential_id?: string;
    valid_until?: string;
    created_at?: string;
    updated_at?: string;
  }