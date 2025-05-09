import { createClient } from "@/src/utils/supabase/client";
import { Contact } from "@/src/models/ContactModels";

const supabase = createClient();

export class ContactService {
  private static TABLE_NAME = 'contacts';

  /**
   * Get the singleton contact data
   */
  static async get(): Promise<Contact | null> {
    try {
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .select('*')
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching contact:', error);
      throw error;
    }
  }

  /**
   * Create or update the singleton contact
   */
  static async save(contact: Partial<Contact>): Promise<Contact> {
    try {
      // Validate email format
      if (contact.email && !this.isValidEmail(contact.email)) {
        throw new Error('Invalid email format');
      }

      // Validate phone number format
      if (contact.no_phone && !this.isValidPhone(contact.no_phone)) {
        throw new Error('Invalid phone number format');
      }

      const existingContact = await this.get();

      if (existingContact) {
        // Update
        const { data, error } = await supabase
          .from(this.TABLE_NAME)
          .update({
            ...contact,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingContact.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Create
        const { data, error } = await supabase
          .from(this.TABLE_NAME)
          .insert({
            ...contact,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    } catch (error) {
      console.error('Error saving contact:', error);
      throw error;
    }
  }

  /**
   * Validate email format
   */
  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate phone number format
   * Accepts formats: +1234567890, 1234567890, +62-812-3456-7890
   */
  private static isValidPhone(phone: string): boolean {
    const phoneRegex = /^[+]?[\d-\s]+$/;
    return phoneRegex.test(phone);
  }
}