"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { PageHeader } from "@/src/components/multipage/PageHeader";
import { Button } from "@/src/components/multipage/Button";
import { FormSection } from "@/src/components/multipage/FormSection";
import { DetailView } from "@/src/components/multipage/DetailView";
import { InputMultipage } from "@/src/components/multipage/InputMultipage";
import { useTechStackSkills } from "@/src/hook/services/useTechStackSkill";
import { TechStackSkillService } from "@/src/services/services/TechStackSkillServices";

// Define a type for the form data
type FormData = {
  title: { id: string; en: string };
};

export default function TechStackSkillEditPage() {
  const router = useRouter();
  const params = useParams();
  const id = parseInt(params.id as string);
  const { updateSkill } = useTechStackSkills();
  
  // Language tab state
  const [activeTab, setActiveTab] = useState<"id" | "en">("id");
  
  // Form state
  const [formData, setFormData] = useState<FormData>({
    title: { id: "", en: "" }
  });
  
  // UI state
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch skill data
  useEffect(() => {
    const fetchSkill = async () => {
      try {
        setIsLoading(true);
        const skill = await TechStackSkillService.getById(id);
        
        if (skill) {
          setFormData({
            title: {
              id: skill.title?.id || "",
              en: skill.title?.en || ""
            }
          });
        } else {
          setError("Skill tidak ditemukan");
        }
      } catch (err) {
        console.error("Error fetching skill:", err);
        setError("Gagal memuat data skill");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSkill();
  }, [id]);

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
    }
  };

  // Validate form
  const validateForm = () => {
    setError(null);
    
    if (!formData.title.id) {
      setError("Nama Skill (Indonesia) wajib diisi");
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
      
      await updateSkill(id, {
        title: formData.title
      });
      
      router.push("/tech-stack-skill");
    } catch (err) {
      console.error('Error updating tech stack skill:', err);
      setError(err instanceof Error ? err.message : "Terjadi kesalahan saat memperbarui skill");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Tech Stack Skill"
        backUrl="/tech-stack-skill"
        actions={
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => router.push("/tech-stack-skill")}
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
          <div className="grid grid-cols-1 gap-6">
            {/* Main content */}
            <div className="space-y-6">
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

              {/* Skill Information */}
              <FormSection title="Informasi Skill">
                <div className="space-y-4">
                  {/* Skill Name */}
                  <div className="space-y-2">
                    <InputMultipage 
                      value={formData.title[activeTab]}
                      onChange={(e) => handleInputChange("title", e.target.value, activeTab)}
                      label={`Nama Skill ${activeTab === "id" ? "(Indonesia)" : "(English)"}`}
                      language={activeTab}
                      required={activeTab === "id"}
                      placeholder={`Masukkan nama skill ${activeTab === "id" ? "dalam Bahasa Indonesia" : "in English"}`}
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