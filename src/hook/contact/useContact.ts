import { useState, useEffect } from 'react';
import { Contact } from '@/src/models/ContactModels';
import { ContactService } from '@/src/services/contact/ContactServices';

export const useContact = () => {
  const [contact, setContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchContact = async () => {
    try {
      setLoading(true);
      const data = await ContactService.get();
      setContact(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const saveContact = async (data: Partial<Contact>) => {
    try {
      setLoading(true);
      const updatedContact = await ContactService.save(data);
      setContact(updatedContact);
      setError(null);
      return updatedContact;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContact();
  }, []);

  return {
    contact,
    loading,
    error,
    saveContact,
    refreshContact: fetchContact
  };
};