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
import { RadioButtonMultipage } from "@/src/components/multipage/RadioButtonMultipage";
import { useServiceProcess } from "@/src/hook/services/useProcessServices";
import { useProcessActivity } from "@/src/hook/services/useProcessActivity";

type FormData = {
  title: { id: string; en: string };
  description: { id: string; en: string };
  work_duration: {id: string, en: string};
  is_active: boolean;
  icon: string;
  activityIds: number[];
};

// Define a type for fields that have language support
type MultilingualFields = 'title' | 'description' | 'work_duration';

export default function ServicesProcessNewPage() {
  const router = useRouter();
  const { createProcess } = useServiceProcess();
  const { activities } = useProcessActivity();
  
  // Language tab state
  const [activeTab, setActiveTab] = useState<"id" | "en">("id");
  
  // Form state
  const [formData, setFormData] = useState<FormData>({
    title: { id: "", en: "" },
    description: { id: "", en: "" },
    work_duration: {id: "", en: ""},
    is_active: true,
    icon: "",
    activityIds: [],
  });
  
  // Image state
  const [iconFile, setIconFile] = useState<File | null>(null);
  
  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle input change
  const handleInputChange = (field: keyof FormData, value: any, lang?: "id" | "en") => {
    if (lang) {
      // Check if the field is a multilingual field
      if (['title', 'description', 'work_duration'].includes(field)) {
        setFormData(prev => ({
          ...prev,
          [field]: {
            ...prev[field as MultilingualFields],
            [lang]: value
          }
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  // Handle activities selection
  const handleActivitiesChange = (value: string | number | (string | number)[]) => {
    // If it's already an array, use it, otherwise create a new array with the single value
    const values = Array.isArray(value) ? value : [value];
    
    // Convert all values to numbers
    const numericValues = values.map(val => 
      typeof val === 'string' ? parseInt(val, 10) : val
    );
    
    setFormData(prev => ({
      ...prev,
      activityIds: numericValues as number[]
    }));
  };

  // Validate form
  const validateForm = () => {
    // Reset error
    setError(null);
    
    // Required fields validation
    if (!formData.title.id) {
      setError("Judul proses (Indonesia) wajib diisi");
      return false;
    }
    
    return true;
  };

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Create process
      await createProcess(formData, iconFile || undefined);
      
      // Redirect to process list
      router.push("/services-process");
    } catch (err) {
      console.error('Error creating process:', err);
      setError(err instanceof Error ? err.message : "Terjadi kesalahan saat menyimpan proses");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Activity options for dropdown
  const activityOptions = activities.map(activity => ({
    value: activity.id,
    label: activity.title?.id || activity.title?.en || `Activity ${activity.id}`
  }));

    return (
    <div className="space-y-6">
      <PageHeader
        title="Tambah Proses Layanan"
        backUrl="/services-process"
        actions={
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => router.push("/services-process")}
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

              {/* Process Information */}
              <FormSection title="Informasi Proses">
                <div className="space-y-4">
                  {/* Process Title */}
                  <div className="space-y-2">
                    <InputMultipage 
                      value={formData.title[activeTab]}
                      onChange={(e) => handleInputChange("title", e.target.value, activeTab)}
                      label={`Judul Proses ${activeTab === "id" ? "(Indonesia)" : "(English)"}`}
                      language={activeTab}
                      required={activeTab === "id"}
                      placeholder={`Masukkan judul proses ${activeTab === "id" ? "dalam Bahasa Indonesia" : "in English"}`}
                    />
                  </div>
                </div>
              </FormSection>

              {/* Process Description */}
              <FormSection title="Deskripsi">
                <div className="space-y-2">
                  <InputMultipage 
                    value={formData.description[activeTab]}
                    onChange={(e) => handleInputChange("description", e.target.value, activeTab)}
                    label={`Deskripsi ${activeTab === "id" ? "(Indonesia)" : "(English)"}`}
                    language={activeTab}
                    multiline={true}
                    rows={5}
                    placeholder={`Masukkan deskripsi proses ${activeTab === "id" ? "dalam Bahasa Indonesia" : "in English"}`}
                  />
                </div>
              </FormSection>

              {/* Related Activities */}
              <FormSection title="Aktivitas Terkait">
                <div className="space-y-2">
                  <DropdownMultipage
                    label="Aktivitas Terkait"
                    value={formData.activityIds}
                    onChange={handleActivitiesChange}
                    options={activityOptions}
                    placeholder="Pilih aktivitas terkait"
                    isMultiple={true}
                    
                  />
                </div>
              </FormSection>
            </div>

            {/* Sidebar - 1/3 width */}
            <div className="space-y-6">
              {/* Process Icon */}
              <FormSection title="Ikon Proses">
                <ImageUpload
                  onChange={setIconFile}
                  value={iconFile}
                  maxSize={5}
                  aspectRatio="square"
                  label="Unggah Ikon"
                  description="Format: JPG, PNG, SVG. Maks 5MB."
                />
                <div className="mt-4">
                  <InputMultipage
                    label="Kelas Ikon (Opsional)"
                    placeholder="Contoh: fa fa-home, bi bi-house, material-icons home"
                    value={iconFile ? "" : formData.icon}
                    onChange={(e) => handleInputChange("icon", e.target.value)}
                    
                    helperText="Masukkan kelas ikon dari Font Awesome, Bootstrap Icons, atau Material Icons"
                  />
                </div>
              </FormSection>

              {/* Process Settings */}
              <FormSection title="Pengaturan Proses">
                <div className="space-y-4">
                  {/* Duration */}
                  <div className="space-y-2">
                    <InputMultipage
                      value={formData.work_duration[activeTab]}
                      onChange={(e) => handleInputChange("work_duration", e.target.value, activeTab)}
                      label={`Durasi Pengerjaan ${activeTab === "id" ? "(Indonesia)" : "(English)"}`}
                      language={activeTab}
                      placeholder={`Masukkan durasi dalam ${activeTab === "id" ? " Bahasa Indonesia" : "in English"}`}
                    />
                  </div>
                  
                  {/* Status */}
                  <div className="space-y-2">
                    <RadioButtonMultipage
                      label="Status"
                      options={[
                        { label: "Aktif", value: "true" },
                        { label: "Nonaktif", value: "false" },
                      ]}
                      value={formData.is_active ? "true" : "false"}
                      onChange={(value) => handleInputChange("is_active", value === "true")}
                    />
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