"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { PageHeader } from "@/src/components/multipage/PageHeader";
import { Button } from "@/src/components/multipage/Button";
import { FormSection } from "@/src/components/multipage/FormSection";
import { DetailView } from "@/src/components/multipage/DetailView";
import { InputMultipage } from "@/src/components/multipage/InputMultipage";
import { useServiceBenefits } from "@/src/hook/services/useBenefitServices";
import { ServiceBenefitService } from "@/src/services/services/BenefitServices";

// Define a type for the form data
type FormData = {
  title: { id: string; en: string };
};

export default function ServiceBenefitEditPage() {
  const router = useRouter();
  const params = useParams();
  const id = Number(params.id);
  const { updateBenefit } = useServiceBenefits();
  
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

  // Load benefit data
  useEffect(() => {
    const fetchBenefit = async () => {
      try {
        setIsLoading(true);
        const benefit = await ServiceBenefitService.getById(id);
        
        if (!benefit) {
          setError("Benefit tidak ditemukan");
          return;
        }
        
        setFormData({
          title: benefit.title as { id: string; en: string }
        });
      } catch (err) {
        console.error("Error fetching benefit:", err);
        setError("Gagal memuat data benefit");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchBenefit();
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
      setError("Judul Benefit (Indonesia) wajib diisi");
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
      
      await updateBenefit(id, {
        title: formData.title
      });
      
      router.push("/service-benefit");
    } catch (err) {
      console.error('Error updating benefit:', err);
      setError(err instanceof Error ? err.message : "Terjadi kesalahan saat memperbarui benefit");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Service Benefit"
        backUrl="/service-benefit"
        actions={
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => router.push("/service-benefit")}
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

            {/* Benefit Information */}
            <FormSection title="Informasi Benefit">
              <div className="space-y-4">
                {/* Benefit Title */}
                <div className="space-y-2">
                  <InputMultipage 
                    value={formData.title[activeTab]}
                    onChange={(e) => handleInputChange("title", e.target.value, activeTab)}
                    label={`Judul Benefit ${activeTab === "id" ? "(Indonesia)" : "(English)"}`}
                    language={activeTab}
                    required={activeTab === "id"}
                    placeholder={`Masukkan judul benefit ${activeTab === "id" ? "dalam Bahasa Indonesia" : "in English"}`}
                  />
                </div>
              </div>
            </FormSection>
          </div>
        </DetailView>
      </form>
    </div>
  );
}