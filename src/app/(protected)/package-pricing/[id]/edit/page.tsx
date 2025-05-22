"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
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
  title: Record<string, string>;
  description: Record<string, string>;
  work_duration: Record<string, string>;
  price: Record<string, string>;
  benefitIds: number[];
  exclusionIds: number[];
};

export default function PackagePricingEditPage() {
  const router = useRouter();
  const params = useParams();
  const id = parseInt(params.id as string);
  
  const { updatePackage, fetchPackageById } = usePackagePricing();
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
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch package data
  useEffect(() => {
    const fetchPackageData = async () => {
      try {
        setIsLoading(true);
        const packageData = await fetchPackageById(id, true);
        
        if (packageData) {
          setFormData({
            title: {
              id: packageData.title?.id || '',
              en: packageData.title?.en || ''
            },
            description: {
              id: packageData.description?.id || '',
              en: packageData.description?.en || ''
            },
            work_duration: {
              id: packageData.work_duration?.id || '',
              en: packageData.work_duration?.en || ''
            },
            price: {
                id: packageData.price?.id || '',
                en: packageData.price?.en || ''
            },
            benefitIds: packageData.benefits?.map(b => b.id) || [],
            exclusionIds: packageData.exclusions?.map(e => e.id) || []
          });
        } else {
          setError("Paket harga tidak ditemukan");
        }
      } catch (err) {
        console.error("Error fetching package pricing:", err);
        setError("Gagal memuat data paket harga");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPackageData();
  }, [id, fetchPackageById]);

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

  // Handle work duration change
  const handleWorkDurationChange = (lang: 'id' | 'en', value: string) => {
    setFormData(prev => ({
      ...prev,
      work_duration: {
        ...prev.work_duration,
        [lang]: value
      }
    }));
  };

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
    
    if (!formData.title.id) {
      setError("Nama Paket (Indonesia) wajib diisi");
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
    
    if (!formData.work_duration.id) {
      setError("Durasi kerja (Indonesia) wajib diisi");
      return false;
    }
    
    if (!formData.work_duration.en) {
      setError("Durasi kerja (English) wajib diisi");
      return false;
    }
    
    return true;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      await updatePackage(id, {
        title: formData.title,
        description: formData.description,
        price: formData.price,
        work_duration: formData.work_duration,
        benefitIds: formData.benefitIds,
        exclusionIds: formData.exclusionIds
      });
      
      router.push("/package-pricing");
    } catch (err) {
      console.error('Error updating package pricing:', err);
      setError(err instanceof Error ? err.message : "Terjadi kesalahan saat memperbarui paket harga");
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Paket Harga"
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
                  
                  {/* Work Duration */}
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
                  onChange={(value) => {
                    if (Array.isArray(value)) {
                      // Convert all values to numbers if they're strings
                      const numericIds = value.map(id => typeof id === 'string' ? parseInt(id, 10) : id);
                      setFormData({
                        ...formData,
                        benefitIds: numericIds as number[]
                      });
                    }
                  }}
                  isMultiple={true}
                  placeholder="Pilih benefits"
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
                  onChange={(value) => {
                    if (Array.isArray(value)) {
                      // Convert all values to numbers if they're strings
                      const numericIds = value.map(id => typeof id === 'string' ? parseInt(id, 10) : id);
                      setFormData({
                        ...formData,
                        exclusionIds: numericIds as number[]
                      });
                    }
                  }}
                  isMultiple={true}
                  placeholder="Pilih exclusions"
                />
              </FormSection>
            </div>
          </div>
        </DetailView>
      </form>
    </div>
  );
}