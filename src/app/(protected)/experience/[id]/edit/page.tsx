"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { PageHeader } from "@/src/components/multipage/PageHeader";
import { Button } from "@/src/components/multipage/Button";
import { FormSection } from "@/src/components/multipage/FormSection";
import { DetailView } from "@/src/components/multipage/DetailView";
import { InputMultipage } from "@/src/components/multipage/InputMultipage";
import { ExperienceService } from "@/src/services/experience/ExperienceServices";
import { useExperiences } from "@/src/hook/experience/useExperience";
import { useExperienceCategories } from "@/src/hook/experience/useExperienceCategory";
import { ImageUpload } from "@/src/components/multipage/ImageUpload";
import { DropdownMultipage } from "@/src/components/multipage/DropdownMultipage";
import { saveFile } from "@/src/utils/server/FileStorage";
import { useSkills } from "@/src/hook/skill/useSkill";

// Define a type for the form data
type FormData = {
  title: { id: string; en: string };
  subtitle: { id: string; en: string };
  description: { id: string; en: string };
  key_achievements: { id: string; en: string };
  location: { id: string; en: string };
  experience_long: number;
  company_link: string;
  company_logo: string;
  experience_category_id: number | undefined;
  skillIds: number[];
};

// Define a type for fields that have language support
type MultilingualFields = 'title' | 'subtitle' | 'description' | 'key_achievements' | 'location';

