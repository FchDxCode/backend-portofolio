import { createClient } from "@/src/utils/supabase/client";
import { PackageExclusion } from "@/src/models/ServiceModels";

const supabase = createClient();

export class PackageExclusionService {
  private static TABLE_NAME = 'package_exclusions';
  private static JUNCTION_TABLE = 'package_pricing_exclusions';

  static async getAll(params?: {
    search?: string;
    packagePricingId?: number;
    sort?: 'created_at';
    order?: 'asc' | 'desc';
  }): Promise<PackageExclusion[]> {
    try {
      let query = supabase.from(this.TABLE_NAME).select('*');

      // Filter berdasarkan pencarian
      if (params?.search) {
        query = query.or(`
          title->en.ilike.%${params.search}%,
          title->id.ilike.%${params.search}%
        `);
      }

      // Sorting
      if (params?.sort) {
        query = query.order(params.sort, { ascending: params?.order === 'asc' });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query;
      if (error) throw error;

      // Jika tidak ada filter package pricing, kembalikan semua exclusion
      if (!params?.packagePricingId) {
        return data || [];
      }

      // Jika ada filter packagePricingId, ambil exclusion melalui junction table
      const { data: junctionData, error: junctionError } = await supabase
        .from(this.JUNCTION_TABLE)
        .select('package_exclusion_id')
        .eq('package_pricing_id', params.packagePricingId);

      if (junctionError) throw junctionError;
      if (!junctionData || junctionData.length === 0) return [];

      // Filter exclusion berdasarkan junction data
      const exclusionIds = junctionData.map(j => j.package_exclusion_id);
      return data?.filter(exclusion => exclusionIds.includes(exclusion.id)) || [];
    } catch (error) {
      console.error('Error fetching package exclusions:', error);
      throw error;
    }
  }

  static async getById(id: number): Promise<PackageExclusion | null> {
    try {
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error(`Error fetching package exclusion with ID ${id}:`, error);
      throw error;
    }
  }

  static async create(exclusion: Omit<PackageExclusion, 'id' | 'created_at' | 'updated_at'>): Promise<PackageExclusion> {
    try {
      const now = new Date().toISOString();
      
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .insert({
          ...exclusion,
          created_at: now,
          updated_at: now
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating package exclusion:', error);
      throw error;
    }
  }

  static async update(id: number, exclusion: Partial<PackageExclusion>): Promise<PackageExclusion> {
    try {
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .update({
          ...exclusion,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error(`Error updating package exclusion with ID ${id}:`, error);
      throw error;
    }
  }

  static async delete(id: number): Promise<void> {
    try {
      // Hapus dulu relasi di junction table
      const { error: junctionError } = await supabase
        .from(this.JUNCTION_TABLE)
        .delete()
        .eq('package_exclusion_id', id);

      if (junctionError) throw junctionError;

      // Hapus exclusion
      const { error } = await supabase
        .from(this.TABLE_NAME)
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error(`Error deleting package exclusion with ID ${id}:`, error);
      throw error;
    }
  }

  static async getByPackagePricingId(packagePricingId: number): Promise<PackageExclusion[]> {
    try {
      // Ambil ID exclusion dari junction table
      const { data: junctionData, error: junctionError } = await supabase
        .from(this.JUNCTION_TABLE)
        .select('package_exclusion_id')
        .eq('package_pricing_id', packagePricingId);

      if (junctionError) throw junctionError;
      if (!junctionData || junctionData.length === 0) return [];

      // Ambil detail exclusion
      const exclusionIds = junctionData.map(j => j.package_exclusion_id);
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .select('*')
        .in('id', exclusionIds);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error(`Error fetching exclusions for package pricing ${packagePricingId}:`, error);
      throw error;
    }
  }

  static async linkToPackagePricing(packagePricingId: number, exclusionIds: number[]): Promise<void> {
    try {
      // Validasi dulu semua ID exclusion
      const { data: existingExclusions, error: validationError } = await supabase
        .from(this.TABLE_NAME)
        .select('id')
        .in('id', exclusionIds);

      if (validationError) throw validationError;
      
      // Pastikan semua exclusion valid
      if (existingExclusions?.length !== exclusionIds.length) {
        throw new Error(`Some exclusion IDs do not exist: ${exclusionIds.join(', ')}`);
      }

      // Hapus dulu relasi yang ada
      const { error: deleteError } = await supabase
        .from(this.JUNCTION_TABLE)
        .delete()
        .eq('package_pricing_id', packagePricingId);

      if (deleteError) throw deleteError;

      // Buat array relasi baru
      const junctionRecords = exclusionIds.map(exclusionId => ({
        package_pricing_id: packagePricingId,
        package_exclusion_id: exclusionId
      }));

      // Insert relasi baru
      const { error: insertError } = await supabase
        .from(this.JUNCTION_TABLE)
        .insert(junctionRecords);

      if (insertError) throw insertError;
    } catch (error) {
      console.error(`Error linking exclusions to package pricing ${packagePricingId}:`, error);
      throw error;
    }
  }
}