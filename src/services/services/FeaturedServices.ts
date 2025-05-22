import { createClient } from '@/src/utils/supabase/client';
import { FeaturedService, ServiceBenefit, FeaturedServiceBenefit, FeaturedServiceSkill } from '@/src/models/ServiceModels';
import { saveFile, deleteFile } from '@/src/utils/server/FileStorage';

const supabase = createClient();

export class FeaturedServiceService {
  private static TABLE = 'featured_services';
  private static BENEFIT_TABLE = 'service_benefits';
  private static BENEFIT_JUNCTION_TABLE = 'featured_service_benefits'; // Junction table untuk benefit
  private static SKILL_JUNCTION_TABLE = 'featured_service_skills'; // Junction table untuk skill
  private static SKILL_TABLE = 'skills';
  private static FOLDER = 'featured-icons';
  private static MAX_SIZE = 5 * 1024 * 1024;

  // GET ALL, support filter by skill/benefit, full search, sort & order
  static async getAll(params?: {
    benefitId?: number;
    skillId?: number;
    search?: string;
    sort?: 'created_at';
    order?: 'asc' | 'desc';
  }): Promise<FeaturedService[]> {
    try {
      // Basic query: select all featured services
      let q = supabase
        .from(this.TABLE)
        .select('*');

      // Add search filter if provided
      if (params?.search) {
        q = q.or(
          `title->en.ilike.%${params.search}%,title->id.ilike.%${params.search}%,` +
          `description->en.ilike.%${params.search}%,description->id.ilike.%${params.search}%,` +
          `preview_description->en.ilike.%${params.search}%,preview_description->id.ilike.%${params.search}%`
        );
      }

      // Sort and order
      q = q.order(params?.sort ?? 'created_at', {
        ascending: params?.order === 'asc',
      });

      // Execute the query
      const { data: services, error } = await q;
      if (error) throw error;

      // If we need to filter by benefitId or skillId, we'll do it after getting the basic results
      let filteredServices = services || [];
      
      // Apply benefit filter if needed
      if (params?.benefitId && filteredServices.length > 0) {
        // Get benefit junctions that match the benefitId
        const { data: benefitJunctions } = await supabase
          .from(this.BENEFIT_JUNCTION_TABLE)
          .select('featured_service_id')
          .eq('benefit_id', params.benefitId);
        
        // Extract service IDs from benefit junctions
        const serviceIds = benefitJunctions?.map(b => b.featured_service_id).filter(Boolean) || [];
        
        // Filter services by these IDs
        filteredServices = filteredServices.filter(svc => serviceIds.includes(svc.id));
      }
      
      // Apply skill filter if needed
      if (params?.skillId && filteredServices.length > 0) {
        // Get skill junctions that match the skillId
        const { data: skillJunctions } = await supabase
          .from(this.SKILL_JUNCTION_TABLE)
          .select('featured_service_id')
          .eq('skill_id', params.skillId);
        
        // Extract service IDs from skill junctions
        const serviceIds = skillJunctions?.map(rel => rel.featured_service_id) || [];
        
        // Filter services by these IDs
        filteredServices = filteredServices.filter(svc => serviceIds.includes(svc.id));
      }

      return filteredServices;
    } catch (err) {
      console.error('Error fetching featured services:', err);
      throw err;
    }
  }