export default function ExperienceEdit() {
  const router = useRouter();
  const params = useParams();
  const experienceId = Number(params.id);
  
  const { updateExperience } = useExperiences();
  const { categories } = useExperienceCategories();
  const { skills, loading: skillsLoading } = useSkills();
  
  // Language tab state
  const [activeTab, setActiveTab] = useState<"id" | "en">("id");
  
  // Form state
  const [formData, setFormData] = useState<FormData>({
    title: { id: "", en: "" },
    subtitle: { id: "", en: "" },
    description: { id: "", en: "" },
    key_achievements: { id: "", en: "" },
    location: { id: "", en: "" },
    experience_long: 0,
    company_link: "",
    company_logo: "",
    experience_category_id: undefined,
    skillIds: []
  });
  
  // Logo file state
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [currentLogoUrl, setCurrentLogoUrl] = useState<string | null>(null);
  
  // UI state
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExperience = async () => {
      try {
        setIsLoading(true);
        const experience = await ExperienceService.getById(experienceId, true);
        
        if (experience) {
          // Set form values
          setFormData({
            title: { 
              id: experience.title?.id || "", 
              en: experience.title?.en || "" 
            },
            subtitle: { 
              id: experience.subtitle?.id || "", 
              en: experience.subtitle?.en || "" 
            },
            description: { 
              id: experience.description?.id || "", 
              en: experience.description?.en || "" 
            },
            key_achievements: { 
              id: experience.key_achievements?.id || "", 
              en: experience.key_achievements?.en || "" 
            },
            location: { 
              id: experience.location?.id || "", 
              en: experience.location?.en || "" 
            },
            experience_long: experience.experience_long || 0,
            company_link: experience.company_link || "",
            company_logo: experience.company_logo || "",
            experience_category_id: experience.experience_category_id,
            skillIds: experience.skillIds || []
          });
          
          // Set current logo URL if it exists
          if (experience.company_logo) {
            setCurrentLogoUrl(experience.company_logo);
          }
        } else {
          setError("Pengalaman tidak ditemukan");
          setTimeout(() => router.push("/experience"), 2000);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal memuat data pengalaman");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchExperience();
  }, [experienceId, router]);

  // Handle input change
  const handleInputChange = (field: keyof FormData, value: any, lang?: "id" | "en") => {
    if (lang) {
      // Check if the field is a multilingual field
      if (['title', 'subtitle', 'description', 'key_achievements', 'location'].includes(field)) {
        setFormData(prev => ({
          ...prev,
          [field]: {
            ...prev[field as MultilingualFields],
            [lang]: value
          }
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  // Handle skills change specifically
  const handleSkillsChange = (value: string | number | (string | number)[]) => {
    // If it's already an array, use it, otherwise create a new array with the single value
    const values = Array.isArray(value) ? value : [value];
    
    // Convert all values to numbers
    const numericValues = values.map(val => 
      typeof val === 'string' ? parseInt(val, 10) : val
    );
    
    setFormData(prev => ({
      ...prev,
      skillIds: numericValues as number[]
    }));
  };

  // Validate form
  const validateForm = () => {
    // Reset error
    setError(null);
    
    // Required fields validation
    if (!formData.title.id) {
      setError("Nama Perusahaan (Indonesia) wajib diisi");
      return false;
    }
    
    if (!formData.subtitle.id) {
      setError("Posisi/Jabatan (Indonesia) wajib diisi");
      return false;
    }
    
    if (!formData.experience_category_id) {
      setError("Kategori pengalaman wajib dipilih");
      return false;
    }
    
    return true;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Prepare the updated experience data excluding skillIds 
      // since it's handled separately by the service
      const { skillIds, ...experienceToUpdate } = { ...formData };
      
      // If logo file is selected, upload it
      if (logoFile) {
        const logoPath = await saveFile(logoFile, { 
          folder: "experience/company-logos",
          deletePrev: formData.company_logo
        });
        
        // Update the logo path in the form data
        experienceToUpdate.company_logo = logoPath;
      } else if (logoFile === null && currentLogoUrl) {
        // User clicked "remove" on the logo but there was a previous logo
        experienceToUpdate.company_logo = "";
      }
      
      // Update experience with skills
      await updateExperience(
        experienceId, 
        experienceToUpdate, 
        formData.skillIds
      );
      
      // Redirect to experience list
      router.push("/experience");
    } catch (err) {
      console.error('Error updating experience:', err);
      setError(err instanceof Error ? err.message : "Terjadi kesalahan saat menyimpan pengalaman");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || skillsLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Pengalaman Kerja"
        backUrl="/experience"
        actions={
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => router.push("/experience")}
            >
              Batal
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              isLoading={isSubmitting}
            >
              Simpan
            </Button>
          </div>
        }
      />

      {error && (
        <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <DetailView>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Main content - 2/3 width */}
            <div className="md:col-span-2 space-y-6">
              {/* Language tabs */}
              <div className="flex border-b border-gray-200">
                <button
                  type="button"
                  onClick={() => setActiveTab("id")}
                  className={`py-2 px-4 ${
                    activeTab === "id"
                      ? "border-b-2 border-primary font-medium"
                      : "text-muted-foreground"
                  }`}
                >
                  Bahasa Indonesia
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("en")}
                  className={`py-2 px-4 ${
                    activeTab === "en"
                      ? "border-b-2 border-primary font-medium"
                      : "text-muted-foreground"
                  }`}
                >
                  English
                </button>
              </div>

              {/* Company Information */}
              <FormSection title="Informasi Perusahaan">
                <div className="space-y-4">
                  {/* Company Name */}
                  <div className="space-y-2">
                    <InputMultipage 
                      value={formData.title[activeTab]}
                      onChange={(e) => handleInputChange("title", e.target.value, activeTab)}
                      label={`Nama Perusahaan ${activeTab === "id" ? "(Indonesia)" : "(English)"}`}
                      language={activeTab}
                      required={activeTab === "id"}
                      placeholder={`Masukkan nama perusahaan ${activeTab === "id" ? "dalam Bahasa Indonesia" : "in English"}`}
                    />
                  </div>

                  {/* Company Link */}
                  <div className="space-y-2">
                    <InputMultipage 
                      value={formData.company_link}
                      onChange={(e) => handleInputChange("company_link", e.target.value)}
                      label="Website Perusahaan"
                      placeholder="https://example.com"
                      type="url"
                    />
                  </div>
                </div>
              </FormSection>

              {/* Position Information */}
              <FormSection title="Informasi Posisi">
                <div className="space-y-4">
                  {/* Position/Title */}
                  <div className="space-y-2">
                    <InputMultipage 
                      value={formData.subtitle[activeTab]}
                      onChange={(e) => handleInputChange("subtitle", e.target.value, activeTab)}
                      label={`Posisi/Jabatan ${activeTab === "id" ? "(Indonesia)" : "(English)"}`}
                      language={activeTab}
                      required={activeTab === "id"}
                      placeholder={`Masukkan posisi ${activeTab === "id" ? "dalam Bahasa Indonesia" : "in English"}`}
                    />
                  </div>

                  {/* Location */}
                  <div className="space-y-2">
                    <InputMultipage 
                      value={formData.location[activeTab]}
                      onChange={(e) => handleInputChange("location", e.target.value, activeTab)}
                      label={`Lokasi ${activeTab === "id" ? "(Indonesia)" : "(English)"}`}
                      language={activeTab}
                      placeholder={`Masukkan lokasi ${activeTab === "id" ? "dalam Bahasa Indonesia" : "in English"}`}
                    />
                  </div>
                </div>
              </FormSection>

              {/* Description */}
              <FormSection title="Deskripsi">
                <div className="space-y-2">
                  <InputMultipage 
                    value={formData.description[activeTab]}
                    onChange={(e) => handleInputChange("description", e.target.value, activeTab)}
                    label={`Deskripsi ${activeTab === "id" ? "(Indonesia)" : "(English)"}`}
                    language={activeTab}
                    multiline={true}
                    rows={5}
                    placeholder={`Masukkan deskripsi pengalaman ${activeTab === "id" ? "dalam Bahasa Indonesia" : "in English"}`}
                  />
                </div>
              </FormSection>

              {/* Key Achievements */}
              <FormSection title="Pencapaian Utama">
                <div className="space-y-2">
                  <InputMultipage 
                    value={formData.key_achievements[activeTab]}
                    onChange={(e) => handleInputChange("key_achievements", e.target.value, activeTab)}
                    label={`Pencapaian Utama ${activeTab === "id" ? "(Indonesia)" : "(English)"}`}
                    language={activeTab}
                    multiline={true}
                    rows={5}
                    placeholder={`Masukkan pencapaian utama ${activeTab === "id" ? "dalam Bahasa Indonesia" : "in English"}`}
                    helperText="Tuliskan pencapaian utama selama bekerja di perusahaan ini"
                  />
                </div>
              </FormSection>
            </div>

            {/* Sidebar - 1/3 width */}
            <div className="space-y-6">
              {/* Company Logo */}
              <FormSection title="Logo Perusahaan">
                <ImageUpload
                  onChange={(file) => {
                    setLogoFile(file);
                    // kalau file = null, berarti user klik hapus → clear URL lama juga
                    if (file === null) {
                      setCurrentLogoUrl(null);
                    }
                  }}
                  value={logoFile || currentLogoUrl}
                  maxSize={5}
                  aspectRatio="square"
                  label="Unggah Logo"
                  description="Format: JPG, PNG, WebP. Maks 5MB."
                />
              </FormSection>

              {/* Experience Settings */}
              <FormSection title="Pengaturan Pengalaman">
                <div className="space-y-4">
                  {/* Category */}
                  <div className="space-y-2">
                    <DropdownMultipage
                      label="Kategori Pengalaman"
                      value={formData.experience_category_id?.toString() || ""}
                      onChange={(value) => handleInputChange("experience_category_id", Number(value))}
                      options={categories.map(category => ({
                        value: category.id.toString(),
                        label: category.title?.id || category.title?.en || `Kategori ${category.id}`
                      }))}
                      placeholder="Pilih Kategori"
                      required={true}
                    />
                  </div>

                  {/* Duration */}
                  <div className="space-y-2">
                    <InputMultipage
                      value={formData.experience_long.toString()}
                      onChange={(e) => handleInputChange("experience_long", Number(e.target.value) || 0)}
                      label="Durasi (Tahun)"
                      type="number"
                      min={0}
                      placeholder="Masukkan durasi pengalaman dalam tahun"
                      helperText="Lama bekerja dalam tahun"
                    />
                  </div>
                  
                  {/* Skills */}
                  <div className="space-y-2">
                    <DropdownMultipage
                      label="Keterampilan Terkait"
                      value={formData.skillIds}
                      onChange={handleSkillsChange}
                      options={skills?.map(skill => ({
                        value: skill.id,
                        label: skill.title?.id || skill.title?.en || `Skill ${skill.id}`
                      })) || []}
                      placeholder="Pilih keterampilan terkait"
                      isMultiple={true}
                    />
                  </div>
                </div>
              </FormSection>
            </div>
          </div>
        </DetailView>
      </form>
    </div>
  );
}