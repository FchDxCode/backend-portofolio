"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/src/components/multipage/PageHeader";
import { Button } from "@/src/components/multipage/Button";
import { FormSection } from "@/src/components/multipage/FormSection";
import { DetailView } from "@/src/components/multipage/DetailView";
import { ImageUpload } from "@/src/components/multipage/ImageUpload";
import { useArticleCategories } from "@/src/hook/article/useArticleCategory";
import { InputMultipage } from "@/src/components/multipage/InputMultipage";
import { RadioButtonMultipage } from "@/src/components/multipage/RadioButtonMultipage";

export default function CategoryArticleCreatePage() {
  const router = useRouter();
  const { createCategory, updateCategoryIcon } = useArticleCategories();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [titleId, setTitleId] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [subtitleId, setSubtitleId] = useState("");
  const [subtitleEn, setSubtitleEn] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [iconFile, setIconFile] = useState<File | null>(null);

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
        title: { id: titleId, en: titleEn },
        subtitle: { id: subtitleId, en: subtitleEn },
        is_active: isActive
      };
      
      // Create category
      const newCategory = await createCategory(categoryData);
      
      // Upload icon if selected
      if (iconFile && newCategory.id) {
        try {
          console.log('Uploading icon file:', iconFile); // Debug
          const formData = new FormData();
          formData.append('file', iconFile);
          
          await updateCategoryIcon(newCategory.id, iconFile);
          console.log('Icon uploaded successfully'); // Debug
        } catch (iconError) {
          console.error('Error uploading icon:', iconError);
          // Tetap lanjutkan meski upload icon gagal
        }
      }
      
      // Redirect to category list page
      router.push("/category-article");
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
        title="Tambah Kategori Artikel"
        backUrl="/category-article"
        actions={
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => router.push("/category-article")}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <FormSection title="Informasi Dasar">
                    <InputMultipage
                      value={titleId}
                      onChange={(e) => setTitleId(e.target.value)}
                      label="Judul (ID)"
                      language="id"
                      required={true}
                    />
                  
                    <InputMultipage
                      value={titleEn}
                      onChange={(e) => setTitleEn(e.target.value)}
                      label="Judul (EN)"
                      language="en"
                      required={true}
                    />
                  
                  <InputMultipage
                      value={subtitleId}
                      onChange={(e) => setSubtitleId(e.target.value)}
                      label="Subtitle (ID)"
                      language="id"
                      required={true}
                    />
                  
                    <InputMultipage
                      value={subtitleEn}
                      onChange={(e) => setSubtitleEn(e.target.value)}
                      label="Subtitle (EN)"
                      language="en"
                      required={true}
                    />
                    
                    <RadioButtonMultipage
                      label="Status"
                      value={isActive.toString()}
                      onChange={(value) => setIsActive(value === "true")}
                      options={[
                        { value: "true", label: "Aktif" },
                        { value: "false", label: "Tidak Aktif" }
                      ]}
                    />
                        
              </FormSection>
            </div>
            
            <div className="space-y-6">
              <FormSection title="Icon Kategori">
                <div className="space-y-2">
                <ImageUpload
                    label="Upload Icon"
                    description="Format: JPG, PNG, SVG (Ukuran maks: 2MB, Rekomendasi: 128x128px)"
                    value={iconFile}
                    onChange={setIconFile}
                    maxSize={2}
                    aspectRatio="square"
                    previewSize="medium"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Icon akan digunakan untuk merepresentasikan kategori di berbagai tampilan pada website.
                  </p>
                </div>
              </FormSection>
            </div>
          </div>
        </DetailView>
      </form>
    </div>
  );
}