  // GET BY ID, include daftar benefit & skills
  static async getById(id: number): Promise<any> {
    try {
      if (!id || isNaN(id)) {
        throw new Error(`Invalid ID: ${id}`);
      }

      console.log(`Fetching featured service with ID: ${id}`);

      // First, get the featured service
      const { data: service, error: serviceError } = await supabase
        .from(this.TABLE)
        .select('*')
        .eq('id', id)
        .single();
        
      if (serviceError) {
        console.error(`Error fetching service with ID ${id}:`, serviceError);
        throw serviceError;
      }
      
      if (!service) {
        console.error(`Service with ID ${id} not found`);
        throw new Error(`Featured service with ID ${id} not found`);
      }
      
      console.log(`Service found:`, service);
      
      // Get benefit junctions for this service
      const { data: benefitJunctions, error: benefitJunctionsError } = await supabase
        .from(this.BENEFIT_JUNCTION_TABLE)
        .select('benefit_id')
        .eq('featured_service_id', id);
        
      if (benefitJunctionsError) {
        console.error(`Error fetching benefit junctions for service ${id}:`, benefitJunctionsError);
        throw benefitJunctionsError;
      }
      
      console.log(`Benefit junctions found:`, benefitJunctions);
      
      // Fetch the actual benefits
      let benefits = [];
      if (benefitJunctions && benefitJunctions.length > 0) {
        const benefitIds = benefitJunctions.map(junc => junc.benefit_id);
        
        const { data: benefitsData, error: benefitsError } = await supabase
          .from(this.BENEFIT_TABLE)
          .select('*')
          .in('id', benefitIds);
          
        if (benefitsError) {
          console.error(`Error fetching benefits for service ${id}:`, benefitsError);
          throw benefitsError;
        }
        
        benefits = benefitsData || [];
        console.log(`Benefits found:`, benefits);
      }
      
      // Get skill junctions for this service
      const { data: skillJunctions, error: skillJunctionsError } = await supabase
        .from(this.SKILL_JUNCTION_TABLE)
        .select('skill_id')
        .eq('featured_service_id', id);
        
      if (skillJunctionsError) {
        console.error(`Error fetching skill junctions for service ${id}:`, skillJunctionsError);
        throw skillJunctionsError;
      }
      
      console.log(`Skill junctions found:`, skillJunctions);
      
      // Fetch the actual skills
      let skills = [];
      if (skillJunctions && skillJunctions.length > 0) {
        const skillIds = skillJunctions.map(junc => junc.skill_id);
        
        const { data: skillsData, error: skillsDataError } = await supabase
          .from(this.SKILL_TABLE)
          .select('*')
          .in('id', skillIds);
          
        if (skillsDataError) {
          console.error(`Error fetching skills for service ${id}:`, skillsDataError);
          throw skillsDataError;
        }
        
        skills = skillsData || [];
        console.log(`Skills found:`, skills);
      }
      
      // Return the complete service with relations
      return {
        ...service,
        benefits: benefits || [],
        skills: skills || []
      };
    } catch (err) {
      console.error('Error getting featured service by ID:', err);
      throw err;
    }
  }

  // CREATE, include array benefit & skill
  static async create(
    svc: Omit<FeaturedService, 'id' | 'created_at' | 'updated_at'> & {
      benefitIds?: number[];
      skillIds?: number[];
    },
    iconFile?: File
  ): Promise<any> {
    try {
      console.log("Creating featured service...");
      
      // Step 1: Prepare the data
      const now = new Date().toISOString();
      let icon = svc.icon || '';
      
      // Step 2: Handle icon upload if provided
      if (iconFile) {
        try {
          console.log("Uploading icon file...");
          icon = await this.uploadIcon(iconFile);
          console.log("Icon uploaded successfully:", icon);
        } catch (uploadErr) {
          console.error("Icon upload failed:", uploadErr);
          throw new Error(`Icon upload failed: ${uploadErr instanceof Error ? uploadErr.message : 'Unknown error'}`);
        }
      }
      
      // Step 3: Create the service object
      const serviceData = {
        title: svc.title,
        preview_description: svc.preview_description,
        description: svc.description,
        icon,
        created_at: now,
        updated_at: now
      };
      
      // Step 4: Insert into database
      try {
        console.log("Inserting service into database...");
        const { data, error } = await supabase
          .from(this.TABLE)
          .insert(serviceData)
          .select()
          .single();
        
        if (error) {
          console.error("Database insert error:", error);
          throw new Error(`Database error: ${error.message}`);
        }
        
        if (!data || !data.id) {
          throw new Error("Failed to create service: No data returned");
        }
        
        console.log("Service created successfully with ID:", data.id);
        
        // Step 5: Handle benefit junctions
        if (svc.benefitIds && svc.benefitIds.length > 0) {
          console.log("Creating benefit junctions...");
          const benefitJunctions = svc.benefitIds.map(benefitId => ({
            featured_service_id: data.id,
            benefit_id: benefitId
          }));
          
          const { error: benefitJunctionError } = await supabase
            .from(this.BENEFIT_JUNCTION_TABLE)
            .insert(benefitJunctions);
          
          if (benefitJunctionError) {
            console.warn(`Failed to create benefit junctions:`, benefitJunctionError);
          }
        }
        
        // Step 6: Handle skill junctions
        if (svc.skillIds && svc.skillIds.length > 0) {
          console.log("Creating skill junctions...");
          const skillJunctions = svc.skillIds.map(skillId => ({
            featured_service_id: data.id,
            skill_id: skillId
          }));
          
          const { error: skillJunctionError } = await supabase
            .from(this.SKILL_JUNCTION_TABLE)
            .insert(skillJunctions);
          
          if (skillJunctionError) {
            console.warn(`Failed to create skill junctions:`, skillJunctionError);
          }
        }
        
        // Step 7: Return the complete service using our fixed getById method
        return this.getById(data.id);
      } catch (dbErr) {
        console.error("Database operation failed:", dbErr);
        throw dbErr;
      }
    } catch (err) {
      console.error("Create service failed:", err);
      throw err;
    }
  }

