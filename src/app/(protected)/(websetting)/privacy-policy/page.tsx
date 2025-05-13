"use client";

import { useState, useEffect } from "react";
import { usePrivacyPolicy } from "@/src/hook/websetting/usePrivacyPolicy";
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

export default function PrivacyPolicyPage() {
  const { privacyPolicy, loading, savePrivacyPolicy } = usePrivacyPolicy();

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

  /* load initial data */
  useEffect(() => {
    if (!privacyPolicy) return;
    setTitle(privacyPolicy.title || {});
    setDescription(privacyPolicy.description || {});
  }, [privacyPolicy]);

  /* handler */
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
    const ok = await savePrivacyPolicy({ title, description });
    setIsSaving(false);
    ok
      ? alert.success("Privacy Policy berhasil disimpan!")
      : alert.error("Gagal menyimpan Privacy Policy");
  };

  /* ui */
  if (isLoading) return <PageLoader text="Memuat Privacy Policy..." />;

  return (
    <div className="space-y-8">
      {/* header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-border">
        <SectionTitle
          title="Pengaturan Privacy Policy"
          subtitle="Kelola konten kebijakan privasi"
        />
        <LanguageSwitcher
          activeLanguage={activeLanguage}
          languages={languages}
          onLanguageChange={setActiveLanguage}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ---------- form ---------- */}
        <div className="lg:col-span-2 space-y-8">
          <HeroCard className="p-6">
            <FormSection title="Informasi Privacy Policy">
              <MultilingualInput
                label="Judul Kebijakan Privasi"
                value={title[activeLanguage] || ""}
                onChange={handleTitleChange}
                language={activeLanguage}
                placeholder={`Masukkan judul dalam bahasa ${
                  activeLanguage === "en" ? "Inggris" : "Indonesia"
                }`}
              />

              <MultilingualTextarea
                label="Isi Kebijakan Privasi"
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

        {/* ---------- preview ---------- */}
        <div>
          <HeroCard className="sticky top-24">
            <div className="p-6 border-b border-border">
              <h3 className="text-lg font-medium">Preview Privacy Policy</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Tampilan kebijakan privasi
              </p>
            </div>

            <div className="p-6">
              <div className="rounded-lg border bg-primary/5 p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-primary">
                  {title[activeLanguage] || "Judul Kebijakan Privasi"}
                </h3>

                <div className="mt-4 text-sm text-muted-foreground prose-sm prose">
                  {description[activeLanguage] ? (
                    <div
                      dangerouslySetInnerHTML={{
                        __html: description[activeLanguage],
                      }}
                    />
                  ) : (
                    <p>
                      Deskripsi kebijakan privasi akan ditampilkan di sini...
                    </p>
                  )}
                </div>
              </div>
              <p className="mt-4 text-xs text-muted-foreground">
                Halaman ini akan tampil di menu Privacy Policy di situs Anda.
              </p>
            </div>
          </HeroCard>
        </div>
      </div>
    </div>
  );
}
