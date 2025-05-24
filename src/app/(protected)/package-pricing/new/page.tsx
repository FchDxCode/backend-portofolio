"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/src/components/multipage/PageHeader";
import { Button } from "@/src/components/multipage/Button";
import { FormSection } from "@/src/components/multipage/FormSection";
import { DetailView } from "@/src/components/multipage/DetailView";
import { InputMultipage } from "@/src/components/multipage/InputMultipage";
import { DropdownMultipage } from "@/src/components/multipage/DropdownMultipage";
import { usePackagePricing } from "@/src/hook/services/usePackagePricing";
import { usePackageBenefit } from "@/src/hook/services/usePackageBenefit";
import { usePackageExclusion } from "@/src/hook/services/usePackageExclusion";

// Define a type for the form data
type FormData = {
  title: { id: string; en: string };
  description: { id: string; en: string };
  price: { id: string; en: string };
  work_duration: { id: string; en: string };
  benefitIds: number[];
  exclusionIds: number[];
};

export default function PackagePricingNewPage() {
  const router = useRouter();
  const { createPackage } = usePackagePricing();
  const { benefits } = usePackageBenefit();
  const { exclusions } = usePackageExclusion();
  
  // Language tab state
  const [activeTab, setActiveTab] = useState<"id" | "en">("id");
  
  // Form state
  const [formData, setFormData] = useState({
    title: {
      id: '',
      en: ''
    },
    description: {
      id: '',
      en: ''
    },
    work_duration: {
      id: '',
      en: ''
    },
    price: {
      id: '',
      en: ''
    },
    benefitIds: [] as number[],
    exclusionIds: [] as number[]
  });
  
  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle input change
  const handleInputChange = (field: keyof FormData, value: any, lang?: "id" | "en") => {
    if (lang) {
      setFormData(prev => ({
        ...prev,
        [field]: {
          ...prev[field as "title" | "description"],
          [lang]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  // Handle benefits selection
  const handleBenefitChange = (value: string | number | (string | number)[], isMultiple = false) => {
    if (isMultiple && Array.isArray(value)) {
      // Convert all values to numbers
      const numericIds = value.map(id => typeof id === 'string' ? parseInt(id, 10) : id);
      setFormData({
        ...formData,
        benefitIds: numericIds as number[]
      });
    } else {
      // Handle single selection if needed
      const id = typeof value === 'string' ? parseInt(value, 10) : value as number;
      setFormData({
        ...formData,
        benefitIds: [id]
      });
    }
  };

  // Handle exclusions selection
  const handleExclusionChange = (value: string | number | (string | number)[], isMultiple = false) => {
    if (isMultiple && Array.isArray(value)) {
      // Convert all values to numbers
      const numericIds = value.map(id => typeof id === 'string' ? parseInt(id, 10) : id);
      setFormData({
        ...formData,
        exclusionIds: numericIds as number[]
      });
    } else {
      // Handle single selection if needed
      const id = typeof value === 'string' ? parseInt(value, 10) : value as number;
      setFormData({
        ...formData,
        exclusionIds: [id]
      });
    }
  };

  // Handle work duration change
  const handleWorkDurationChange = (lang: 'id' | 'en', value: string) => {
    setFormData({
      ...formData,
      work_duration: {
        ...formData.work_duration,
        [lang]: value
      }
    });
  };

  // Handle price change
  const handlePriceChange = (lang: 'id' | 'en', value: string) => {
    setFormData({
      ...formData,
      price: {
        ...formData.price,
        [lang]: value
      }
    });
  };

  // Validate form
  const validateForm = () => {
    setError(null);
    
    if (!formData.title.id && !formData.title.en) {
      setError("Judul harus diisi minimal dalam satu bahasa");
      return false;
    }
    
    if (!formData.description.id) {
      setError("Deskripsi Paket (Indonesia) wajib diisi");
      return false;
    }
    
    if (!formData.price.id && !formData.price.en) {
      setError("Harga harus diisi minimal dalam satu bahasa");
      return false;
    }
    
    if (!formData.work_duration.id || formData.work_duration.id.length === 0) {
      setError("Durasi kerja (Indonesia) harus diisi");
      return false;
    }
    
    if (!formData.work_duration.en || formData.work_duration.en.length === 0) {
      setError("Durasi kerja (English) harus diisi");
      return false;
    }
    
    return true;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      if (!validateForm()) {
        setIsSubmitting(false);
        return;
      }
      
      await createPackage({
        title: formData.title,
        description: formData.description,
        work_duration: formData.work_duration,
        price: formData.price,
        benefitIds: formData.benefitIds,
        exclusionIds: formData.exclusionIds
      });
      
      router.push("/package-pricing");
    } catch (err) {
      console.error('Error creating package pricing:', err);
      setError(err instanceof Error ? err.message : "Terjadi kesalahan saat menyimpan paket harga");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Duration unit options
  const durationUnitOptions = [
    { value: "hari", label: "Hari" },
    { value: "minggu", label: "Minggu" },
    { value: "bulan", label: "Bulan" },
    { value: "tahun", label: "Tahun" }
  ];

    return (
    <div className="space-y-6">
      <PageHeader
        title="Tambah Paket Harga"
        backUrl="/package-pricing"
        actions={
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => router.push("/package-pricing")}
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

              {/* Package Information */}
              <FormSection title="Informasi Paket">
                <div className="space-y-4">
                  {/* Package Name */}
                  <div className="space-y-2">
                    <InputMultipage 
                      value={formData.title[activeTab]}
                      onChange={(e) => handleInputChange("title", e.target.value, activeTab)}
                      label={`Nama Paket ${activeTab === "id" ? "(Indonesia)" : "(English)"}`}
                      language={activeTab}
                      required={activeTab === "id"}
                      placeholder={`Masukkan nama paket ${activeTab === "id" ? "dalam Bahasa Indonesia" : "in English"}`}
                    />
                  </div>
                  
                  {/* Package Description */}
                  <div className="space-y-2">
                    <InputMultipage 
                      value={formData.description[activeTab]}
                      onChange={(e) => handleInputChange("description", e.target.value, activeTab)}
                      label={`Deskripsi Paket ${activeTab === "id" ? "(Indonesia)" : "(English)"}`}
                      language={activeTab}
                      required={activeTab === "id"}
                      placeholder={`Masukkan deskripsi paket ${activeTab === "id" ? "dalam Bahasa Indonesia" : "in English"}`}
                      multiline
                      rows={4}
                    />
                  </div>
                </div>
              </FormSection>

              {/* Price Information */}
              <FormSection title={activeTab === 'id' ? "Harga" : "Price"}>
                <div className="space-y-4">
                  {/* Price */}
                  <div className="space-y-2">
                    <InputMultipage 
                      value={formData.price[activeTab] || ''}
                      onChange={(e) => handlePriceChange(activeTab, e.target.value)}
                      label={activeTab === 'id' ? "Harga" : "Price"}
                      required
                      language={activeTab}
                      type="text"
                      placeholder={activeTab === 'id' ? "Contoh: Rp500.000" : "Example: $50"}
                    />
                  </div>
                  
                  {/* Work Duration - Using activeTab for consistency */}
                  <FormSection title="Durasi Kerja">
                    <div className="space-y-4">
                      <InputMultipage 
                        value={formData.work_duration[activeTab] || ''}
                        onChange={(e) => handleWorkDurationChange(activeTab, e.target.value)}
                        label={activeTab === 'id' ? "Durasi Kerja" : "Work Duration"}
                        required
                        language={activeTab}
                        type="text"
                        placeholder={activeTab === 'id' ? "Contoh: 1 - 2 hari" : "Example: 1 - 2 days"}
                      />
                    </div>
                  </FormSection>
                </div>
              </FormSection>
            </div>

            {/* Sidebar - 1/3 width */}
            <div className="space-y-6">
              {/* Benefits */}
              <FormSection title="Benefits">
                <DropdownMultipage 
                  label="Benefits"
                  options={benefits.map(benefit => ({
                    value: benefit.id,
                    label: benefit.title?.id || benefit.title?.en || `Benefit ${benefit.id}`
                  }))}
                  value={formData.benefitIds}
                  onChange={(value) => handleBenefitChange(value, true)}
                  isMultiple={true}
                />
              </FormSection>

              {/* Exclusions */}
              <FormSection title="Exclusions">
                <DropdownMultipage 
                  label="Exclusions"
                  options={exclusions.map(exclusion => ({
                    value: exclusion.id,
                    label: exclusion.title?.id || exclusion.title?.en || `Exclusion ${exclusion.id}`
                  }))}
                  value={formData.exclusionIds}
                  onChange={(value) => handleExclusionChange(value, true)}
                  isMultiple={true}
                />
              </FormSection>
            </div>
          </div>
        </DetailView>
      </form>
    </div>
  );
}