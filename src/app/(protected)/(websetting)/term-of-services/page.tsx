// src/app/(protected)/term-of-services/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useTermsOfService } from "@/src/hook/websetting/useTermOfServices";
import { useMultilingualForm } from "@/src/utils/client/Multilingual";
import { MinLoadingTime } from "@/src/utils/client/MinLoadingTime";
import { LanguageSwitcher } from "@/src/components/ui/multilingual/LanguageSwitcher";
import { MultilingualInput } from "@/src/components/ui/multilingual/MultilingualInput";
import { MultilingualTextarea } from "@/src/components/ui/multilingual/MultilingualTextArea";
import { useAlert } from "@/src/components/ui/alert/AlertProvider";
import { PageLoader } from "@/src/components/ui/Loader";

/* singleton UI */
import HeroCard from "@/src/components/singleton/HeroCard";
import SectionTitle from "@/src/components/singleton/SectionTitle";
import FormSection from "@/src/components/singleton/FormSection";
import SaveButton from "@/src/components/singleton/SaveButton";

export default function TermOfServicesPage() {
  const { termsOfService, loading, saveTermsOfService } = useTermsOfService();

  const [title, setTitle] = useState<Record<string, any>>({});
  const [description, setDescription] = useState<Record<string, any>>({});
  const [isSaving, setIsSaving] = useState(false);

  const isLoading = MinLoadingTime(loading, 2000);

  const {
    activeLanguage,
    setActiveLanguage,
    languages,
    createFieldHandler,
  } = useMultilingualForm();

  const alert = useAlert();

  /* initial load */
  useEffect(() => {
    if (!termsOfService) return;
    setTitle(termsOfService.title || {});
    setDescription(termsOfService.description || {});
  }, [termsOfService]);

  /* handlers */
  const handleTitleChange = createFieldHandler(setTitle);
  const handleDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement> | string
  ) => {
    const value = typeof e === "string" ? e : e.target.value;
    setDescription((prev) => ({ ...prev, [activeLanguage]: value }));
  };

  /* save */
  const handleSave = async () => {
    setIsSaving(true);
    const ok = await saveTermsOfService({ title, description });
    setIsSaving(false);
    ok
      ? alert.success("Terms of Service berhasil disimpan!")
      : alert.error("Gagal menyimpan Terms of Service");
  };

  /* ui */
  if (isLoading) return <PageLoader text="Memuat Terms of Service..." />;

  return (
    <div className="space-y-8">
      {/* header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-border">
        <SectionTitle
          title="Pengaturan Terms of Service"
          subtitle="Kelola konten syarat & ketentuan layanan"
        />
        <LanguageSwitcher
          activeLanguage={activeLanguage}
          languages={languages}
          onLanguageChange={setActiveLanguage}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* form */}
        <div className="lg:col-span-2 space-y-8">
          <HeroCard className="p-6">
            <FormSection title="Informasi Terms of Service">
              <MultilingualInput
                label="Judul Syarat Layanan"
                value={title[activeLanguage] || ""}
                onChange={handleTitleChange}
                language={activeLanguage}
                placeholder={`Masukkan judul dalam bahasa ${
                  activeLanguage === "en" ? "Inggris" : "Indonesia"
                }`}
              />

              <MultilingualTextarea
                label="Isi Syarat Layanan"
                value={description[activeLanguage] || ""}
                onChange={handleDescriptionChange}
                language={activeLanguage}
                rows={10}
                useRichText={true}
              />
            </FormSection>
          </HeroCard>

          <div className="flex justify-end">
            <SaveButton onClick={handleSave} isLoading={isSaving} />
          </div>
        </div>

        {/* preview */}
        <div>
          <HeroCard className="sticky top-24">
            <div className="p-6 border-b border-border">
              <h3 className="text-lg font-medium">Preview Terms of Service</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Tampilan syarat layanan
              </p>
            </div>

            <div className="p-6">
              <div className="rounded-lg border bg-primary/5 p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-primary">
                  {title[activeLanguage] || "Judul Syarat Layanan"}
                </h3>

                <div className="mt-4 text-sm text-muted-foreground prose-sm prose">
                  {description[activeLanguage] ? (
                    <div
                      dangerouslySetInnerHTML={{
                        __html: description[activeLanguage],
                      }}
                    />
                  ) : (
                    <p>Deskripsi syarat layanan akan ditampilkan di sini...</p>
                  )}
                </div>
              </div>
              <p className="mt-4 text-xs text-muted-foreground">
                Halaman ini akan tampil di menu Terms of Service di situs Anda.
              </p>
            </div>
          </HeroCard>
        </div>
      </div>
    </div>
  );
}
