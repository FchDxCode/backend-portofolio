// models/CertificateModels.ts

export interface Certificate {
  id: number;
  title?: Record<string, any>;
  description?: Record<string, any>;
  pdf?: string;
  image?: string;
  issued_by?: string;
  issued_date?: string;
  credential_id?: string;
  valid_until?: string;
  created_at?: string;
  updated_at?: string;

  skills?: number[];
}

// tambahhan table baru
export interface CertificateSkillRelation {
  certificate_id: number;
  skill_id: number;
}