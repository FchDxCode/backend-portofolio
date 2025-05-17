"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/src/components/multipage/PageHeader";
import { Button } from "@/src/components/multipage/Button";
import { FormSection } from "@/src/components/multipage/FormSection";
import { DetailView } from "@/src/components/multipage/DetailView";
import { useArticleTags } from "@/src/hook/article/useArticleTag";

export default function ArticleTagCreatePage() {
  const router = useRouter();
  const { createTag } = useArticleTags();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [titleId, setTitleId] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [isActive, setIsActive] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!titleId.trim()) {
      setError("Judul (ID) wajib diisi");
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      // Prepare tag data
      const tagData = {
        title: { id: titleId, en: titleEn },
        is_active: isActive
      };
      
      // Create tag
      await createTag(tagData);
      
      // Redirect to tag list page
      router.push("/article-tag");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan saat menyimpan tag");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tambah Tag Artikel"
        backUrl="/article-tag"
        actions={
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => router.push("/article-tag")}
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
              <FormSection title="Informasi Tag">
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
                    <p className="text-xs text-muted-foreground mt-2">
                      Tag yang aktif akan ditampilkan di situs blog
                    </p>
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