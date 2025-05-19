"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/src/components/multipage/PageHeader";
import { Button } from "@/src/components/multipage/Button";
import { FormSection } from "@/src/components/multipage/FormSection";
import { DetailView } from "@/src/components/multipage/DetailView";
import { InputMultipage } from "@/src/components/multipage/InputMultipage";
import { useExperienceCategories } from "@/src/hook/experience/useExperienceCategory";

export default function CategoryExperienceNew() {
  const router = useRouter();
  const { createCategory } = useExperienceCategories();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [titleId, setTitleId] = useState("");
  const [titleEn, setTitleEn] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!titleId.trim()) {
      setError("Judul (ID) wajib diisi");
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      // Prepare category data
      const categoryData = {
        title: { id: titleId, en: titleEn }
      };
      
      // Create category
      await createCategory(categoryData);
      
      // Redirect to category list page
      router.push("/category-experience");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan saat menyimpan kategori");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tambah Kategori Pengalaman"
        backUrl="/category-experience"
        actions={
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => router.push("/category-experience")}
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
            <div className="space-y-6">
              <FormSection title="Informasi Kategori">
                <InputMultipage
                  value={titleId}
                  onChange={(e) => setTitleId(e.target.value)}
                  label="Judul (ID)"
                  language="id"
                  required={true}
                  placeholder="Masukkan judul kategori dalam Bahasa Indonesia"
                />
              
                <InputMultipage
                  value={titleEn}
                  onChange={(e) => setTitleEn(e.target.value)}
                  label="Judul (EN)"
                  language="en"
                  required={false}
                  placeholder="Masukkan judul kategori dalam Bahasa Inggris"
                />
              </FormSection>
            </div>
          </div>
        </DetailView>
      </form>
    </div>
  );
}