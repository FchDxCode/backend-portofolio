"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
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

export default function EditProcessActivityPage() {
  const router = useRouter();
  const params = useParams();
  const activityId = Number(params.id);
  
  const { fetchActivityById, updateActivity } = useProcessActivity();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormData>({
    title: {
      id: "",
      en: "",
    },
  });

  useEffect(() => {
    const loadActivity = async () => {
      try {
        const activity = await fetchActivityById(activityId);
        if (activity) {
          setFormData({
            title: {
              id: activity.title?.id || "",
              en: activity.title?.en || "",
            },
          });
        } else {
          setError("Aktivitas tidak ditemukan");
        }
      } catch (err) {
        console.error("Error fetching activity:", err);
        setError("Gagal memuat data aktivitas");
      } finally {
        setFetchLoading(false);
      }
    };

    loadActivity();
  }, [activityId, fetchActivityById]);

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

      // Update aktivitas
      await updateActivity(activityId, {
        title: formData.title,
      });

      // Redirect ke halaman daftar aktivitas
      router.push("/process-activity-services");
    } catch (err) {
      console.error("Error updating process activity:", err);
      setError(err instanceof Error ? err.message : "Gagal memperbarui aktivitas proses");
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2">Memuat data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Aktivitas Proses"
        description="Perbarui informasi aktivitas proses"
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