"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { PageHeader } from "@/src/components/multipage/PageHeader";
import { Button } from "@/src/components/multipage/Button";
import { FormSection } from "@/src/components/multipage/FormSection";
import { DetailView } from "@/src/components/multipage/DetailView";
import { InputMultipage } from "@/src/components/multipage/InputMultipage";
import { ImageUpload } from "@/src/components/multipage/ImageUpload";
import { usePromiseItems } from "@/src/hook/services/usePromiseItem";
import { PromiseItemService } from "@/src/services/services/PromiseItemServices";

// Define a type for the form data
type FormData = {
  title: { id: string; en: string };
  subtitle: { id: string; en: string };
  icon?: string;
};

export default function PromiseItemEditPage() {
  const router = useRouter();
  const params = useParams();
  const id = Number(params.id);
  
  const { updatePromise, getIconUrl } = usePromiseItems();
  
  // Language tab state
  const [activeTab, setActiveTab] = useState<"id" | "en">("id");
  
  // Form state
  const [formData, setFormData] = useState<FormData>({
    title: { id: "", en: "" },
    subtitle: { id: "", en: "" }
  });
  
  // Image state
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconType, setIconType] = useState<"file" | "class">("file");
  const [iconClass, setIconClass] = useState("");
  const [currentIcon, setCurrentIcon] = useState<string | null>(null);
  
  // UI state
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch promise item data on component mount
  useEffect(() => {
    async function fetchPromiseItem() {
      try {
        setIsLoading(true);
        const data = await PromiseItemService.getById(id);
        
        if (!data) {
          setError("Promise item tidak ditemukan");
          return;
        }
        
        setFormData({
          title: data.title as { id: string; en: string } || { id: "", en: "" },
          subtitle: data.subtitle as { id: string; en: string } || { id: "", en: "" },
        });
        
        if (data.icon) {
          // Check if it's a class icon
          const isClass = (data.icon);
          
          if (isClass) {
            setIconType("class");
            setIconClass(data.icon);
          } else {
            setIconType("file");
            setCurrentIcon(data.icon);
          }
        }
      } catch (err) {
        console.error("Error fetching promise item:", err);
        setError("Gagal memuat data promise item");
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchPromiseItem();
  }, [id]);

  // Handle input change
  const handleInputChange = (field: keyof FormData, value: any, lang?: "id" | "en") => {
    if (lang) {
      setFormData(prev => ({
        ...prev,
        [field]: {
          ...prev[field as "title" | "subtitle"],
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

  // Handle image change
  const handleImageChange = (file: File | null) => {
    setIconFile(file);
  };

  // Validate form
  const validateForm = () => {
    setError(null);
    
    if (!formData.title.id) {
      setError("Judul (Indonesia) wajib diisi");
      return false;
    }
    
    if (!formData.subtitle.id) {
      setError("Subjudul (Indonesia) wajib diisi");
      return false;
    }
    
    if (iconType === "class" && !iconClass) {
      setError("Class icon wajib diisi");
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
      
      const updateData = {
        ...formData,
      };
      
      if (iconType === "class") {
        updateData.icon = iconClass;
      } else if (!iconFile && !currentIcon) {
        setError("Icon promise item wajib diunggah");
        setIsSubmitting(false);
        return;
      }
      
      await updatePromise(
        id,
        updateData,
        iconType === "file" ? iconFile || undefined : undefined
      );
      
      router.push("/promise-item");
    } catch (err) {
      console.error('Error updating promise item:', err);
      setError(err instanceof Error ? err.message : "Terjadi kesalahan saat memperbarui promise item");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Promise Item"
        backUrl="/promise-item"
        actions={
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => router.push("/promise-item")}
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

              {/* Promise Item Information */}
              <FormSection title="Informasi Promise Item">
                <div className="space-y-4">
                  {/* Promise Item Title */}
                  <div className="space-y-2">
                    <InputMultipage 
                      value={formData.title[activeTab]}
                      onChange={(e) => handleInputChange("title", e.target.value, activeTab)}
                      label={`Judul ${activeTab === "id" ? "(Indonesia)" : "(English)"}`}
                      language={activeTab}
                      required={activeTab === "id"}
                      placeholder={`Masukkan judul ${activeTab === "id" ? "dalam Bahasa Indonesia" : "in English"}`}
                    />
                  </div>
                  
                  {/* Promise Item Subtitle */}
                  <div className="space-y-2">
                    <InputMultipage 
                      value={formData.subtitle[activeTab]}
                      onChange={(e) => handleInputChange("subtitle", e.target.value, activeTab)}
                      label={`Subjudul ${activeTab === "id" ? "(Indonesia)" : "(English)"}`}
                      language={activeTab}
                      required={activeTab === "id"}
                      placeholder={`Masukkan subjudul ${activeTab === "id" ? "dalam Bahasa Indonesia" : "in English"}`}
                    />
                  </div>
                </div>
              </FormSection>
            </div>

            {/* Sidebar - 1/3 width */}
            <div className="space-y-6">
              <FormSection title="Icon Promise Item">
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
                      {currentIcon && (
                        <div className="mb-4">
                          <p className="text-sm font-medium mb-2">Icon Saat Ini:</p>
                          <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                            <img 
                              src={getIconUrl(currentIcon)} 
                              alt="Current icon" 
                              className="h-full w-full object-contain"
                            />
                          </div>
                        </div>
                      )}
                      <ImageUpload
                        onChange={handleImageChange}
                        value={iconFile}
                        maxSize={5 * 1024 * 1024} // 5MB
                        accept="image/*"
                        label="Upload Icon Baru"
                        description="Format: JPG, PNG, SVG. Maks. 5MB."
                      />
                    </>
                  ) : (
                    <InputMultipage
                      label="Class Icon"
                      value={iconClass}
                      onChange={(e) => setIconClass(e.target.value)}
                      placeholder="Contoh: fa fa-code, bi bi-code-slash"
                      required={true}
                      helperText="Masukkan class icon dari Font Awesome, Bootstrap Icons, dsb."
                    />
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