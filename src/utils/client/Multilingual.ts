// src/utils/client/Multiliangual.ts

import { useState, useCallback } from 'react';

export type Language = {
  id: string;
  name: string;
};

const DEFAULT_LANGUAGES: Language[] = [
  { id: 'en', name: 'English' },
  { id: 'id', name: 'Indonesian' },
];

export function useMultilingualForm(initialLanguage = 'en', customLanguages?: Language[]) {
  const [activeLanguage, setActiveLanguage] = useState(initialLanguage);
  const languages = customLanguages || DEFAULT_LANGUAGES;

  // Helper to create multilingual field handler
  const createFieldHandler = useCallback((setter: React.Dispatch<React.SetStateAction<Record<string, any>>>) => {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { value } = e.target;
      setter(prev => ({
        ...prev,
        [activeLanguage]: value
      }));
    };
  }, [activeLanguage]);

  // Helper for direct value setting
  const setFieldValue = useCallback((setter: React.Dispatch<React.SetStateAction<Record<string, any>>>, value: string) => {
    setter(prev => ({
      ...prev,
      [activeLanguage]: value
    }));
  }, [activeLanguage]);

  return {
    activeLanguage,
    setActiveLanguage,
    languages,
    createFieldHandler,
    setFieldValue
  };
}