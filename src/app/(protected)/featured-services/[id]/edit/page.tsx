"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { PageHeader } from "@/src/components/multipage/PageHeader";
import { Button } from "@/src/components/multipage/Button";
import { FormSection } from "@/src/components/multipage/FormSection";
import { DetailView } from "@/src/components/multipage/DetailView";
import { InputMultipage } from "@/src/components/multipage/InputMultipage";
import { DropdownMultipage } from "@/src/components/multipage/DropdownMultipage";
import { ImageUpload } from "@/src/components/multipage/ImageUpload";
import { useFeaturedService } from "@/src/hook/services/useFeaturedServices";
import { useServiceBenefits } from "@/src/hook/services/useBenefitServices";
import { useTechStackSkills } from "@/src/hook/services/useTechStackSkill";
import { FeaturedServiceService } from "@/src/services/services/FeaturedServices";

type FormData = {
  title: { id: string; en: string };
  preview_description: { id: string; en: string };
  description: { id: string; en: string };
  icon?: string;
  benefitIds: number[];
  skillIds: number[];
};

export default function FeaturedServicesEditPage() {
  const router = useRouter();
  const params = useParams();
  const id = Number(params?.id);

  const { updateService } = useFeaturedService();
  const { benefits } = useServiceBenefits();
  const { skills } = useTechStackSkills();

  const [activeTab, setActiveTab] = useState<"id" | "en">("id");
  const [formData, setFormData] = useState<FormData>({
    title: { id: "", en: "" },
    preview_description: { id: "", en: "" },
    description: { id: "", en: "" },
    benefitIds: [],
    skillIds: [],
  });
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconType, setIconType] = useState<"file" | "class">("file");
  const [iconClass, setIconClass] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch data by ID
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        if (!id || isNaN(id)) {
          setError("ID layanan tidak valid");
          setLoading(false);
          return;
        }
        
        console.log("Fetching service with ID:", id);
        
        // Get the service directly from the service instead of from the services array
        const service = await FeaturedServiceService.getById(id);
        
        if (!service) {
          setError("Data layanan tidak ditemukan.");
          setLoading(false);
          return;
        }
        
        console.log("Service data loaded:", service);
        
        setFormData({
          title: service.title ?? { id: "", en: "" },
          preview_description: service.preview_description ?? { id: "", en: "" },
          description: service.description ?? { id: "", en: "" },
          benefitIds: (service.benefits ?? []).map((b: any) => b.id),
          skillIds: (service.skills ?? []).map((s: any) => s.id),
          icon: service.icon,
        });
        
        if (service.icon && /^fa|bi|material-icons|icon-/.test(service.icon)) {
          setIconType("class");
          setIconClass(service.icon);
        }
      } catch (err) {
        console.error("Error loading service:", err);
        setError(err instanceof Error ? err.message : "Gagal memuat data layanan.");
      } finally {
        setLoading(false);
      }
    };
    
    if (id) fetchData();
  }, [id]);

  // Handler form
  const handleInputChange = (
    field: keyof FormData,
    value: any,
    lang?: "id" | "en"
  ) => {
    if (lang) {
      setFormData((prev) => {
        // Handle multilingual fields (title, preview_description, description)
        // Create a new object to avoid mutating the previous state
        const currentField = prev[field] as Record<string, string>;
        
        return {
          ...prev,
          [field]: {
            ...currentField,
            [lang]: value,
          },
        };
      });
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleBenefitChange = (selected: Array<number | string>) => {
    setFormData((prev) => ({
      ...prev,
      benefitIds: (selected as number[]).map(Number),
    }));
  };

  // Validasi
  const validateForm = () => {
    setError(null);

    if (!formData.title.id && !formData.title.en) {
      setError("Judul layanan harus diisi (ID atau EN)");
      return false;
    }
    if (!formData.benefitIds || formData.benefitIds.length === 0) {
      setError("Minimal pilih satu benefit!");
      return false;
    }
    return true;
  };

  // Submit update
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      setIsSubmitting(true);
      await updateService(
        id,
        {
          ...formData,
          icon: iconType === "class" ? iconClass : undefined,
        },
        iconType === "file" ? iconFile || undefined : undefined
      );
      router.push("/featured-services");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat update data"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Dropdown options
  const benefitOptions = benefits.map((benefit) => ({
    label: benefit.title?.id || benefit.title?.en || `Benefit ${benefit.id}`,
    value: benefit.id,
  }));
  const skillOptions = skills.map((skill) => ({
    label: skill.title?.id || skill.title?.en || `Skill ${skill.id}`,
    value: skill.id,
  }));

  if (loading) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Memuat data layanan...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Layanan Unggulan"
        backUrl="/featured-services"
        actions={
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => router.push("/featured-services")}
            >
              Batal
            </Button>
            <Button
              variant="primary"
              onClick={handleUpdate}
              isLoading={isSubmitting}
            >
              Simpan Perubahan
            </Button>
          </div>
        }
      />

      {error && (
        <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleUpdate} className="space-y-6">
        <DetailView>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Konten utama */}
            <div className="md:col-span-2 space-y-6">
              {/* Language tabs */}
              <div className="flex border-b border-gray-200">
                <button
                  type="button"
                  onClick={() => setActiveTab("id")}
                  className={`py-2 px-4 ${
                    activeTab === "id"
                      ? "border-b-2 border-primary font-medium"
                      : "text-muted-foreground"
                  }`}
                >
                  Bahasa Indonesia
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("en")}
                  className={`py-2 px-4 ${
                    activeTab === "en"
                      ? "border-b-2 border-primary font-medium"
                      : "text-muted-foreground"
                  }`}
                >
                  English
                </button>
              </div>

              {/* Service Information */}
              <FormSection title="Informasi Layanan">
                <div className="space-y-4">
                  {/* Service Title */}
                  <div className="space-y-2">
                    <InputMultipage
                      value={formData.title[activeTab]}
                      onChange={(e) =>
                        handleInputChange("title", e.target.value, activeTab)
                      }
                      label={`Judul Layanan ${
                        activeTab === "id" ? "(Indonesia)" : "(English)"
                      }`}
                      language={activeTab}
                      required={activeTab === "id"}
                      placeholder={`Masukkan judul layanan ${
                        activeTab === "id"
                          ? "dalam Bahasa Indonesia"
                          : "in English"
                      }`}
                    />
                  </div>

                  {/* Service Preview Description */}
                  <div className="space-y-2">
                    <InputMultipage
                      value={formData.preview_description[activeTab]}
                      onChange={(e) =>
                        handleInputChange(
                          "preview_description",
                          e.target.value,
                          activeTab
                        )
                      }
                      label={`Deskripsi Singkat ${
                        activeTab === "id" ? "(Indonesia)" : "(English)"
                      }`}
                      language={activeTab}
                      multiline
                      rows={3}
                      placeholder={`Masukkan deskripsi singkat ${
                        activeTab === "id"
                          ? "dalam Bahasa Indonesia"
                          : "in English"
                      }`}
                    />
                  </div>

                  {/* Service Full Description */}
                  <div className="space-y-2">
                    <InputMultipage
                      value={formData.description[activeTab]}
                      onChange={(e) =>
                        handleInputChange(
                          "description",
                          e.target.value,
                          activeTab
                        )
                      }
                      label={`Deskripsi Lengkap ${
                        activeTab === "id" ? "(Indonesia)" : "(English)"
                      }`}
                      language={activeTab}
                      multiline
                      rows={5}
                      placeholder={`Masukkan deskripsi lengkap ${
                        activeTab === "id"
                          ? "dalam Bahasa Indonesia"
                          : "in English"
                      }`}
                    />
                  </div>
                </div>
              </FormSection>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <FormSection title="Relasi & Media">
                <div className="space-y-4">
                  {/* Benefit Selection */}
                  <div className="space-y-2">
                    <DropdownMultipage
                      label="Benefit Terkait"
                      options={benefitOptions}
                      value={formData.benefitIds}
                      onChange={(value) =>
                        handleInputChange("benefitIds", value)
                      }
                      placeholder="Pilih benefit terkait"
                      isMultiple={true}
                    />
                  </div>
                  {/* Skills Selection */}
                  <div className="space-y-2">
                    <DropdownMultipage
                      label="Skills Terkait"
                      options={skillOptions}
                      value={formData.skillIds}
                      onChange={(value) =>
                        handleInputChange("skillIds", value)
                      }
                      placeholder="Pilih skill terkait"
                      isMultiple={true}
                    />
                  </div>
                </div>
              </FormSection>
              <FormSection title="Icon Layanan">
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <button
                      type="button"
                      onClick={() => setIconType("file")}
                      className={`px-3 py-1.5 text-sm rounded-md ${
                        iconType === "file"
                          ? "bg-primary text-white"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      Upload File
                    </button>
                    <button
                      type="button"
                      onClick={() => setIconType("class")}
                      className={`px-3 py-1.5 text-sm rounded-md ${
                        iconType === "class"
                          ? "bg-primary text-white"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      Class Icon
                    </button>
                  </div>
                  {iconType === "file" ? (
                    <>
                      <ImageUpload
                        onChange={setIconFile}
                        label="Unggah Icon Layanan"
                        value={iconFile}
                        maxSize={5 * 1024 * 1024}
                        accept="image/*"
                      />
                      <p className="text-xs text-muted-foreground mt-2">
                        Format: JPG, PNG, SVG. Ukuran maksimal: 5MB.
                      </p>
                    </>
                  ) : (
                    <>
                      <InputMultipage
                        label="Class Icon"
                        value={iconClass}
                        onChange={(e) => setIconClass(e.target.value)}
                        placeholder="Contoh: fa fa-code, bi bi-app, material-icons-work"
                      />
                      <p className="text-xs text-muted-foreground mt-2">
                        Gunakan class icon dari Font Awesome, Bootstrap Icons, atau Material Icons.
                      </p>
                    </>
                  )}
                </div>
              </FormSection>
            </div>
          </div>
        </DetailView>
      </form>
    </div>
  );
}