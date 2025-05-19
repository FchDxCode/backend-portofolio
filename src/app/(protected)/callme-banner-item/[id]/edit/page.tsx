"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useCallmeBanner } from '@/src/hook/banner/useCallmeBanner';
import { CallmeBannerItem } from '@/src/models/BannerModels';
import { PageHeader } from "@/src/components/multipage/PageHeader";
import { Button } from "@/src/components/multipage/Button";
import { FormSection } from "@/src/components/multipage/FormSection";
import { DetailView } from "@/src/components/multipage/DetailView";
import { InputMultipage } from "@/src/components/multipage/InputMultipage";
import { Save } from 'lucide-react';
import { createClient } from "@/src/utils/supabase/client";

export default function CallMeBannerItemEdit() {
  const router = useRouter();
  const params = useParams();
  const itemId = Number(params.id);
  
  const { updateItem, refreshBanner } = useCallmeBanner();
  const supabase = createClient();
  
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [item, setItem] = useState<CallmeBannerItem | null>(null);
  const [formErrors, setFormErrors] = useState<string | null>(null);
  
  // Form state
  const [titleId, setTitleId] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [subtitleId, setSubtitleId] = useState("");
  const [subtitleEn, setSubtitleEn] = useState("");

  useEffect(() => {
    const fetchItem = async () => {
      try {
        setLoading(true);
        
        // Since there's no getById method in the service, we'll query directly
        const { data, error } = await supabase
          .from('callme_banner_items')
          .select('*')
          .eq('id', itemId)
          .single();
          
        if (error) throw error;
        
        if (data) {
          setItem(data as CallmeBannerItem);
          
          // Set form values
          setTitleId(data.title?.id || '');
          setTitleEn(data.title?.en || '');
          setSubtitleId(data.subtitle?.id || '');
          setSubtitleEn(data.subtitle?.en || '');
        } else {
          setFormErrors('Item tidak ditemukan');
        }
      } catch (err) {
        console.error('Error fetching item:', err);
        setFormErrors('Item tidak ditemukan atau terjadi kesalahan saat mengambil data');
      } finally {
        setLoading(false);
      }
    };
    
    if (itemId) {
      fetchItem();
    }
  }, [itemId, supabase]);

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
      
      await updateItem(itemId, {
        title: { id: titleId, en: titleEn },
        subtitle: { id: subtitleId, en: subtitleEn }
      });
      
      await refreshBanner();
      router.push('/callme-banner-item');
    } catch (err) {
      console.error('Error updating item:', err);
      setFormErrors('Terjadi kesalahan saat memperbarui data');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Edit Call Me Banner Item"
          backUrl="/callme-banner-item"
        />
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Edit Call Me Banner Item"
          backUrl="/callme-banner-item"
        />
        <div className="bg-destructive/10 text-destructive p-4 rounded-md">
          Item tidak ditemukan
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Call Me Banner Item"
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
              <FormSection title="Informasi Detail">
                <div className="space-y-4">
                  <div className="p-4 bg-muted/50 rounded-md">
                    <h4 className="font-medium mb-2">Petunjuk</h4>
                    <p className="text-sm text-muted-foreground">
                      Item ini akan ditampilkan pada banner Call Me di halaman depan website. 
                      Pastikan judul dan subtitle yang dimasukkan sesuai dengan konten yang ingin ditampilkan.
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-card rounded-md border border-border">
                      <p className="text-xs font-medium text-muted-foreground mb-1">ID</p>
                      <p className="text-sm font-medium">{item.id}</p>
                    </div>
                    
                    <div className="p-3 bg-card rounded-md border border-border">
                      <p className="text-xs font-medium text-muted-foreground mb-1">Banner ID</p>
                      <p className="text-sm font-medium">{item.banner_id}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {item.created_at && (
                      <div className="p-3 bg-card rounded-md border border-border">
                        <p className="text-xs font-medium text-muted-foreground mb-1">Dibuat</p>
                        <p className="text-sm">{new Date(item.created_at).toLocaleString('id-ID')}</p>
                      </div>
                    )}
                    
                    {item.updated_at && (
                      <div className="p-3 bg-card rounded-md border border-border">
                        <p className="text-xs font-medium text-muted-foreground mb-1">Diperbarui</p>
                        <p className="text-sm">{new Date(item.updated_at).toLocaleString('id-ID')}</p>
                      </div>
                    )}
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