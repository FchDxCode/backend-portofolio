"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/src/components/multipage/PageHeader";
import { Button } from "@/src/components/multipage/Button";
import { FormSection } from "@/src/components/multipage/FormSection";
import { DetailView } from "@/src/components/multipage/DetailView";
import { InputMultipage } from "@/src/components/multipage/InputMultipage";
import { useTestimonialCategories } from "@/src/hook/services/useTestimonialCategory";

type MultilingualFields = 'title';

interface FormData {
  title: {
    id: string;
    en: string;
  };
}

export default function NewTestimonialCategoryPage() {
  const router = useRouter();
  const { createCategory } = useTestimonialCategories();
  
  // Language tab state
  const [activeTab, setActiveTab] = useState<"id" | "en">("id");
  
  // Form state
  const [formData, setFormData] = useState<FormData>({
    title: {
      id: "",
      en: "",
    },
  });
  
  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (
    field: MultilingualFields,
    lang: "id" | "en",
    value: string
  ) => {
    setFormData({
      ...formData,
      [field]: {
        ...formData[field],
        [lang]: value,
      },
    });
  };

  // Validate form
  const validateForm = () => {
    setError(null);
    
    if (!formData.title.id && !formData.title.en) {
      setError("Judul harus diisi minimal dalam satu bahasa");
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      if (!validateForm()) {
        setIsSubmitting(false);
        return;
      }

      await createCategory({
        title: formData.title,
      });

      router.push("/testimonial-category");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal membuat kategori testimonial");
      console.error("Error creating testimonial category:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tambah Kategori Testimonial"
        backUrl="/testimonial-category"
        actions={
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => router.push("/testimonial-category")}
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

            {/* Category Information */}
            <FormSection title="Informasi Kategori">
              <div className="space-y-4">
                {/* Category Title */}
                <div className="space-y-2">
                  <InputMultipage 
                    value={formData.title[activeTab]}
                    onChange={(e) => handleInputChange("title", activeTab, e.target.value)}
                    label={`Judul Kategori ${activeTab === "id" ? "(Indonesia)" : "(English)"}`}
                    language={activeTab}
                    required={true}
                    placeholder={`Masukkan judul kategori ${activeTab === "id" ? "dalam Bahasa Indonesia" : "in English"}`}
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