  // UPDATE, bisa update benefit/skills, icon, field lain
  static async update(
    id: number,
    svc: Partial<FeaturedService> & {
      benefitIds?: number[];
      skillIds?: number[];
    },
    newIcon?: File
  ): Promise<any> {
    try {
      console.log(`Updating featured service with ID: ${id}`);
      
      // Validate IDs if provided
      if (svc.benefitIds) {
        await this.validateBenefitIds(svc.benefitIds);
      }
      
      if (svc.skillIds) {
        await this.validateSkillIds(svc.skillIds);
      }

      // Create a clean update object without relation IDs
      const update: Partial<FeaturedService> = {
        updated_at: new Date().toISOString()
      };
      
      // Only include fields that are actually being updated
      if (svc.title) update.title = svc.title;
      if (svc.preview_description) update.preview_description = svc.preview_description;
      if (svc.description) update.description = svc.description;
      
      // Handle icon update
      if (newIcon) {
        try {
          console.log("Uploading new icon file...");
          const old = await this.getById(id);
          // Only delete if it's an actual file path (not a CSS class) and it exists
          if (old?.icon && !this.isValidIconClass(old.icon) && old.icon.includes('/uploads/')) {
            console.log(`Deleting old icon: ${old.icon}`);
            // Strip any leading slash for consistency with deleteFile function
            const cleanPath = old.icon.startsWith('/') ? old.icon.substring(1) : old.icon;
            await this.deleteIcon(cleanPath);
          }
          update.icon = await this.uploadIcon(newIcon);
          console.log(`New icon uploaded: ${update.icon}`);
        } catch (iconErr) {
          console.error("Error handling icon update:", iconErr);
          throw new Error(`Icon update failed: ${iconErr instanceof Error ? iconErr.message : 'Unknown error'}`);
        }
      } else if (svc.icon) {
        update.icon = svc.icon;
      }

      // Update the service record
      console.log(`Updating service with data:`, update);
      const { data, error } = await supabase
        .from(this.TABLE)
        .update(update)
        .eq('id', id)
        .select()
        .single();
        
      if (error) {
        console.error(`Error updating service ${id}:`, error);
        throw error;
      }
      
      if (!data) {
        throw new Error(`Service with ID ${id} not found or could not be updated`);
      }
      
      console.log(`Service updated successfully:`, data);

      // Handle benefit junctions if provided
      if (svc.benefitIds && svc.benefitIds.length >= 0) {
        try {
          console.log(`Updating benefit junctions for service ${id}`);
          
          // First, delete all existing benefit junctions for this service
          const { error: deleteError } = await supabase
            .from(this.BENEFIT_JUNCTION_TABLE)
            .delete()
            .eq('featured_service_id', id);
            
          if (deleteError) {
            console.warn(`Error deleting existing benefit junctions:`, deleteError);
          }
          
          // Then insert the new benefit junctions
          if (svc.benefitIds.length > 0) {
            const benefitJunctions = svc.benefitIds.map(benefitId => ({
              featured_service_id: id,
              benefit_id: benefitId
            }));
            
            const { error: insertError } = await supabase
              .from(this.BENEFIT_JUNCTION_TABLE)
              .insert(benefitJunctions);
              
            if (insertError) {
              console.warn(`Error inserting benefit junctions:`, insertError);
            }
          }
        } catch (benefitErr) {
          console.error(`Error updating benefit junctions:`, benefitErr);
          // Continue execution even if benefit junctions fail
        }
      }

      // Handle skill junctions if provided
      if (svc.skillIds && svc.skillIds.length >= 0) {
        try {
          console.log(`Updating skill junctions for service ${id}`);
          
          // First, delete all existing skill junctions for this service
          const { error: deleteError } = await supabase
            .from(this.SKILL_JUNCTION_TABLE)
            .delete()
            .eq('featured_service_id', id);
            
          if (deleteError) {
            console.warn(`Error deleting existing skill junctions:`, deleteError);
          }
          
          // Then insert the new skill junctions
          if (svc.skillIds.length > 0) {
            const skillJunctions = svc.skillIds.map(skillId => ({
              featured_service_id: id,
              skill_id: skillId
            }));
            
            const { error: insertError } = await supabase
              .from(this.SKILL_JUNCTION_TABLE)
              .insert(skillJunctions);
              
            if (insertError) {
              console.warn(`Error inserting skill junctions:`, insertError);
            }
          }
        } catch (skillErr) {
          console.error(`Error updating skill junctions:`, skillErr);
          // Continue execution even if skill junctions fail
        }
      }

      // Return the updated service with all its relations
      return this.getById(id);
    } catch (err) {
      console.error(`Error updating featured service ${id}:`, err);
      throw err;
    }
  }

