"use client";

import { useState, useEffect } from 'react';
import { useAbout } from '@/src/hook/useAbout';
import AboutHeroForm from '@/src/components/about-hero/AboutHeroForm';
import AboutHeroPreview from '@/src/components/about-hero/AboutHeroPreview';
import LanguageSelector from '@/src/components/about-hero/LanguageSelector';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/src/components/ui/tabs';
import { Loader2 } from 'lucide-react';

export default function AboutHeroPage() {
  const { about, loading, error, saveAbout, updateImages } = useAbout();
  const [activeTab, setActiveTab] = useState<string>("form");
  const [currentLang, setCurrentLang] = useState<string>("en");
  const [availableLanguages, setAvailableLanguages] = useState<string[]>(["en", "id"]);
  
  const handleLanguageChange = (lang: string) => {
    setCurrentLang(lang);
  };

  const handleAddLanguage = (lang: string) => {
    if (!availableLanguages.includes(lang)) {
      setAvailableLanguages([...availableLanguages, lang]);
    }
  };

  return (
    <div className="container mx-auto py-6 max-w-7xl">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">About Hero Section</h1>
          <p className="text-muted-foreground">
            Manage your about page hero section content and appearance
          </p>
        </div>
        
        <LanguageSelector 
          currentLang={currentLang} 
          languages={availableLanguages}
          onLanguageChange={handleLanguageChange}
          onAddLanguage={handleAddLanguage}
        />
      </div>
      
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 text-primary animate-spin mb-2" />
          <p className="text-muted-foreground">Loading content...</p>
        </div>
      ) : error ? (
        <div className="bg-destructive/10 border border-destructive/20 p-6 rounded-lg">
          <h3 className="text-lg font-medium text-destructive mb-2">Error loading data</h3>
          <p className="text-sm text-muted-foreground">{error.message}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 text-sm bg-background border rounded-md hover:bg-accent transition-colors"
          >
            Retry
          </button>
        </div>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="form">Edit Content</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>
          
          <TabsContent value="form">
            <AboutHeroForm 
              about={about} 
              currentLang={currentLang}
              availableLanguages={availableLanguages} 
              onSave={saveAbout} 
              onUpdateImages={updateImages} 
            />
          </TabsContent>
          
          <TabsContent value="preview">
            <AboutHeroPreview about={about} currentLang={currentLang} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}