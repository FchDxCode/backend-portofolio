import { createClient } from "@/src/utils/supabase/client";
import { Contact } from "@/src/models/ContactModels";

const supabase = createClient();

export class ContactService {
  private static TABLE_NAME = 'contacts';

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

  static async save(contact: Partial<Contact>): Promise<Contact> {
    try {
      if (contact.email && !this.isValidEmail(contact.email)) {
        throw new Error('Invalid email format');
      }

      if (contact.no_phone && !this.isValidPhone(contact.no_phone)) {
        throw new Error('Invalid phone number format');
      }

      const existingContact = await this.get();

      if (existingContact) {
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

  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private static isValidPhone(phone: string): boolean {
    const phoneRegex = /^[+]?[\d-\s]+$/;
    return phoneRegex.test(phone);
  }
}