"use client";

import { useState } from 'react';
import { ChevronDown, Globe, Plus } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/src/components/ui/popover';
import { Button } from '@/src/components/ui/button';

interface LanguageSelectorProps {
  currentLang: string;
  languages: string[];
  onLanguageChange: (lang: string) => void;
  onAddLanguage: (lang: string) => void;
}

export default function LanguageSelector({
  currentLang,
  languages,
  onLanguageChange,
  onAddLanguage
}: LanguageSelectorProps) {
  const [showAddLanguage, setShowAddLanguage] = useState(false);
  const [newLang, setNewLang] = useState('');
  
  // Common languages
  const availableLanguages = [
    { code: 'en', name: 'English' },
    { code: 'id', name: 'Indonesian' },
    { code: 'zh', name: 'Chinese' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' },
    { code: 'ar', name: 'Arabic' },
  ];
  
  // Get language name
  const getLanguageName = (code: string): string => {
    const lang = availableLanguages.find(l => l.code === code);
    return lang ? lang.name : code.toUpperCase();
  };
  
  // Handle add new language
  const handleAddLanguage = () => {
    if (newLang && !languages.includes(newLang)) {
      onAddLanguage(newLang);
      setNewLang('');
      setShowAddLanguage(false);
    }
  };

  return (
    <div>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            <span>{getLanguageName(currentLang)}</span>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-64 p-2">
          <div className="space-y-1">
            {showAddLanguage ? (
              <div className="p-2">
                <label className="block text-xs text-muted-foreground mb-1">Add new language</label>
                <div className="flex gap-2">
                  <select
                    value={newLang}
                    onChange={(e) => setNewLang(e.target.value)}
                    className="flex-1 h-9 rounded-md border bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="">Select language</option>
                    {availableLanguages
                      .filter(lang => !languages.includes(lang.code))
                      .map(lang => (
                        <option key={lang.code} value={lang.code}>
                          {lang.name} ({lang.code})
                        </option>
                      ))}
                  </select>
                  <button
                    onClick={handleAddLanguage}
                    disabled={!newLang}
                    className="h-9 px-3 rounded-md bg-primary text-primary-foreground shadow hover:bg-primary/90 disabled:opacity-50"
                  >
                    Add
                  </button>
                </div>
                <button
                  onClick={() => setShowAddLanguage(false)}
                  className="text-xs text-muted-foreground hover:text-primary mt-1 underline"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <>
                {languages.map(lang => (
                  <button
                    key={lang}
                    onClick={() => onLanguageChange(lang)}
                    className={`w-full flex items-center px-2 py-1.5 rounded-md text-sm ${
                      lang === currentLang
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-accent'
                    }`}
                  >
                    {getLanguageName(lang)}
                    <span className="text-xs ml-1 opacity-70">({lang})</span>
                  </button>
                ))}
                
                <div className="px-1 py-1 border-t mt-1 pt-1">
                  <button
                    onClick={() => setShowAddLanguage(true)}
                    className="w-full flex items-center gap-1 px-2 py-1.5 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-accent"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add language</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}