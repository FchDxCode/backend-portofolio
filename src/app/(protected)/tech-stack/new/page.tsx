"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/src/components/multipage/PageHeader";
import { Button } from "@/src/components/multipage/Button";
import { FormSection } from "@/src/components/multipage/FormSection";
import { DetailView } from "@/src/components/multipage/DetailView";
import { InputMultipage } from "@/src/components/multipage/InputMultipage";
import { DropdownMultipage } from "@/src/components/multipage/DropdownMultipage";
import { ImageUpload } from "@/src/components/multipage/ImageUpload";
import { useTechStacks } from "@/src/hook/services/useTechStack";
import { useTechStackSkills } from "@/src/hook/services/useTechStackSkill";

// Define a type for the form data
type FormData = {
  title: { id: string; en: string };
  icon?: string;
  tech_stack_skill_id?: number;
};

export default function TechStackNewPage() {
  const router = useRouter();
  const { createTechStack } = useTechStacks();
  const { skills, loading: skillsLoading } = useTechStackSkills();
  
  // Language tab state
  const [activeTab, setActiveTab] = useState<"id" | "en">("id");
  
  // Form state
  const [formData, setFormData] = useState<FormData>({
    title: { id: "", en: "" }
  });
  
  // Image state
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconType, setIconType] = useState<"file" | "class">("file");
  const [iconClass, setIconClass] = useState("");
  
  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle input change
  const handleInputChange = (field: keyof FormData, value: any, lang?: "id" | "en") => {
    if (lang) {
      setFormData(prev => ({
        ...prev,
        [field]: {
          ...prev[field as "title"],
          [lang]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  // Handle image change
  const handleImageChange = (file: File | null) => {
    setIconFile(file);
  };

  // Validate form
  const validateForm = () => {
    setError(null);
    
    if (!formData.title.id) {
      setError("Nama Tech Stack (Indonesia) wajib diisi");
      return false;
    }
    
    if (!formData.tech_stack_skill_id) {
      setError("Kategori skill wajib dipilih");
      return false;
    }
    
    if (iconType === "file" && !iconFile) {
      setError("Icon tech stack wajib diunggah");
      return false;
    }
    
    if (iconType === "class" && !iconClass) {
      setError("Class icon wajib diisi");
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
      
      const techStackData = {
        ...formData,
        icon: iconType === "class" ? iconClass : undefined
      };
      
      await createTechStack(
        techStackData,
        iconType === "file" ? iconFile || undefined : undefined
      );
      
      router.push("/tech-stack");
    } catch (err) {
      console.error('Error creating tech stack:', err);
      setError(err instanceof Error ? err.message : "Terjadi kesalahan saat menyimpan tech stack");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Prepare skill options for dropdown
  const skillOptions = skills.map(skill => ({
    value: skill.id.toString(),
    label: skill.title?.id || skill.title?.en || `Skill ${skill.id}`
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tambah Tech Stack"
        backUrl="/tech-stack"
        actions={
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => router.push("/tech-stack")}
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

              {/* Tech Stack Information */}
              <FormSection title="Informasi Tech Stack">
                <div className="space-y-4">
                  {/* Tech Stack Name */}
                  <div className="space-y-2">
                    <InputMultipage 
                      value={formData.title[activeTab]}
                      onChange={(e) => handleInputChange("title", e.target.value, activeTab)}
                      label={`Nama Tech Stack ${activeTab === "id" ? "(Indonesia)" : "(English)"}`}
                      language={activeTab}
                      required={activeTab === "id"}
                      placeholder={`Masukkan nama tech stack ${activeTab === "id" ? "dalam Bahasa Indonesia" : "in English"}`}
                    />
                  </div>
                  
                  {/* Skill Category */}
                  <div className="space-y-2">
                    <DropdownMultipage
                      label="Kategori Skill"
                      options={skillOptions}
                      value={formData.tech_stack_skill_id?.toString() || ""}
                      onChange={(value) => handleInputChange("tech_stack_skill_id", Number(value))}
                      placeholder="Pilih kategori skill"
                      required={true}
                    />
                  </div>
                </div>
              </FormSection>
            </div>

            {/* Sidebar - 1/3 width */}
            <div className="space-y-6">
              <FormSection title="Icon Tech Stack">
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <button
                      type="button"
                      onClick={() => setIconType("file")}
                      className={`px-3 py-1.5 text-sm rounded-md ${
                        iconType === "file" 
                          ? "bg-primary text-white" 
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      Upload File
                    </button>
                    <button
                      type="button"
                      onClick={() => setIconType("class")}
                      className={`px-3 py-1.5 text-sm rounded-md ${
                        iconType === "class" 
                          ? "bg-primary text-white" 
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      Class Icon
                    </button>
                  </div>
                  
                  {iconType === "file" ? (
                    <>
                      <ImageUpload
                        onChange={handleImageChange}
                        label="Unggah Icon Tech Stack"
                        value={iconFile}
                        maxSize={5 * 1024 * 1024} // 5MB
                        accept="image/*"
                      />
                      <p className="text-xs text-muted-foreground mt-2">
                        Format: JPG, PNG, SVG. Ukuran maksimal: 5MB.
                      </p>
                    </>
                  ) : (
                    <>
                      <InputMultipage
                        label="Class Icon"
                        value={iconClass}
                        onChange={(e) => setIconClass(e.target.value)}
                        placeholder="Contoh: fa fa-react, bi bi-code, material-icons code"
                        required
                      />
                      <p className="text-xs text-muted-foreground mt-2">
                        Gunakan class icon dari Font Awesome, Bootstrap Icons, atau Material Icons.
                      </p>
                    </>
                  )}
                </div>
              </FormSection>
            </div>
          </div>
        </DetailView>
      </form>
    </div>
  );
}