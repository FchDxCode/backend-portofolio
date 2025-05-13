"use client";

import { useState, useEffect } from "react";
import { useCertificates } from "@/src/hook/useCertificate";
import { FormContainer } from "@/src/components/multipage/FormContainer";
import { FormSection } from "@/src/components/multipage/FormSection";
import { FormField } from "@/src/components/multipage/FormField";
import { ActionButton } from "@/src/components/multipage/ActionButton";
import { 
  Calendar,
  Award,
  ExternalLink,
  ArrowLeft,
  FileText,
  Image as ImageIcon
} from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { CertificateService } from "@/src/services/CertificateServices";
import { Certificate } from "@/src/models/CertificateModels";

export default function EditCertificatePage() {
  const router = useRouter();
  const params = useParams();
  const id = Number(params.id);
  
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Form fields
  const [title, setTitle] = useState<Record<string, any>>({ id: "", en: "" });
  const [description, setDescription] = useState<Record<string, any>>({ id: "", en: "" });
  const [skillId, setSkillId] = useState<number | undefined>(undefined);
  const [issuedBy, setIssuedBy] = useState("");
  const [issuedDate, setIssuedDate] = useState("");
  const [credentialId, setCredentialId] = useState("");
  const [validUntil, setValidUntil] = useState("");

  const { updateCertificate } = useCertificates();

  // Fetch certificate data
  useEffect(() => {
    const fetchCertificate = async () => {
      try {
        setIsLoading(true);
        const data = await CertificateService.getById(id);
        if (data) {
          setCertificate(data);
          // Set form fields
          setTitle(data.title || { id: "", en: "" });
          setDescription(data.description || { id: "", en: "" });
          setSkillId(data.skill_id);
          setIssuedBy(data.issued_by || "");
          setIssuedDate(data.issued_date || "");
          setCredentialId(data.credential_id || "");
          setValidUntil(data.valid_until || "");
        }
      } catch (error) {
        setFormError("Gagal memuat data sertifikat");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchCertificate();
    }
  }, [id]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!certificate) return;
    
    try {
      const certificateData = {
        title,
        description,
        skill_id: skillId,
        issued_by: issuedBy,
        issued_date: issuedDate,
        credential_id: credentialId,
        valid_until: validUntil,
      };

      const files = {
        pdf: pdfFile || undefined,
        image: imageFile || undefined
      };

      // Update certificate
      await updateCertificate(certificate.id, certificateData, files);
      setFormSuccess("Sertifikat berhasil diperbarui");
      
      // Redirect after successful update
      setTimeout(() => {
        router.push("/certificate");
      }, 1500);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Terjadi kesalahan");
    }
  };

  // Handle file input changes
  const handlePdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPdfFile(e.target.files[0]);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Memuat data...</div>;
  }

  if (!certificate) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-red-600">Sertifikat tidak ditemukan</h2>
        <Link href="/certificate" className="mt-4 inline-block">
          <ActionButton variant="primary">Kembali ke Daftar</ActionButton>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center mb-6">
        <Link href="/certificate">
          <ActionButton 
            variant="secondary"
            icon={<ArrowLeft size={16} />}
            size="small"
          >
            Kembali
          </ActionButton>
        </Link>
        <h1 className="text-2xl font-bold ml-4">Edit Sertifikat</h1>
      </div>

      <FormContainer
        onSubmit={handleSubmit}
        isLoading={isLoading}
        error={formError}
        success={formSuccess}
        submitLabel="Perbarui Sertifikat"
      >
        <FormSection title="Informasi Dasar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Judul (ID)" required>
              <input
                type="text"
                value={title?.id || ""}
                onChange={(e) => setTitle({ ...title, id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </FormField>
            
            <FormField label="Judul (EN)">
              <input
                type="text"
                value={title?.en || ""}
                onChange={(e) => setTitle({ ...title, en: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Deskripsi (ID)">
              <textarea
                value={description?.id || ""}
                onChange={(e) => setDescription({ ...description, id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            </FormField>
            
            <FormField label="Deskripsi (EN)">
              <textarea
                value={description?.en || ""}
                onChange={(e) => setDescription({ ...description, en: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            </FormField>
          </div>
        </FormSection>

        <FormSection title="Detail Sertifikat">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Dikeluarkan Oleh" required>
              <div className="flex items-center border border-gray-300 rounded-md focus-within:ring-2 focus-within:ring-blue-500">
                <span className="px-3 text-gray-500">
                  <Award size={16} />
                </span>
                <input
                  type="text"
                  value={issuedBy}
                  onChange={(e) => setIssuedBy(e.target.value)}
                  className="w-full px-0 py-2 border-0 focus:outline-none focus:ring-0"
                  required
                />
              </div>
            </FormField>
            
            <FormField label="ID Kredensial">
              <div className="flex items-center border border-gray-300 rounded-md focus-within:ring-2 focus-within:ring-blue-500">
                <span className="px-3 text-gray-500">
                  <ExternalLink size={16} />
                </span>
                <input
                  type="text"
                  value={credentialId}
                  onChange={(e) => setCredentialId(e.target.value)}
                  className="w-full px-0 py-2 border-0 focus:outline-none focus:ring-0"
                />
              </div>
            </FormField>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Tanggal Dikeluarkan" required>
              <div className="flex items-center border border-gray-300 rounded-md focus-within:ring-2 focus-within:ring-blue-500">
                <span className="px-3 text-gray-500">
                  <Calendar size={16} />
                </span>
                <input
                  type="date"
                  value={issuedDate}
                  onChange={(e) => setIssuedDate(e.target.value)}
                  className="w-full px-0 py-2 border-0 focus:outline-none focus:ring-0"
                  required
                />
              </div>
            </FormField>
            
            <FormField label="Berlaku Hingga">
              <div className="flex items-center border border-gray-300 rounded-md focus-within:ring-2 focus-within:ring-blue-500">
                <span className="px-3 text-gray-500">
                  <Calendar size={16} />
                </span>
                <input
                  type="date"
                  value={validUntil}
                  onChange={(e) => setValidUntil(e.target.value)}
                  className="w-full px-0 py-2 border-0 focus:outline-none focus:ring-0"
                  placeholder="Kosongkan jika berlaku selamanya"
                />
              </div>
            </FormField>
          </div>
        </FormSection>

        <FormSection title="File Sertifikat">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField 
              label="PDF Sertifikat" 
              description={certificate.pdf ? "Unggah file baru untuk mengganti yang ada" : ""}
            >
              <div className="flex items-center">
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handlePdfChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {certificate.pdf && (
                  <a 
                    href={certificate.pdf} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="ml-2 p-2 text-blue-500 hover:text-blue-700"
                  >
                    <FileText size={20} />
                  </a>
                )}
              </div>
            </FormField>
            
            <FormField 
              label="Gambar Sertifikat" 
              description={certificate.image ? "Unggah file baru untuk mengganti yang ada" : ""}
            >
              <div className="flex items-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {certificate.image && (
                  <a 
                    href={certificate.image} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="ml-2 p-2 text-green-500 hover:text-green-700"
                  >
                    <ImageIcon size={20} />
                  </a>
                )}
              </div>
            </FormField>
          </div>
        </FormSection>
      </FormContainer>
    </div>
  );
}