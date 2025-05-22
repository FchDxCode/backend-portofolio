"use client";

import { useState, useEffect } from "react";
import { useMultilingualForm } from "@/src/utils/client/Multilingual";
import { ServiceHeroService } from "@/src/services/services/HeroServices";
import { ServiceHero } from "@/src/models/ServiceModels";
import { LanguageSwitcher } from "@/src/components/ui/multilingual/LanguageSwitcher";
import { MultilingualInput } from "@/src/components/ui/multilingual/MultilingualInput";
import { MultilingualTextarea } from "@/src/components/ui/multilingual/MultilingualTextArea";
import SectionTitle from "@/src/components/singleton/SectionTitle";
import FormSection from "@/src/components/singleton/FormSection";
import SaveButton from "@/src/components/singleton/SaveButton";
import FileUpload from "@/src/components/singleton/FileUpload";
import ImagePreview from "@/src/components/singleton/ImagePreview";
import { useAlert } from "@/src/components/ui/alert/AlertProvider";
import HeroCard from "@/src/components/singleton/HeroCard";

// Define multilingual fields
type MultilingualFields = "title" | "subtitle" | "description";

// Helper function to check if string is a valid icon class
const isValidIconClass = (icon: string) => {
  return /^(fa|bi|material-icons|icon-)/.test(icon);
};

