import { createClient } from "@/src/utils/supabase/client";
import { PackagePricing } from "@/src/models/ServiceModels";

const supabase = createClient();

export class PackagePricingService {
  private static TABLE_NAME = 'package_pricing';

  static async getAll(params?: {
    search?: string;
    benefitId?: number;
    exclusionId?: number;
    sort?: 'price' | 'work_duration' | 'created_at';
    order?: 'asc' | 'desc';
    withRelations?: boolean;
  }): Promise<PackagePricing[]> {
    try {
      // Query dasar tanpa relasi
      let query = supabase.from(this.TABLE_NAME).select('*');

      if (params?.search) {
        query = query.or(`
          title->en.ilike.%${params.search}%,
          title->id.ilike.%${params.search}%,
          description->en.ilike.%${params.search}%,
          description->id.ilike.%${params.search}%,
          tag.ilike.%${params.search}%
        `);
      }

      if (params?.benefitId) {
        query = query.eq('benefit_id', params.benefitId);
      }

      if (params?.exclusionId) {
        query = query.eq('exclusion_id', params.exclusionId);
      }

      if (params?.sort) {
        query = query.order(params.sort, { ascending: params.order === 'asc' });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query;
      if (error) throw error;
      
      // Jika tidak perlu relasi, langsung return
      if (!params?.withRelations || !data?.length) {
        return data || [];
      }
      
      // Jika perlu relasi, ambil data relasi secara terpisah
      const pricingWithRelations = await Promise.all(data.map(async (pricing) => {
        const [benefits, exclusions] = await Promise.all([
          pricing.benefit_id ? this.getBenefits(pricing.benefit_id) : null,
          pricing.exclusion_id ? this.getExclusions(pricing.exclusion_id) : null
        ]);
        
        return {
          ...pricing,
          package_benefits: benefits,
          package_exclusions: exclusions
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
      // Query dasar tanpa relasi
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (!data) return null;

      // Jika tidak perlu relasi, langsung return
      if (!withRelations) {
        return data;
      }
      
      // Jika perlu relasi, ambil data relasi secara terpisah
      const [benefits, exclusions] = await Promise.all([
        data.benefit_id ? this.getBenefitById(data.benefit_id) : null,
        data.exclusion_id ? this.getExclusionById(data.exclusion_id) : null
      ]);
      
      // Gabungkan data utama dengan relasi
      return {
        ...data,
        package_benefits: benefits,
        package_exclusions: exclusions
      };
    } catch (error) {
      console.error('Error fetching package pricing:', error);
      throw error;
    }
  }

  static async create(pricing: Omit<PackagePricing, 'id' | 'created_at' | 'updated_at'>): Promise<PackagePricing> {
    try {
      // Validate price
      if (!pricing.price || pricing.price <= 0) {
        throw new Error('Price must be greater than 0');
      }

      // Validate relations if provided
      if (pricing.benefit_id) {
        await this.validateBenefitExists(pricing.benefit_id);
      }
      if (pricing.exclusion_id) {
        await this.validateExclusionExists(pricing.exclusion_id);
      }

      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .insert({
          ...pricing,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating package pricing:', error);
      throw error;
    }
  }

  static async update(
    id: number,
    pricing: Partial<PackagePricing>
  ): Promise<PackagePricing> {
    try {
      // Validate price if provided
      if (pricing.price !== undefined && pricing.price <= 0) {
        throw new Error('Price must be greater than 0');
      }

      // Validate relations if provided
      if (pricing.benefit_id) {
        await this.validateBenefitExists(pricing.benefit_id);
      }
      if (pricing.exclusion_id) {
        await this.validateExclusionExists(pricing.exclusion_id);
      }

      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .update({
          ...pricing,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating package pricing:', error);
      throw error;
    }
  }

  static async delete(id: number): Promise<void> {
    try {
      const { error } = await supabase
        .from(this.TABLE_NAME)
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting package pricing:', error);
      throw error;
    }
  }

  static async bulkCreate(
    pricings: Omit<PackagePricing, 'id' | 'created_at' | 'updated_at'>[]
  ): Promise<PackagePricing[]> {
    try {
      // Validate all prices and relations
      for (const pricing of pricings) {
        if (!pricing.price || pricing.price <= 0) {
          throw new Error('All prices must be greater than 0');
        }
        if (pricing.benefit_id) {
          await this.validateBenefitExists(pricing.benefit_id);
        }
        if (pricing.exclusion_id) {
          await this.validateExclusionExists(pricing.exclusion_id);
        }
      }

      const pricingsData = pricings.map(pricing => ({
        ...pricing,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));

      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .insert(pricingsData)
        .select();

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error bulk creating package pricing:', error);
      throw error;
    }
  }

  static async bulkUpdate(
    updates: { id: number; data: Partial<PackagePricing> }[]
  ): Promise<PackagePricing[]> {
    try {
      const updatePromises = updates.map(async ({ id, data }) => {
        // Validate price if provided
        if (data.price !== undefined && data.price <= 0) {
          throw new Error(`Price must be greater than 0 for id: ${id}`);
        }

        // Validate relations if provided
        if (data.benefit_id) {
          await this.validateBenefitExists(data.benefit_id);
        }
        if (data.exclusion_id) {
          await this.validateExclusionExists(data.exclusion_id);
        }

        return this.update(id, data);
      });

      const results = await Promise.all(updatePromises);
      return results;
    } catch (error) {
      console.error('Error bulk updating package pricing:', error);
      throw error;
    }
  }

  static async bulkDelete(ids: number[]): Promise<void> {
    try {
      const { error } = await supabase
        .from(this.TABLE_NAME)
        .delete()
        .in('id', ids);

      if (error) throw error;
    } catch (error) {
      console.error('Error bulk deleting package pricing:', error);
      throw error;
    }
  }

  private static async validateBenefitExists(benefitId: number): Promise<void> {
    const { data } = await supabase
      .from('package_benefits')
      .select('id')
      .eq('id', benefitId)
      .single();

    if (!data) {
      throw new Error(`Benefit with id ${benefitId} does not exist`);
    }
  }

  private static async validateExclusionExists(exclusionId: number): Promise<void> {
    const { data } = await supabase
      .from('package_exclusions')
      .select('id')
      .eq('id', exclusionId)
      .single();

    if (!data) {
      throw new Error(`Exclusion with id ${exclusionId} does not exist`);
    }
  }

  static formatPrice(price: number): string {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(price);
  }

  static formatDuration(months: number): string {
    if (months >= 12 && months % 12 === 0) {
      const years = months / 12;
      return `${years} ${years === 1 ? 'year' : 'years'}`;
    }
    return `${months} ${months === 1 ? 'month' : 'months'}`;
  }

  // Helper methods untuk mengambil relasi
  private static async getBenefits(id: number) {
    const { data } = await supabase
      .from('package_benefits')
      .select('id,title,slug')
      .eq('id', id)
      .single();
    return data;
  }

  private static async getExclusions(id: number) {
    const { data } = await supabase
      .from('package_exclusions')
      .select('id,title,slug')
      .eq('id', id)
      .single();
    return data;
  }

  // Helper methods untuk mengambil relasi
  private static async getBenefitById(id: number) {
    const { data } = await supabase
      .from('package_benefits')
      .select('id,title,slug')
      .eq('id', id)
      .single();
    return data;
  }

  private static async getExclusionById(id: number) {
    const { data } = await supabase
      .from('package_exclusions')
      .select('id,title,slug')
      .eq('id', id)
      .single();
    return data;
  }
}