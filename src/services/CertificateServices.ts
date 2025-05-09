import { createClient } from "@/src/utils/supabase/client";
import { Certificate } from "@/src/models/CertificateModels";

const supabase = createClient();

export class CertificateService {
  private static TABLE_NAME = 'certificates';
  private static STORAGE_FOLDER = 'certificates';

  /**
   * Get all certificates with filters and sorting
   */
  static async getAll(params?: {
    skillId?: number;
    isValid?: boolean;
    issuedDateStart?: string;
    issuedDateEnd?: string;
    sort?: 'issued_date' | 'valid_until' | 'created_at';
    order?: 'asc' | 'desc';
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: Certificate[]; count: number }> {
    try {
      let query = supabase
        .from(this.TABLE_NAME)
        .select('*', { count: 'exact' });

      // Apply filters
      if (params?.skillId) {
        query = query.eq('skill_id', params.skillId);
      }

      if (params?.isValid !== undefined) {
        const currentDate = new Date().toISOString();
        if (params.isValid) {
          query = query.gt('valid_until', currentDate);
        } else {
          query = query.lte('valid_until', currentDate);
        }
      }

      if (params?.issuedDateStart) {
        query = query.gte('issued_date', params.issuedDateStart);
      }

      if (params?.issuedDateEnd) {
        query = query.lte('issued_date', params.issuedDateEnd);
      }

      if (params?.search) {
        query = query.or(`title->en.ilike.%${params.search}%,title->id.ilike.%${params.search}%,issued_by.ilike.%${params.search}%`);
      }

      // Apply sorting
      if (params?.sort) {
        query = query.order(params.sort, { ascending: params.order === 'asc' });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      // Apply pagination
      if (params?.page && params?.limit) {
        const from = (params.page - 1) * params.limit;
        const to = from + params.limit - 1;
        query = query.range(from, to);
      }

      const { data, error, count } = await query;

      if (error) throw error;
      return { data: data || [], count: count || 0 };
    } catch (error) {
      console.error('Error fetching certificates:', error);
      throw error;
    }
  }

  /**
   * Get certificate by ID
   */
  static async getById(id: number): Promise<Certificate | null> {
    try {
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching certificate:', error);
      throw error;
    }
  }

  /**
   * Create new certificate
   */
  static async create(certificate: Omit<Certificate, 'id' | 'created_at' | 'updated_at'>): Promise<Certificate> {
    try {
      // Validate dates
      if (certificate.issued_date && certificate.valid_until) {
        if (new Date(certificate.issued_date) >= new Date(certificate.valid_until)) {
          throw new Error('Issue date must be before valid until date');
        }
      }

      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .insert({
          ...certificate,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating certificate:', error);
      throw error;
    }
  }

  /**
   * Update certificate
   */
  static async update(id: number, certificate: Partial<Certificate>): Promise<Certificate> {
    try {
      // Validate dates if both are provided
      if (certificate.issued_date && certificate.valid_until) {
        if (new Date(certificate.issued_date) >= new Date(certificate.valid_until)) {
          throw new Error('Issue date must be before valid until date');
        }
      }

      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .update({
          ...certificate,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating certificate:', error);
      throw error;
    }
  }

  /**
   * Delete certificate and its files
   */
  static async delete(id: number): Promise<void> {
    try {
      // Get certificate to check for files
      const certificate = await this.getById(id);
      if (!certificate) throw new Error('Certificate not found');

      // Delete files if they exist
      if (certificate.pdf || certificate.image) {
        await this.deleteFiles(id, 'both');
      }

      // Delete certificate record
      const { error } = await supabase
        .from(this.TABLE_NAME)
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting certificate:', error);
      throw error;
    }
  }

  /**
   * Upload certificate files (PDF and/or image)
   */
  static async uploadFiles(
    id: number,
    files: { pdf?: File; image?: File }
  ): Promise<Certificate> {
    try {
      const updates: Partial<Certificate> = {};

      // Handle PDF upload
      if (files.pdf) {
        const pdfPath = `${this.STORAGE_FOLDER}/${id}/pdf-${Date.now()}`;
        const { error: pdfError } = await supabase.storage
          .from('public')
          .upload(pdfPath, files.pdf);

        if (pdfError) throw pdfError;
        updates.pdf = pdfPath;
      }

      // Handle image upload
      if (files.image) {
        const imagePath = `${this.STORAGE_FOLDER}/${id}/image-${Date.now()}`;
        const { error: imageError } = await supabase.storage
          .from('public')
          .upload(imagePath, files.image);

        if (imageError) throw imageError;
        updates.image = imagePath;
      }

      // Update certificate with new file paths
      return await this.update(id, updates);
    } catch (error) {
      console.error('Error uploading certificate files:', error);
      throw error;
    }
  }

  /**
   * Delete certificate files
   */
  static async deleteFiles(id: number, type: 'pdf' | 'image' | 'both'): Promise<void> {
    try {
      const certificate = await this.getById(id);
      if (!certificate) throw new Error('Certificate not found');

      const filesToDelete: string[] = [];

      if ((type === 'pdf' || type === 'both') && certificate.pdf) {
        filesToDelete.push(certificate.pdf);
      }

      if ((type === 'image' || type === 'both') && certificate.image) {
        filesToDelete.push(certificate.image);
      }

      if (filesToDelete.length > 0) {
        const { error } = await supabase.storage
          .from('public')
          .remove(filesToDelete);

        if (error) throw error;

        // Update certificate to remove file references
        const updates: Partial<Certificate> = {};
        if (type === 'pdf' || type === 'both') updates.pdf = undefined;
        if (type === 'image' || type === 'both') updates.image = undefined;

        await this.update(id, updates);
      }
    } catch (error) {
      console.error('Error deleting certificate files:', error);
      throw error;
    }
  }

  /**
   * Check if certificate is valid
   */
  static isValid(certificate: Certificate): boolean {
    if (!certificate.valid_until) return true;
    return new Date(certificate.valid_until) > new Date();
  }

  /**
   * Get certificates by skill ID
   */
  static async getBySkill(skillId: number): Promise<Certificate[]> {
    try {
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .select('*')
        .eq('skill_id', skillId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching certificates by skill:', error);
      throw error;
    }
  }
}