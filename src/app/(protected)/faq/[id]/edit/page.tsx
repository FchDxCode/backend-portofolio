"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";

import { PageHeader } from "@/src/components/multipage/PageHeader";
import { Button } from "@/src/components/multipage/Button";
import { FormSection } from "@/src/components/multipage/FormSection";
import { InputMultipage } from "@/src/components/multipage/InputMultipage";
import { RichTextEditor } from "@/src/components/richtext/RichEditor";

import { useFaqs } from "@/src/hook/services/useFaq";
import { FaqService } from "@/src/services/services/FaqServices";
import { Faq } from "@/src/models/ServiceModels";
import { saveFile } from "@/src/utils/server/FileStorage";

type Lang = "id" | "en";
type MultiKey = "title" | "description";

interface FormData {
  title: Record<Lang, string>;
  description: Record<Lang, string>;
}

export default function FaqEditPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = Number(params.id);

  const { updateFaq } = useFaqs();
  const [faq, setFaq] = useState<Faq | null>(null);

  const [activeTab, setActiveTab] = useState<Lang>("id");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* ---------- initial fetch ---------- */
  useEffect(() => {
    (async () => {
      try {
        const data = await FaqService.getById(id);
        if (data) {
          setFaq(data);
        } else {
          router.push("/faq");
        }
      } catch {
        router.push("/faq");
      }
    })();
  }, [id, router]);

  /* ---------- form state ---------- */
  const [formData, setFormData] = useState<FormData>({
    title: { id: "", en: "" },
    description: { id: "", en: "" },
  });

  useEffect(() => {
    if (faq) {
      setFormData({
        title: {
          id: faq.title?.id || "",
          en: faq.title?.en || "",
        },
        description: {
          id: faq.description?.id || "",
          en: faq.description?.en || "",
        },
      });
    }
  }, [faq]);

  const handleMulti = (field: MultiKey, lang: Lang, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: { ...prev[field], [lang]: value } }));
  };

  const validate = () => {
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
    if (!validate()) return;

    setLoading(true);
    try {
      await updateFaq(id, {
        title: formData.title,
        description: formData.description,
      });
      router.push("/faq");
    } catch {
      setError("Gagal memperbarui FAQ. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditorImageUpload = async (file: File) => {
    return await saveFile(file, { folder: "faqs/content" });
  };

  if (!faq) {
    return <div>Memuat...</div>;
  }

  /* ---------- UI ---------- */
  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit FAQ"
        description="Perbarui pertanyaan dan jawaban"
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

        {/* Konten */}
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
