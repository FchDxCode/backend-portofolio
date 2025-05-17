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
import { InputMultipage } from "@/src/components/multipage/InputMultipage";
import { RadioButtonMultipage } from "@/src/components/multipage/RadioButtonMultipage";

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
                    <InputMultipage
                      value={titleId}
                      onChange={(e) => setTitleId(e.target.value)}
                      label="Judul (ID)"
                      language="id"
                      required={true}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <InputMultipage
                      value={titleEn}
                      onChange={(e) => setTitleEn(e.target.value)}
                      label="Judul (EN)"
                      language="en"
                      required={true}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <RadioButtonMultipage 
                      label="Status"
                      value={isActive.toString()}
                      onChange={(value) => setIsActive(value === "true")}
                      options={[
                        { value: "true", label: "Aktif" },
                        { value: "false", label: "Tidak Aktif" }
                      ]}
                    />
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