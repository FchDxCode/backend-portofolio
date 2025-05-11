import { createClient } from "@/src/utils/supabase/client";
import { PrivacyPolicy, TermsOfService, CookiePolicy } from "@/src/models/WebSettingModels";

type PolicyType = PrivacyPolicy | TermsOfService | CookiePolicy;

const supabase = createClient();

export class PolicyService {
  static async getPolicy<T extends PolicyType>(tableName: string): Promise<T | null> {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .order('id', { ascending: true })
        .limit(1)
        .single();

      if (error) throw error;
      return data as T;
    } catch (error) {
      console.error(`Error fetching ${tableName}:`, error);
      throw error;
    }
  }

  static async upsertPolicy<T extends PolicyType>(
    tableName: string,
    policy: Omit<T, 'id' | 'created_at' | 'updated_at'>
  ): Promise<T> {
    try {
      const existingPolicy = await this.getPolicy<T>(tableName);
      
      const policyData = { ...policy };
      const now = new Date().toISOString();

      let result;
      
      if (existingPolicy) {
        const { data, error } = await supabase
          .from(tableName)
          .update({
            ...policyData,
            updated_at: now
          })
          .eq('id', existingPolicy.id)
          .select()
          .single();

        if (error) throw error;
        result = data as T;
      } else {
        const { data, error } = await supabase
          .from(tableName)
          .insert({
            ...policyData,
            created_at: now,
            updated_at: now
          })
          .select()
          .single();

        if (error) throw error;
        result = data as T;
      }

      return result;
    } catch (error) {
      console.error(`Error upserting ${tableName}:`, error);
      throw error;
    }
  }

  static async getPrivacyPolicy(): Promise<PrivacyPolicy | null> {
    return this.getPolicy<PrivacyPolicy>('privacy_policy');
  }

  static async upsertPrivacyPolicy(
    policy: Omit<PrivacyPolicy, 'id' | 'created_at' | 'updated_at'>
  ): Promise<PrivacyPolicy> {
    return this.upsertPolicy<PrivacyPolicy>('privacy_policy', policy);
  }

  static async getTermsOfService(): Promise<TermsOfService | null> {
    return this.getPolicy<TermsOfService>('terms_of_service');
  }

  static async upsertTermsOfService(
    terms: Omit<TermsOfService, 'id' | 'created_at' | 'updated_at'>
  ): Promise<TermsOfService> {
    return this.upsertPolicy<TermsOfService>('terms_of_service', terms);
  }

  static async getCookiePolicy(): Promise<CookiePolicy | null> {
    return this.getPolicy<CookiePolicy>('cookie_policy');
  }

  static async upsertCookiePolicy(
    cookie: Omit<CookiePolicy, 'id' | 'created_at' | 'updated_at'>
  ): Promise<CookiePolicy> {
    return this.upsertPolicy<CookiePolicy>('cookie_policy', cookie);
  }
}