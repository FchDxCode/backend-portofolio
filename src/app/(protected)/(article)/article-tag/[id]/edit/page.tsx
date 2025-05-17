"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { PageHeader } from "@/src/components/multipage/PageHeader";
import { Button } from "@/src/components/multipage/Button";
import { FormSection } from "@/src/components/multipage/FormSection";
import { DetailView } from "@/src/components/multipage/DetailView";
import { useArticleTags } from "@/src/hook/article/useArticleTag";
import { Loader2 } from "lucide-react";
import { ArticleTagService } from "@/src/services/article/ArticleTagServices";

export default function ArticleTagEditPage() {
  const router = useRouter();
  const params = useParams();
  const tagId = parseInt(params.id as string);
  
  const { updateTag } = useArticleTags();
  
  // Form state
  const [titleId, setTitleId] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [isActive, setIsActive] = useState(true);
  
  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch tag data directly from service
  useEffect(() => {
    const fetchTag = async () => {
      if (!tagId || isNaN(tagId)) {
        setError("ID tag tidak valid");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        
        // Fetch tag directly from service instead of using hook state
        const tag = await ArticleTagService.getById(tagId);
        
        if (!tag) {
          setError("Tag tidak ditemukan");
          return;
        }
        
        // Populate form
        setTitleId(tag.title?.id || "");
        setTitleEn(tag.title?.en || "");
        setIsActive(tag.is_active || false);
        
      } catch (err) {
        setError("Gagal memuat data tag");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTag();
  }, [tagId]);

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
      
      // Update tag
      await updateTag(tagId, tagData);
      
      // Redirect to tag list page
      router.push("/article-tag");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan saat menyimpan tag");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Tag Artikel"
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
                      name="titleId"
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
                      name="titleEn"
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
                          id="status-active"
                          name="status"
                          checked={isActive}
                          onChange={() => setIsActive(true)}
                          className="h-4 w-4 text-primary border-gray-300 focus:ring-primary"
                        />
                        <span>Aktif</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="status-inactive"
                          name="status"
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