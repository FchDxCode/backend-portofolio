"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageHeader } from "@/src/components/multipage/PageHeader";
import { Button } from "@/src/components/multipage/Button";
import { FormSection } from "@/src/components/multipage/FormSection";
import { DetailView } from "@/src/components/multipage/DetailView";
import { ImageUpload } from "@/src/components/multipage/ImageUpload";
import { DocumentUpload } from "@/src/components/multipage/DocumentUpload";
import { InputMultipage } from "@/src/components/multipage/InputMultipage";
import { DropdownMultipage } from "@/src/components/multipage/DropdownMultipage";
import { useCertificates } from "@/src/hook/useCertificate";
import { useSkills } from "@/src/hook/skill/useSkill";
import { Certificate } from "@/src/models/CertificateModels";
import { Skill } from "@/src/models/SkillModels";
import { CertificateService } from "@/src/services/CertificateServices";

// Define form data type
type FormData = {
  title: { id: string; en: string };
  description: { id: string; en: string };
  issued_by: string;
  issued_date: string;
  valid_until: string;
  credential_id: string;
  skills: number[];
};

export default function CertificateEditPage() {
  const router = useRouter();
  const { id } = useParams();
  const certificateId = typeof id === 'string' ? parseInt(id, 10) : 0;
  
  const { updateCertificate, loadingAction } = useCertificates();
  const { skills: allSkills, loading: loadingSkills } = useSkills();
  
  // Language tab state
  const [activeTab, setActiveTab] = useState<"id" | "en">("id");
  
  // Form state
  const [formData, setFormData] = useState<FormData>({
    title: { id: "", en: "" },
    description: { id: "", en: "" },
    issued_by: "",
    issued_date: "",
    valid_until: "",
    credential_id: "",
    skills: []
  });
  
  // File states
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [currentPdfUrl, setCurrentPdfUrl] = useState<string | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
  
  // UI state
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Load certificate data
  useEffect(() => {
    const fetchCertificate = async () => {
      try {
        setLoading(true);
        const certificate = await CertificateService.getById(certificateId);
        
        if (!certificate) {
          setError("Sertifikat tidak ditemukan");
          return;
        }
        
        // Populate form data
        setFormData({
          title: {
            id: certificate.title?.id || "",
            en: certificate.title?.en || ""
          },
          description: {
            id: certificate.description?.id || "",
            en: certificate.description?.en || ""
          },
          issued_by: certificate.issued_by || "",
          issued_date: certificate.issued_date || "",
          valid_until: certificate.valid_until || "",
          credential_id: certificate.credential_id || "",
          skills: certificate.skills || []
        });
        
        // Set file URLs if they exist
        if (certificate.pdf) {
          setCurrentPdfUrl(certificate.pdf);
        }
        
        if (certificate.image) {
          setCurrentImageUrl(certificate.image);
        }
      } catch (err) {
        setError("Gagal memuat data sertifikat");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    if (certificateId) {
      fetchCertificate();
    }
  }, [certificateId]);

  // Handle input change for text fields
  const handleInputChange = (field: keyof FormData, value: any, lang?: "id" | "en") => {
    if (lang) {
      // For multilingual fields
      if (field === 'title' || field === 'description') {
        setFormData(prev => ({
          ...prev,
          [field]: {
            ...prev[field],
            [lang]: value
          }
        }));
      }
    } else {
      // For regular fields
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    setError(null);
    
    if (!formData.title.id) {
      setError("Judul (Indonesia) wajib diisi");
      return false;
    }
    
    if (!formData.issued_by) {
      setError("Penerbit sertifikat wajib diisi");
      return false;
    }
    
    if (!formData.issued_date) {
      setError("Tanggal terbit wajib diisi");
      return false;
    }
    
    // Check if issued_date is before valid_until
    if (formData.issued_date && formData.valid_until) {
      const issueDate = new Date(formData.issued_date);
      const validUntil = new Date(formData.valid_until);
      
      if (issueDate >= validUntil) {
        setError("Tanggal terbit harus sebelum tanggal kedaluwarsa");
        return false;
      }
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
      // Update certificate with files if changed
      await updateCertificate(
        certificateId,
        formData,
        {
          pdf: pdfFile || undefined,
          image: imageFile || undefined
        }
      );
      
      // Redirect to certificate list
      router.push("/certificate");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan saat menyimpan sertifikat");
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Sertifikat"
        backUrl="/certificate"
        actions={
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => router.push("/certificate")}
            >
              Batal
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              isLoading={loadingAction}
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

              {/* Certificate content */}
              <FormSection title="Informasi Sertifikat">
                <div className="space-y-4">
                  {/* Title */}
                  <div className="space-y-2">
                    <InputMultipage 
                      value={formData.title[activeTab]}
                      onChange={(e) => handleInputChange("title", e.target.value, activeTab)}
                      label={`Judul Sertifikat ${activeTab === "id" ? "(Indonesia)" : "(English)"}`}
                      language={activeTab}
                      required={activeTab === "id"}
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <InputMultipage 
                      value={formData.description[activeTab]}
                      onChange={(e) => handleInputChange("description", e.target.value, activeTab)}
                      label={`Deskripsi ${activeTab === "id" ? "(Indonesia)" : "(English)"}`}
                      language={activeTab}
                    />
                  </div>
                </div>
              </FormSection>

              {/* Certificate details */}
              <FormSection title="Detail Sertifikasi">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Issued By */}
                  <div className="space-y-2">
                    <InputMultipage 
                      value={formData.issued_by}
                      onChange={(e) => handleInputChange("issued_by", e.target.value)}
                      label="Penerbit Sertifikat"
                      placeholder="Contoh: Google, Microsoft, Coursera"
                      required={true}
                      language={activeTab}
                    />
                  </div>
                  
                  {/* Credential ID */}
                  <div className="space-y-2">
                    <InputMultipage 
                      value={formData.credential_id}
                      onChange={(e) => handleInputChange("credential_id", e.target.value)}
                      label="ID Kredensial"
                      placeholder="Contoh: ABC123XYZ"
                      language={activeTab}
                    />
                  </div>
                  
                  {/* Issued Date */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium block">
                      Tanggal Terbit <span className="text-destructive">*</span>
                    </label>
                    <input
                      type="date"
                      value={formData.issued_date}
                      onChange={(e) => handleInputChange("issued_date", e.target.value)}
                      className="w-full rounded-md border border-input bg-background p-3 text-sm focus:border-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring transition-all duration-200"
                      required
                    />
                  </div>
                  
                  {/* Valid Until */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium block">
                      Berlaku Hingga
                    </label>
                    <input
                      type="date"
                      value={formData.valid_until}
                      onChange={(e) => handleInputChange("valid_until", e.target.value)}
                      className="w-full rounded-md border border-input bg-background p-3 text-sm focus:border-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring transition-all duration-200"
                    />
                    <p className="text-xs text-muted-foreground">
                      Kosongkan jika sertifikat tidak memiliki masa berlaku
                    </p>
                  </div>
                </div>
              </FormSection>
            </div>

            {/* Sidebar - 1/3 width */}
            <div className="space-y-6">
              {/* Files */}
              <FormSection title="Berkas Sertifikat">
                <div className="space-y-4">
                  {/* PDF Certificate */}
                  <div>
                    <DocumentUpload
                       onChange={(file) => {
                           setPdfFile(file);
                           // kalau file = null, berarti user klik hapus → clear URL lama juga
                           if (file === null) {
                             setCurrentPdfUrl(null);
                           }
                         }}
                      value={ currentPdfUrl}
                      maxSize={5}
                      label="Unggah PDF Sertifikat"
                      description="Format: PDF. Maks 5MB."
                      accept="application/pdf,.pdf"
                    />
                  </div>
                  
                  {/* Image Certificate */}
                  <div>
                    <ImageUpload
                      onChange={setImageFile}
                      value={imageFile}
                      maxSize={2}   
                      aspectRatio="wide"
                      label="Unggah Gambar Sertifikat"
                      description="Format: JPG, PNG, WebP. Maks 2MB."
                    />
                  </div>
                </div>
              </FormSection>

              {/* Skills */}
              <FormSection title="Keterampilan Terkait">
                <div className="space-y-2">
                  <DropdownMultipage 
                    label="Keterampilan"
                    value={formData.skills}
                    onChange={(value) => handleInputChange("skills", value)}
                    options={
                      allSkills?.map((skill: Skill) => ({
                        value: skill.id,
                        label: skill.title?.id || skill.title?.en || `Skill ${skill.id}`
                      })) || []
                    }
                    placeholder="Pilih keterampilan terkait"
                    isMultiple={true}
                  />
                  <p className="text-xs text-muted-foreground">
                    Pilih keterampilan yang terkait dengan sertifikat ini
                  </p>
                </div>
              </FormSection>
            </div>
          </div>
        </DetailView>
      </form>
    </div>
  );
}