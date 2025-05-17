"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/src/components/multipage/PageHeader";
import { Button } from "@/src/components/multipage/Button";
import { FormSection } from "@/src/components/multipage/FormSection";
import { DetailView } from "@/src/components/multipage/DetailView";
import { useArticleTags } from "@/src/hook/article/useArticleTag";
import { InputMultipage } from "@/src/components/multipage/InputMultipage";
import { RadioButtonMultipage } from "@/src/components/multipage/RadioButtonMultipage";

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
                    <InputMultipage 
                      value={titleId}
                      onChange={(e) => setTitleId(e.target.value)}
                      label="Judul (ID)"
                      language="id"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <InputMultipage 
                      value={titleEn}
                      onChange={(e) => setTitleEn(e.target.value)}
                      label="Judul (EN)"
                      language="en"
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