import { createClient } from "@/src/utils/supabase/client";
import { PackagePricing } from "@/src/models/ServiceModels";
import { PackageBenefitService } from "@/src/services/services/PackageBenefitServices";
import { PackageExclusionService } from "@/src/services/services/PackageExclusionServices";

const supabase = createClient();

export class PackagePricingService {
  private static TABLE_NAME = 'package_pricing';
  private static BENEFIT_JUNCTION_TABLE = 'package_pricing_benefits';
  private static EXCLUSION_JUNCTION_TABLE = 'package_pricing_exclusions';

  static async getAll(params?: {
    search?: string;
    benefitId?: number;
    exclusionId?: number;
    sort?: 'price' | 'created_at';
    order?: 'asc' | 'desc';
    withRelations?: boolean;
  }): Promise<PackagePricing[]> {
    try {
      let query = supabase.from(this.TABLE_NAME).select('*');

      // Filter berdasarkan pencarian
      if (params?.search) {
        query = query.or(`
          title->en.ilike.%${params.search}%,
          title->id.ilike.%${params.search}%,
          description->en.ilike.%${params.search}%,
          description->id.ilike.%${params.search}%
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

      let filteredData = data || [];

      // Filter berdasarkan benefit ID jika ada
      if (params?.benefitId) {
        // Ambil package pricing IDs yang terkait dengan benefit ID ini
        const { data: benefitJunctions, error: benefitError } = await supabase
          .from(this.BENEFIT_JUNCTION_TABLE)
          .select('package_pricing_id')
          .eq('package_benefit_id', params.benefitId);

        if (benefitError) throw benefitError;
        if (!benefitJunctions || benefitJunctions.length === 0) return [];

        // Filter package pricing yang memiliki relasi dengan benefit
        const pricingIds = benefitJunctions.map(j => j.package_pricing_id);
        filteredData = filteredData.filter(pricing => pricingIds.includes(pricing.id));
      }

      // Filter berdasarkan exclusion ID jika ada
      if (params?.exclusionId) {
        // Ambil package pricing IDs yang terkait dengan exclusion ID ini
        const { data: exclusionJunctions, error: exclusionError } = await supabase
          .from(this.EXCLUSION_JUNCTION_TABLE)
          .select('package_pricing_id')
          .eq('package_exclusion_id', params.exclusionId);

        if (exclusionError) throw exclusionError;
        if (!exclusionJunctions || exclusionJunctions.length === 0) return [];

        // Filter package pricing yang memiliki relasi dengan exclusion
        const pricingIds = exclusionJunctions.map(j => j.package_pricing_id);
        filteredData = filteredData.filter(pricing => pricingIds.includes(pricing.id));
      }

      // Jika tidak perlu relasi, kembalikan data yang sudah difilter
      if (!params?.withRelations) {
        return filteredData;
      }

      // Ambil relasi untuk setiap package pricing
      const pricingWithRelations = await Promise.all(filteredData.map(async (pricing) => {
        const [benefits, exclusions] = await Promise.all([
          PackageBenefitService.getByPackagePricingId(pricing.id),
          PackageExclusionService.getByPackagePricingId(pricing.id)
        ]);

        return {
          ...pricing,
          benefits,
          exclusions
        };
      }));

      return pricingWithRelations;
    } catch (error) {
      console.error('Error fetching package pricing:', error);
      throw error;
    }
  }

  static async getById(id: number, withRelations = false): Promise<PackagePricing | null> {
    try {
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (!data) return null;

      if (!withRelations) {
        return data;
      }

      // Ambil relasi benefit dan exclusion
      const [benefits, exclusions] = await Promise.all([
        PackageBenefitService.getByPackagePricingId(id),
        PackageExclusionService.getByPackagePricingId(id)
      ]);

      return {
        ...data,
        benefits,
        exclusions
      };
    } catch (error) {
      console.error(`Error fetching package pricing with ID ${id}:`, error);
      throw error;
    }
  }

  static async create(
    pricing: Omit<PackagePricing, 'id' | 'created_at' | 'updated_at'> & {
      benefitIds?: number[];
      exclusionIds?: number[];
    }
  ): Promise<PackagePricing> {
    try {
      // Validasi harga
      if (!pricing.price || pricing.price <= 0) {
        throw new Error('Harga harus lebih besar dari 0');
      }

      // Pisahkan benefitIds dan exclusionIds dari data pricing
      const { benefitIds, exclusionIds, ...pricingData } = pricing;

      // Tambahkan timestamp
      const now = new Date().toISOString();

      // Insert data pricing
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .insert({
          ...pricingData,
          created_at: now,
          updated_at: now
        })
        .select()
        .single();

      if (error) throw error;

      // Link ke benefits jika ada
      if (benefitIds && benefitIds.length > 0) {
        await PackageBenefitService.linkToPackagePricing(data.id, benefitIds);
      }

      // Link ke exclusions jika ada
      if (exclusionIds && exclusionIds.length > 0) {
        await PackageExclusionService.linkToPackagePricing(data.id, exclusionIds);
      }

      // Ambil data lengkap dengan relasi
      return this.getById(data.id, true) as Promise<PackagePricing>;
    } catch (error) {
      console.error('Error creating package pricing:', error);
      throw error;
    }
  }

  static async update(
    id: number,
    pricing: Partial<PackagePricing> & {
      benefitIds?: number[];
      exclusionIds?: number[];
    }
  ): Promise<PackagePricing> {
    try {
      // Validasi harga jika ada
      if (pricing.price !== undefined && pricing.price <= 0) {
        throw new Error('Harga harus lebih besar dari 0');
      }

      // Pisahkan benefitIds dan exclusionIds dari data pricing
      const { benefitIds, exclusionIds, ...pricingData } = pricing;

      // Update data pricing
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .update({
          ...pricingData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Update links ke benefits jika ada
      if (benefitIds !== undefined) {
        await PackageBenefitService.linkToPackagePricing(id, benefitIds);
      }

      // Update links ke exclusions jika ada
      if (exclusionIds !== undefined) {
        await PackageExclusionService.linkToPackagePricing(id, exclusionIds);
      }

      // Ambil data lengkap dengan relasi
      return this.getById(id, true) as Promise<PackagePricing>;
    } catch (error) {
      console.error(`Error updating package pricing with ID ${id}:`, error);
      throw error;
    }
  }

  static async delete(id: number): Promise<void> {
    try {
      // Hapus dulu relasi di junction table
      const [deleteBenefitJunction, deleteExclusionJunction] = await Promise.all([
        supabase
          .from(this.BENEFIT_JUNCTION_TABLE)
          .delete()
          .eq('package_pricing_id', id),
        supabase
          .from(this.EXCLUSION_JUNCTION_TABLE)
          .delete()
          .eq('package_pricing_id', id)
      ]);

      if (deleteBenefitJunction.error) throw deleteBenefitJunction.error;
      if (deleteExclusionJunction.error) throw deleteExclusionJunction.error;

      // Hapus package pricing
      const { error } = await supabase
        .from(this.TABLE_NAME)
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error(`Error deleting package pricing with ID ${id}:`, error);
      throw error;
    }
  }

  static async bulkCreate(
    pricings: (Omit<PackagePricing, 'id' | 'created_at' | 'updated_at'> & {
      benefitIds?: number[];
      exclusionIds?: number[];
    })[]
  ): Promise<PackagePricing[]> {
    try {
      const results: PackagePricing[] = [];

      // Buat satu per satu untuk menangani relasi dengan benar
      for (const pricing of pricings) {
        const result = await this.create(pricing);
        results.push(result);
      }

      return results;
    } catch (error) {
      console.error('Error bulk creating package pricing:', error);
      throw error;
    }
  }

  static async bulkDelete(ids: number[]): Promise<void> {
    try {
      // Hapus satu per satu untuk memastikan relasi terhapus dengan benar
      for (const id of ids) {
        await this.delete(id);
      }
    } catch (error) {
      console.error('Error bulk deleting package pricing:', error);
      throw error;
    }
  }

  static formatPrice(price: number): string {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  }

  static formatDuration(duration: Record<string, any>): string {
    // Asumsi: format duration dalam bentuk { value: number, unit: string }
    if (!duration || typeof duration !== 'object') return '-';

    const value = duration.value;
    const unit = duration.unit;
    
    if (unit === 'year' || unit === 'tahun') {
      return `${value} ${value === 1 ? 'tahun' : 'tahun'}`;
    } else if (unit === 'month' || unit === 'bulan') {
      return `${value} ${value === 1 ? 'bulan' : 'bulan'}`;
    } else if (unit === 'day' || unit === 'hari') {
      return `${value} ${value === 1 ? 'hari' : 'hari'}`;
    }
    
    return `${value} ${unit}`;
  }
}