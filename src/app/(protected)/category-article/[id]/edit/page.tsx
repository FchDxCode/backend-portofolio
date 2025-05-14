"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { PageHeader } from "@/src/components/multipage/PageHeader";
import { Button } from "@/src/components/multipage/Button";
import { FormSection } from "@/src/components/multipage/FormSection";
import { DetailView } from "@/src/components/multipage/DetailView";
import { ImageUpload } from "@/src/components/multipage/ImageUpload";
import { useArticleCategories } from "@/src/hook/article/useArticleCategory";
import { ArticleCategoryService } from "@/src/services/article/ArticleCategoryServices";
import { ArticleCategory } from "@/src/models/ArticleModels";

export default function CategoryArticleEditPage() {
  const router = useRouter();
  const params = useParams();
  const id = parseInt(params.id as string, 10);
  
  const { updateCategory, updateCategoryIcon } = useArticleCategories();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState<ArticleCategory | null>(null);
  
  // Form state
  const [titleId, setTitleId] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [subtitleId, setSubtitleId] = useState("");
  const [subtitleEn, setSubtitleEn] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [iconFile, setIconFile] = useState<File | null>(null);

  // Fetch category data
  useEffect(() => {
    const fetchCategory = async () => {
      try {
        setIsLoading(true);
        const data = await ArticleCategoryService.getById(id);
        setCategory(data);
        
        // Populate form with existing data
        if (data) {
          setTitleId(data.title?.id || "");
          setTitleEn(data.title?.en || "");
          setSubtitleId(data.subtitle?.id || "");
          setSubtitleEn(data.subtitle?.en || "");
          setIsActive(data.is_active || false);
        }
      } catch (err) {
        setError("Gagal memuat data kategori");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchCategory();
    }
  }, [id]);

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
      
      // Update category
      await updateCategory(id, categoryData);
      
      // Upload icon if selected
      if (iconFile) {
        await updateCategoryIcon(id, iconFile);
      }
      
      // Redirect to category list page
      router.push("/category-article");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan saat menyimpan perubahan");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-semibold text-destructive">Kategori tidak ditemukan</h2>
        <Button 
          variant="primary" 
          className="mt-4"
          onClick={() => router.push("/category-article")}
        >
          Kembali ke Daftar Kategori
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Kategori Artikel"
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
              Simpan Perubahan
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
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="titleId" className="text-sm font-medium block">
                      Judul (ID) <span className="text-destructive">*</span>
                    </label>
                    <input
                      id="titleId"
                      value={titleId}
                      onChange={(e) => setTitleId(e.target.value)}
                      className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                      placeholder="Masukkan judul dalam Bahasa Indonesia"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="titleEn" className="text-sm font-medium block">
                      Judul (EN)
                    </label>
                    <input
                      id="titleEn"
                      value={titleEn}
                      onChange={(e) => setTitleEn(e.target.value)}
                      className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                      placeholder="Masukkan judul dalam Bahasa Inggris"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="subtitleId" className="text-sm font-medium block">
                      Subtitle (ID)
                    </label>
                    <input
                      id="subtitleId"
                      value={subtitleId}
                      onChange={(e) => setSubtitleId(e.target.value)}
                      className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                      placeholder="Masukkan subtitle dalam Bahasa Indonesia"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="subtitleEn" className="text-sm font-medium block">
                      Subtitle (EN)
                    </label>
                    <input
                      id="subtitleEn"
                      value={subtitleEn}
                      onChange={(e) => setSubtitleEn(e.target.value)}
                      className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                      placeholder="Masukkan subtitle dalam Bahasa Inggris"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium block">Status</label>
                    <div className="flex items-center space-x-4">
                      <label className="flex items-center space-x-2">
                        <input
                          type="radio"
                          checked={isActive}
                          onChange={() => setIsActive(true)}
                          className="h-4 w-4 text-primary border-gray-300 focus:ring-primary"
                        />
                        <span>Aktif</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="radio"
                          checked={!isActive}
                          onChange={() => setIsActive(false)}
                          className="h-4 w-4 text-primary border-gray-300 focus:ring-primary"
                        />
                        <span>Tidak Aktif</span>
                      </label>
                    </div>
                  </div>
                </div>
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
              
              <div className="mt-8 pt-4 border-t border-border">
                <div className="text-xs text-muted-foreground">
                  <p>Dibuat: {category.created_at ? new Date(category.created_at).toLocaleString() : "-"}</p>
                  <p>Diperbarui: {category.updated_at ? new Date(category.updated_at).toLocaleString() : "-"}</p>
                </div>
              </div>
            </div>
          </div>
        </DetailView>
      </form>
    </div>
  );
}