export default function ServiceHeroPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [iconType, setIconType] = useState<"class" | "image">("class");
  const [iconFile, setIconFile] = useState<File | undefined>(undefined);
  const [iconPreview, setIconPreview] = useState<string | null>(null);
  const [serviceHero, setServiceHero] = useState<ServiceHero | null>(null);
  const [iconClass, setIconClass] = useState<string>("");
  
  // Multilingual form fields
  const [title, setTitle] = useState<Record<string, any>>({});
  const [subtitle, setSubtitle] = useState<Record<string, any>>({});
  const [description, setDescription] = useState<Record<string, any>>({});
  
  const { activeLanguage, setActiveLanguage, languages, createFieldHandler } = useMultilingualForm();
  const { success, error } = useAlert();

  // Buat handler untuk setiap field
  const handleTitleChange = createFieldHandler(setTitle);
  const handleSubtitleChange = createFieldHandler(setSubtitle);
  
  // Special handler for description to handle both string and event
  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement> | string) => {
    if (typeof e === 'string') {
      // Handle TipTap HTML string
      setDescription(prev => ({
        ...prev,
        [activeLanguage]: e
      }));
    } else {
      // Handle textarea event
      const value = e.target.value;
      setDescription(prev => ({
        ...prev,
        [activeLanguage]: value
      }));
    }
  };

  // Fetch service hero data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const data = await ServiceHeroService.getAll();
        if (data.length > 0) {
          const hero = data[0];
          setServiceHero(hero);
          
          // Set multilingual fields
          setTitle(hero.title || {});
          setSubtitle(hero.subtitle || {});
          setDescription(hero.description || {});
          
          // Determine icon type and set appropriate state
          if (hero.icon) {
            if (isValidIconClass(hero.icon)) {
              setIconType("class");
              setIconClass(hero.icon);
            } else {
              setIconType("image");
              setIconPreview(ServiceHeroService.getIconUrl(hero.icon));
            }
          }
        }
      } catch (err) {
        error("Failed to load service hero data");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [error]);

  // Handle icon file upload
  const handleIconFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIconFile(file);
      setIconType("image");
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = () => {
        setIconPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle icon type change
  const handleIconTypeChange = (type: "class" | "image") => {
    if (type === iconType) return;
    
    setIconType(type);
    
    // Clear the other type's data when switching
    if (type === "class") {
      // When switching to class, clear image data
      setIconFile(undefined);
      setIconPreview(null);
    } else {
      // When switching to image, clear class data
      setIconClass("");
    }
  };

  // Handle save
  const handleSave = async () => {
    try {
      setIsLoading(true);
      
      const heroData = {
        title,
        subtitle,
        description,
        icon: iconType === "class" ? iconClass : undefined
      };
      
      if (serviceHero?.id) {
        // Update existing hero
        await ServiceHeroService.update(
          serviceHero.id,
          heroData,
          iconType === "image" ? iconFile : undefined
        );
        success("Service hero berhasil diperbarui");
      } else {
        // Create new hero
        await ServiceHeroService.create(
          heroData as any,
          iconType === "image" ? iconFile : undefined
        );
        success("Service hero berhasil dibuat");
      }
    } catch (err) {
      error("Gagal menyimpan service hero");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header with breadcrumb and language switcher */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-border">
        <div>
          <SectionTitle 
            title="Pengaturan Service Hero" 
            subtitle="Kelola konten service hero section pada website" 
          />
        </div>
        <LanguageSwitcher
          activeLanguage={activeLanguage}
          languages={languages}
          onLanguageChange={setActiveLanguage}
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Section */}
        <div className="lg:col-span-2 space-y-8">
          <HeroCard className="p-6">
            <FormSection title="Informasi Utama">
              <MultilingualInput
                label="Judul"
                value={title[activeLanguage] || ''}
                onChange={handleTitleChange}
                language={activeLanguage}
              />
              
              <MultilingualInput
                label="Subjudul"
                value={subtitle[activeLanguage] || ''}
                onChange={handleSubtitleChange}
                language={activeLanguage}
              />
            </FormSection>
          </HeroCard>
          
          <HeroCard className="p-6">
            <FormSection title="Deskripsi">
              <MultilingualTextarea
                label="Deskripsi Service Hero"
                value={description[activeLanguage] || ''}
                onChange={handleDescriptionChange}
                language={activeLanguage}
                rows={6}
                useRichText={true}
              />
            </FormSection>
          </HeroCard>
          
          {/* Save Button Section */}
          <div className="flex justify-end">
            <SaveButton 
              onClick={handleSave} 
              isLoading={isLoading} 
            />
          </div>
        </div>
        
        {/* Preview Section */}
        <div>
          <HeroCard className="sticky top-24">
            <div className="p-6 border-b border-border">
              <h3 className="text-lg font-medium">Icon Service</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Icon untuk ditampilkan di service hero section
              </p>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="flex items-center space-x-4 mb-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    className="form-radio"
                    name="iconType"
                    checked={iconType === "class"}
                    onChange={() => handleIconTypeChange("class")}
                  />
                  <span className="ml-2">Icon Class</span>
                </label>
                
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    className="form-radio"
                    name="iconType"
                    checked={iconType === "image"}
                    onChange={() => handleIconTypeChange("image")}
                  />
                  <span className="ml-2">Upload Icon</span>
                </label>
              </div>
              
              {iconType === "class" ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Icon Class</label>
                    <input
                      type="text"
                      value={iconClass}
                      onChange={(e) => setIconClass(e.target.value)}
                      className="w-full rounded-md border border-input bg-background p-3 text-sm focus:border-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring transition-all duration-200"
                      placeholder="e.g. fa fa-star, bi bi-house, etc."
                    />
                  </div>
                  
                  {iconClass && (
                    <div className="mt-4 p-6 border border-dashed rounded-md flex justify-center items-center bg-gray-50 dark:bg-gray-800">
                      <i className={iconClass} style={{ fontSize: "3rem" }}></i>
                    </div>
                  )}
                  
                  <div className="pt-2">
                    <div className="text-xs text-muted-foreground">
                      <ul className="list-disc pl-4 space-y-1">
                        <li>Format: Font Awesome (fa), Bootstrap Icons (bi), Material Icons</li>
                        <li>Contoh: fa fa-star, bi bi-house, material-icons home</li>
                      </ul>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {iconPreview && (
                    <ImagePreview 
                      src={iconPreview} 
                      alt="Icon Preview" 
                    />
                  )}
                  
                  <div className="pt-4">
                    <FileUpload
                      label="Unggah Icon"
                      onChange={handleIconFileChange}
                      accept="image/*"
                    />
                  </div>
                  
                  <div className="pt-2">
                    <div className="text-xs text-muted-foreground">
                      <ul className="list-disc pl-4 space-y-1">
                        <li>Ukuran yang disarankan: 128×128 piksel</li>
                        <li>Format yang didukung: JPG, PNG, SVG</li>
                        <li>Ukuran maksimum: 1MB</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </HeroCard>
        </div>
      </div>
    </div>
  );
}