"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/src/components/multipage/PageHeader";
import { Button } from "@/src/components/multipage/Button";
import { FormSection } from "@/src/components/multipage/FormSection";
import { InputMultipage } from "@/src/components/multipage/InputMultipage";
import { useProcessActivity } from "@/src/hook/services/useProcessActivity";

type FormData = {
  title: {
    id: string;
    en: string;
  };
};

export default function NewProcessActivityPage() {
  const router = useRouter();
  const { createActivity } = useProcessActivity();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormData>({
    title: {
      id: "",
      en: "",
    },
  });

  const handleInputChange = (
    field: string,
    value: string,
    lang?: "id" | "en"
  ) => {
    if (lang) {
      setFormData({
        ...formData,
        [field]: {
          ...formData[field as keyof FormData],
          [lang]: value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [field]: value,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validasi input
      if (!formData.title.id && !formData.title.en) {
        throw new Error("Judul aktivitas harus diisi minimal dalam satu bahasa");
      }

      // Buat aktivitas baru
      await createActivity({
        title: formData.title,
      });

      // Redirect ke halaman daftar aktivitas
      router.push("/process-activity-services");
    } catch (err) {
      console.error("Error creating process activity:", err);
      setError(err instanceof Error ? err.message : "Gagal membuat aktivitas proses");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tambah Aktivitas Proses"
        description="Buat aktivitas proses baru"
        actions={
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => router.push("/process-activity-services")}
            >
              Batal
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              isLoading={loading}
            >
              Simpan
            </Button>
          </div>
        }
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <FormSection title="Informasi Aktivitas" description="Informasi dasar aktivitas proses">
          <div className="grid grid-cols-1 gap-6">
            <div>
              <InputMultipage
                label="Judul (Indonesia)"
                name="title-id"
                placeholder="Masukkan judul dalam Bahasa Indonesia"
                value={formData.title.id}
                onChange={(e) => handleInputChange("title", e.target.value, "id")}
              />
            </div>
            <div>
              <InputMultipage
                label="Judul (Inggris)"
                name="title-en"
                placeholder="Masukkan judul dalam Bahasa Inggris"
                value={formData.title.en}
                onChange={(e) => handleInputChange("title", e.target.value, "en")}
              />
            </div>
          </div>
        </FormSection>
      </form>
    </div>
  );
}