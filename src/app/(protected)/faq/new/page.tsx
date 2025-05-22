"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";

import { PageHeader } from "@/src/components/multipage/PageHeader";
import { Button } from "@/src/components/multipage/Button";
import { FormSection } from "@/src/components/multipage/FormSection";
import { InputMultipage } from "@/src/components/multipage/InputMultipage";
import { RichTextEditor } from "@/src/components/richtext/RichEditor";

import { useFaqs } from "@/src/hook/services/useFaq";
import { saveFile } from "@/src/utils/server/FileStorage";

type Lang = "id" | "en";
type MultiKey = "title" | "description";

interface FormData {
  title: Record<Lang, string>;
  description: Record<Lang, string>;
}

export default function FaqNewPage() {
  const router = useRouter();
  const { createFaq } = useFaqs(); // hanya butuh create

  const [activeTab, setActiveTab] = useState<Lang>("id");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormData>({
    title: { id: "", en: "" },
    description: { id: "", en: "" },
  });

  /* ---------- handlers ---------- */
  const handleMulti = (field: MultiKey, lang: Lang, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: { ...prev[field], [lang]: value } }));
  };

  const handleValidate = () => {
    setError(null);
    if (!formData.title.id.trim()) {
      setError("Judul (ID) wajib diisi");
      return false;
    }
    if (!formData.description.id.trim()) {
      setError("Deskripsi (ID) wajib diisi");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!handleValidate()) return;

    setLoading(true);
    try {
      await createFaq({
        title: formData.title,
        description: formData.description,
      });
      router.push("/faq");
    } catch {
      setError("Gagal membuat FAQ. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  /* ---------- editor upload ---------- */
  const handleEditorImageUpload = async (file: File) => {
    return await saveFile(file, { folder: "faqs/content" });
  };

  /* ---------- UI ---------- */
  return (
    <div className="space-y-6">
      <PageHeader
        title="Tambah FAQ"
        description="Isi detail pertanyaan dan jawaban"
        actions={
          <Link href="/faq">
            <Button variant="outline" icon={<ArrowLeft size={16} />}>
              Kembali
            </Button>
          </Link>
        }
      />

      {error && (
        <div className="bg-destructive/15 text-destructive px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Language Tabs */}
        <div className="flex border-b border-gray-200">
          {(["id", "en"] as Lang[]).map((lang) => (
            <button
              key={lang}
              type="button"
              onClick={() => setActiveTab(lang)}
              className={`py-2 px-4 ${
                activeTab === lang
                  ? "border-b-2 border-primary font-medium"
                  : "text-muted-foreground"
              }`}
            >
              {lang === "id" ? "Bahasa Indonesia" : "English"}
            </button>
          ))}
        </div>

        {/* Informasi */}
        <FormSection
          title={`Konten (${activeTab.toUpperCase()})`}
          description="Judul & jawaban"
        >
          <InputMultipage
            label="Judul"
            language={activeTab}
            value={formData.title[activeTab]}
            onChange={(e) => handleMulti("title", activeTab, e.target.value)}
            required
          />

          <RichTextEditor
            value={formData.description[activeTab]}
            onChange={(c) => handleMulti("description", activeTab, c)}
            onImageUpload={handleEditorImageUpload}
            placeholder={`Tulis jawaban (${activeTab})`}
            language={activeTab}
            className="mt-6"
          />
        </FormSection>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Link href="/faq">
            <Button variant="outline">Batal</Button>
          </Link>
          <Button
            type="submit"
            variant="primary"
            icon={<Save size={16} />}
            isLoading={loading}
          >
            Simpan
          </Button>
        </div>
      </form>
    </div>
  );
}
