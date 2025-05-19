"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCallmeBanner } from '@/src/hook/banner/useCallmeBanner';
import { PageHeader } from "@/src/components/multipage/PageHeader";
import { Button } from "@/src/components/multipage/Button";
import { FormSection } from "@/src/components/multipage/FormSection";
import { DetailView } from "@/src/components/multipage/DetailView";
import { InputMultipage } from "@/src/components/multipage/InputMultipage";
import { Save } from 'lucide-react';

export default function CallMeBannerItemNew() {
  const router = useRouter();
  const { banner, loading, createItem, refreshBanner } = useCallmeBanner();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<string | null>(null);
  
  // Form state
  const [titleId, setTitleId] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [subtitleId, setSubtitleId] = useState("");
  const [subtitleEn, setSubtitleEn] = useState("");

  const validateForm = () => {
    if (!titleId.trim() && !titleEn.trim()) {
      setFormErrors('Judul harus diisi minimal dalam satu bahasa');
      return false;
    }
    setFormErrors(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setIsSubmitting(true);
      
      if (!banner?.id) {
        setFormErrors('Banner tidak ditemukan');
        return;
      }
      
      await createItem({
        banner_id: banner.id,
        title: { id: titleId, en: titleEn },
        subtitle: { id: subtitleId, en: subtitleEn }
      });
      
      // Reset form and redirect back to list
      await refreshBanner();
      router.push('/callme-banner-item');
    } catch (err) {
      console.error('Error saving item:', err);
      setFormErrors('Terjadi kesalahan saat menyimpan data');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tambah Call Me Banner Item"
        backUrl="/callme-banner-item"
        actions={
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => router.push("/callme-banner-item")}
            >
              Batal
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              isLoading={isSubmitting}
              icon={<Save size={16} />}
            >
              Simpan
            </Button>
          </div>
        }
      />

      {formErrors && (
        <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm">
          {formErrors}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <DetailView>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <FormSection title="Informasi Item">
                <InputMultipage
                  value={titleId}
                  onChange={(e) => setTitleId(e.target.value)}
                  label="Judul (ID)"
                  language="id"
                  placeholder="Masukkan judul dalam Bahasa Indonesia"
                />
              
                <InputMultipage
                  value={titleEn}
                  onChange={(e) => setTitleEn(e.target.value)}
                  label="Judul (EN)"
                  language="en"
                  placeholder="Enter title in English"
                />
              
                <InputMultipage
                  value={subtitleId}
                  onChange={(e) => setSubtitleId(e.target.value)}
                  label="Subtitle (ID)"
                  language="id"
                  placeholder="Masukkan subtitle dalam Bahasa Indonesia"
                />
              
                <InputMultipage
                  value={subtitleEn}
                  onChange={(e) => setSubtitleEn(e.target.value)}
                  label="Subtitle (EN)"
                  language="en"
                  placeholder="Enter subtitle in English"
                />
              </FormSection>
            </div>
            
            <div className="space-y-6">
              <FormSection title="Informasi Tambahan">
                <div className="p-4 bg-muted/50 rounded-md">
                  <h4 className="font-medium mb-2">Petunjuk</h4>
                  <p className="text-sm text-muted-foreground">
                    Item ini akan ditampilkan pada banner Call Me di halaman depan website. 
                    Pastikan judul dan subtitle yang dimasukkan sesuai dengan konten yang ingin ditampilkan.
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