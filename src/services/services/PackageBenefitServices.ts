import { createClient } from "@/src/utils/supabase/client";
import { PackageBenefit } from "@/src/models/ServiceModels";

const supabase = createClient();

export class PackageBenefitService {
  private static TABLE_NAME = 'package_benefits';
  private static JUNCTION_TABLE = 'package_pricing_benefits';

  static async getAll(params?: {
    search?: string;
    packagePricingId?: number;
    sort?: 'created_at';
    order?: 'asc' | 'desc';
  }): Promise<PackageBenefit[]> {
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

      // Jika tidak ada filter package pricing, kembalikan semua benefit
      if (!params?.packagePricingId) {
        return data || [];
      }

      // Jika ada filter packagePricingId, ambil benefit melalui junction table
      const { data: junctionData, error: junctionError } = await supabase
        .from(this.JUNCTION_TABLE)
        .select('package_benefit_id')
        .eq('package_pricing_id', params.packagePricingId);

      if (junctionError) throw junctionError;
      if (!junctionData || junctionData.length === 0) return [];

      // Filter benefit berdasarkan junction data
      const benefitIds = junctionData.map(j => j.package_benefit_id);
      return data?.filter(benefit => benefitIds.includes(benefit.id)) || [];
    } catch (error) {
      console.error('Error fetching package benefits:', error);
      throw error;
    }
  }

  static async getById(id: number): Promise<PackageBenefit | null> {
    try {
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error(`Error fetching package benefit with ID ${id}:`, error);
      throw error;
    }
  }

  static async create(benefit: Omit<PackageBenefit, 'id' | 'created_at' | 'updated_at'>): Promise<PackageBenefit> {
    try {
      const now = new Date().toISOString();
      
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .insert({
          ...benefit,
          created_at: now,
          updated_at: now
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating package benefit:', error);
      throw error;
    }
  }

  static async update(id: number, benefit: Partial<PackageBenefit>): Promise<PackageBenefit> {
    try {
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .update({
          ...benefit,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error(`Error updating package benefit with ID ${id}:`, error);
      throw error;
    }
  }

  static async delete(id: number): Promise<void> {
    try {
      // Hapus dulu relasi di junction table
      const { error: junctionError } = await supabase
        .from(this.JUNCTION_TABLE)
        .delete()
        .eq('package_benefit_id', id);

      if (junctionError) throw junctionError;

      // Hapus benefit
      const { error } = await supabase
        .from(this.TABLE_NAME)
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error(`Error deleting package benefit with ID ${id}:`, error);
      throw error;
    }
  }

  static async getByPackagePricingId(packagePricingId: number): Promise<PackageBenefit[]> {
    try {
      // Ambil ID benefit dari junction table
      const { data: junctionData, error: junctionError } = await supabase
        .from(this.JUNCTION_TABLE)
        .select('package_benefit_id')
        .eq('package_pricing_id', packagePricingId);

      if (junctionError) throw junctionError;
      if (!junctionData || junctionData.length === 0) return [];

      // Ambil detail benefit
      const benefitIds = junctionData.map(j => j.package_benefit_id);
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .select('*')
        .in('id', benefitIds);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error(`Error fetching benefits for package pricing ${packagePricingId}:`, error);
      throw error;
    }
  }

  static async linkToPackagePricing(packagePricingId: number, benefitIds: number[]): Promise<void> {
    try {
      // Validasi dulu semua ID benefit
      const { data: existingBenefits, error: validationError } = await supabase
        .from(this.TABLE_NAME)
        .select('id')
        .in('id', benefitIds);

      if (validationError) throw validationError;
      
      // Pastikan semua benefit valid
      if (existingBenefits?.length !== benefitIds.length) {
        throw new Error(`Some benefit IDs do not exist: ${benefitIds.join(', ')}`);
      }

      // Hapus dulu relasi yang ada
      const { error: deleteError } = await supabase
        .from(this.JUNCTION_TABLE)
        .delete()
        .eq('package_pricing_id', packagePricingId);

      if (deleteError) throw deleteError;

      // Buat array relasi baru
      const junctionRecords = benefitIds.map(benefitId => ({
        package_pricing_id: packagePricingId,
        package_benefit_id: benefitId
      }));

      // Insert relasi baru
      const { error: insertError } = await supabase
        .from(this.JUNCTION_TABLE)
        .insert(junctionRecords);

      if (insertError) throw insertError;
    } catch (error) {
      console.error(`Error linking benefits to package pricing ${packagePricingId}:`, error);
      throw error;
    }
  }
}