  static async delete(id: number) {
    try {
      console.log(`Deleting featured service with ID: ${id}`);
      
      // Hapus icon jika ada
      const svc = await this.getById(id);
      if (svc?.icon && !this.isValidIconClass(svc.icon) && svc.icon.includes('/uploads/')) {
        console.log(`Deleting icon: ${svc.icon}`);
        // Strip any leading slash for consistency with deleteFile function
        const cleanPath = svc.icon.startsWith('/') ? svc.icon.substring(1) : svc.icon;
        await this.deleteIcon(cleanPath);
      }

      // Hapus relasi benefit di junction table
      const { error: benefitJunctionError } = await supabase
        .from(this.BENEFIT_JUNCTION_TABLE)
        .delete()
        .eq('featured_service_id', id);
        
      if (benefitJunctionError) {
        console.warn(`Error deleting benefit junctions for service ${id}:`, benefitJunctionError);
      }

      // Hapus relasi skill di junction table
      const { error: skillJunctionError } = await supabase
        .from(this.SKILL_JUNCTION_TABLE)
        .delete()
        .eq('featured_service_id', id);
        
      if (skillJunctionError) {
        console.warn(`Error deleting skill junctions for service ${id}:`, skillJunctionError);
      }

      // Hapus featured_services
      const { error } = await supabase
        .from(this.TABLE)
        .delete()
        .eq('id', id);
        
      if (error) {
        console.error(`Error deleting service ${id}:`, error);
        throw error;
      }
      
      console.log(`Service ${id} deleted successfully`);
      return true;
    } catch (err) {
      console.error(`Error deleting featured service ${id}:`, err);
      throw err;
    }
  }

  private static async validateBenefitIds(benefitIds: number[]) {
    if (!benefitIds.length) return;
    const { data } = await supabase.from(this.BENEFIT_TABLE).select('id').in('id', benefitIds);
    if (!data || data.length !== benefitIds.length) throw new Error('Beberapa benefit ID tidak valid');
  }

  private static async validateSkillIds(skillIds: number[]) {
    if (!skillIds.length) return;
    const { data } = await supabase.from(this.SKILL_TABLE).select('id').in('id', skillIds);
    if (!data || data.length !== skillIds.length) throw new Error('Beberapa skill ID tidak valid');
  }

  private static isValidIconClass(icon: string) {
    return /^(fa|bi|material-icons|icon-)/.test(icon);
  }

  private static async uploadIcon(file: File) {
    if (file.size > this.MAX_SIZE) throw new Error('File size exceeds 5 MB limit');
    return saveFile(file, { folder: this.FOLDER });
  }

  private static async deleteIcon(path: string) {
    await deleteFile(path);
  }

  static getIconUrl(path: string) {
    if (!path) return '';
    if (FeaturedServiceService.isValidIconClass(path)) return path;
    
    // Fix protocol-relative URLs
    if (path.startsWith('//')) {
      return `https:${path}`;
    }
    
    // Handle relative paths
    if (!path.startsWith('/') && !path.startsWith('http')) {
      return `/${path}`;
    }
    
    return path;
  }
}