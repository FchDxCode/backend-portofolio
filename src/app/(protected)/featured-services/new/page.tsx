"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/src/components/multipage/PageHeader";
import { Button } from "@/src/components/multipage/Button";
import { FormSection } from "@/src/components/multipage/FormSection";
import { DetailView } from "@/src/components/multipage/DetailView";
import { InputMultipage } from "@/src/components/multipage/InputMultipage";
import { DropdownMultipage } from "@/src/components/multipage/DropdownMultipage";
import { ImageUpload } from "@/src/components/multipage/ImageUpload";
import { useFeaturedService } from "@/src/hook/services/useFeaturedServices"; // Menggunakan hook yang telah diperbarui
import { useServiceBenefits } from "@/src/hook/services/useBenefitServices";
import { useTechStackSkills } from "@/src/hook/services/useTechStackSkill";

type FormData = {
  title: { id: string; en: string };
  preview_description: { id: string; en: string };
  description: { id: string; en: string };
  icon?: string;
  benefitIds: number[]; // IDs benefit untuk junction table
  skillIds: number[];   // IDs skill untuk junction table
};

export default function FeaturedServicesNewPage() {
  const router = useRouter();
  // Menggunakan hook yang telah diperbarui
  const { createService } = useFeaturedService();
  const { benefits } = useServiceBenefits();
  const { skills } = useTechStackSkills();

  const [activeTab, setActiveTab] = useState<"id" | "en">("id");
  const [formData, setFormData] = useState<FormData>({
    title: { id: "", en: "" },
    preview_description: { id: "", en: "" },
    description: { id: "", en: "" },
    benefitIds: [],
    skillIds: []
  });
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconType, setIconType] = useState<"file" | "class">("file");
  const [iconClass, setIconClass] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // INPUT HANDLER
  const handleInputChange = (
    field: keyof FormData,
    value: any,
    lang?: "id" | "en"
  ) => {
    if (lang) {
      setFormData((prev) => {
        // Handle multilingual fields (title, preview_description, description)
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

  // VALIDASI
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

  // SUBMIT
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      
      // Persiapkan data untuk layanan baru
      const serviceData = {
        ...formData,
        icon: iconType === "class" ? iconClass : undefined,
      };
      
      console.log("Submitting service data:", JSON.stringify(serviceData, null, 2));
      
      // Menggunakan createService dari hook useFeaturedService yang sudah diperbarui
      // Fungsi ini sekarang menerima benefitIds dan skillIds untuk junction table
      const newService = await createService(
        serviceData,
        iconType === "file" ? iconFile || undefined : undefined
      );
      
      console.log("Service created successfully:", newService);
      
      // Redirect ke halaman daftar layanan
      router.push("/featured-services");
    } catch (err) {
      console.error("Error creating service:", err);
      
      // Penanganan error yang lebih detail
      let errorMessage = "Terjadi kesalahan saat menyimpan data";
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'object' && err !== null) {
        errorMessage = JSON.stringify(err);
      }
      
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // OPTIONS
  const benefitOptions = benefits.map((benefit) => ({
    label: benefit.title?.id || benefit.title?.en || `Benefit ${benefit.id}`,
    value: benefit.id,
  }));
  const skillOptions = skills.map((skill) => ({
    label: skill.title?.id || skill.title?.en || `Skill ${skill.id}`,
    value: skill.id,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tambah Layanan Unggulan"
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
              onClick={handleSubmit}
              isLoading={isSubmitting}
            >
              Simpan
            </Button>
          </div>
        }
      />

      {error && (
        <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <DetailView>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Main content - 2/3 width */}
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

            {/* Sidebar - 1/3 width */}
            <div className="space-y-6">
              <FormSection title="Relasi & Media">
                <div className="space-y-4">
                  {/* Benefit Selection - Multiple */}
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
                      required={true}
                    />
                  </div>

                  {/* Skills Selection - Multiple */}
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