// src/app/(protected)/web-setting/page.tsx
"use client";

import { useState, useEffect, ChangeEvent } from "react";
import { useWebSetting } from "@/src/hook/websetting/useWebSetting";
import { useMultilingualForm } from "@/src/utils/client/Multilingual";
import { MinLoadingTime } from "@/src/utils/client/MinLoadingTime";
import { LanguageSwitcher } from "@/src/components/ui/multilingual/LanguageSwitcher";
import { MultilingualInput } from "@/src/components/ui/multilingual/MultilingualInput";
import { useAlert } from "@/src/components/ui/alert/AlertProvider";
import { PageLoader } from "@/src/components/ui/Loader";

/* singleton UI */
import HeroCard from "@/src/components/singleton/HeroCard";
import SectionTitle from "@/src/components/singleton/SectionTitle";
import FormSection from "@/src/components/singleton/FormSection";
import SaveButton from "@/src/components/singleton/SaveButton";
import FileUpload from "@/src/components/singleton/FileUpload";
import DocumentUpload from "@/src/components/singleton/DocumentUpload";

export default function WebSettingPage() {
  const { webSetting, loading, saveWebSetting } = useWebSetting();

  const [titleWebsite, setTitleWebsite] = useState<Record<string, any>>({});
  const [copyright, setCopyright] = useState("");
  const [files, setFiles] = useState<{
    logoFile?: File;
    faviconFile?: File;
    cvIdFile?: File;
    cvEnFile?: File;
  }>({});

  const [isSaving, setIsSaving] = useState(false);
  const isLoading = MinLoadingTime(loading, 2000);

  const {
    activeLanguage,
    setActiveLanguage,
    languages,
    createFieldHandler,
  } = useMultilingualForm();

  const alert = useAlert();

  /* ----- load existing ----- */
  useEffect(() => {
    if (!webSetting) return;
    setTitleWebsite(webSetting.title_website || {});
    setCopyright(webSetting.copyright || "");
  }, [webSetting]);

  /* ----- handlers ----- */
  const handleTitleChange = createFieldHandler(setTitleWebsite);

  const handleFile =
    (key: keyof typeof files) =>
    (e: ChangeEvent<HTMLInputElement>): void => {
      const file = e.target.files?.[0];
      if (file) setFiles((prev) => ({ ...prev, [key]: file }));
    };

  /* ----- save ----- */
  const handleSave = async () => {
    setIsSaving(true);
    const ok = await saveWebSetting(
      {
        title_website: titleWebsite,
        copyright,
      },
      {
        logo: files.logoFile,
        favicon: files.faviconFile, 
        cv_id: files.cvIdFile,
        cv_en: files.cvEnFile
      }
    );
    setIsSaving(false);
    ok
      ? alert.success("Web setting berhasil disimpan!")
      : alert.error("Gagal menyimpan web setting");
  };

  /* ----- ui ----- */
  if (isLoading) return <PageLoader text="Memuat Web Setting..." />;

  return (
    <div className="space-y-8">
      {/* header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-border">
        <SectionTitle
          title="Pengaturan Website"
          subtitle="Kelola aset & informasi dasar situs"
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
          {/* info umum */}
          <HeroCard className="p-6">
            <FormSection title="Informasi Umum">
              <MultilingualInput
                label="Judul Website"
                value={titleWebsite[activeLanguage] || ""}
                onChange={handleTitleChange}
                language={activeLanguage}
                placeholder={`Masukkan judul dalam bahasa ${
                  activeLanguage === "en" ? "Inggris" : "Indonesia"
                }`}
              />

              <MultilingualInput
                label="Hak Cipta"
                value={copyright}
                onChange={(e) => setCopyright(e.target.value)}
                language={activeLanguage}
                placeholder={`Masukkan hak cipta dalam bahasa ${
                  activeLanguage === "en" ? "Inggris" : "Indonesia"
                }`}
                />
            </FormSection>
          </HeroCard>

          {/* upload file */}
          <HeroCard className="p-6">
            <FormSection title="File & Aset">
              <FileUpload
                label="Logo"
                onChange={handleFile("logoFile")}
                accept="image/*"
              />
              
              <FileUpload
                label="Favicon"
                onChange={handleFile("faviconFile")}
                accept="image/*"
              />
              
              <DocumentUpload
                label="CV Bahasa Indonesia"
                accept=".pdf,application/pdf"
                onChange={handleFile("cvIdFile")}
                currentUrl={webSetting?.cv_id}
              />
              
              <DocumentUpload
                label="CV Bahasa Inggris"
                accept=".pdf,application/pdf"
                onChange={handleFile("cvEnFile")}
                currentUrl={webSetting?.cv_en}
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
              <h3 className="text-lg font-medium">Preview Website</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Tampilan informasi dasar
              </p>
            </div>

            <div className="p-6 space-y-4">
              {/* logo */}
              <div className="flex items-center gap-2">
                {webSetting?.logo && (
                  <img
                    src={webSetting.logo}
                    alt="logo"
                    className="h-8 w-auto rounded"
                  />
                )}
                <span className="text-lg font-semibold">
                  {titleWebsite[activeLanguage] || "Judul Website"}
                </span>
              </div>

              {/* favicon */}
              {webSetting?.favicon && (
                <div className="flex items-center gap-2">
                  <img
                    src={webSetting.favicon}
                    alt="favicon"
                    className="h-6 w-6 rounded"
                  />
                  <span className="text-sm text-muted-foreground">Favicon</span>
                </div>
              )}

              {/* copyright */}
              {copyright && (
                <p className="text-sm text-muted-foreground">{copyright}</p>
              )}
            </div>
          </HeroCard>
        </div>
      </div>
    </div>
  );
}

/* ------- helper file input ------- */
interface FileInputProps {
  label: string;
  accept?: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  currentUrl?: string | null;
}

function FileInput({ label, accept, onChange, currentUrl }: FileInputProps) {
  return (
    <div className="mt-4">
      <label className="block text-sm font-medium mb-1">{label}</label>
      <input
        type="file"
        accept={accept}
        onChange={onChange}
        className="block w-full text-sm"
      />
      {currentUrl && (
        <a
          href={currentUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 inline-block text-xs text-primary underline"
        >
          Lihat file saat ini
        </a>
      )}
    </div>
  );
}
