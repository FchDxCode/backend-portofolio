"use client";

import { useState, useEffect } from "react";
import { ActionButton } from "@/src/components/multipage/ActionButton";
import { 
  ArrowLeft,
  Pencil,
  Trash2,
  Calendar,
  Award,
  ExternalLink,
  FileText,
  Image as ImageIcon,
  Check,
  X
} from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { CertificateService } from "@/src/services/CertificateServices";
import { Certificate } from "@/src/models/CertificateModels";
import { useCertificates } from "@/src/hook/useCertificate";

export default function CertificateDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = Number(params.id);
  
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { deleteCertificate, isValid } = useCertificates();

  // Fetch certificate data
  useEffect(() => {
    const fetchCertificate = async () => {
      try {
        setIsLoading(true);
        const data = await CertificateService.getById(id);
        setCertificate(data);
      } catch (error) {
        setError("Gagal memuat data sertifikat");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchCertificate();
    }
  }, [id]);

  // Handle delete
  const handleDelete = async () => {
    if (!certificate) return;
    
    if (confirm("Apakah Anda yakin ingin menghapus sertifikat ini?")) {
      try {
        await deleteCertificate(certificate.id);
        router.push("/certificate");
      } catch (error) {
        alert("Gagal menghapus sertifikat");
      }
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Memuat data...</div>;
  }

  if (error || !certificate) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-red-600">
          {error || "Sertifikat tidak ditemukan"}
        </h2>
        <Link href="/certificate" className="mt-4 inline-block">
          <ActionButton variant="primary">Kembali ke Daftar</ActionButton>
        </Link>
      </div>
    );
  }

  const validStatus = isValid(certificate);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Link href="/certificate">
            <ActionButton 
              variant="secondary"
              icon={<ArrowLeft size={16} />}
              size="small"
            >
              Kembali
            </ActionButton>
          </Link>
          <h1 className="text-2xl font-bold ml-4">Detail Sertifikat</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <Link href={`/certificate/${certificate.id}/edit`}>
            <ActionButton 
              variant="secondary"
              icon={<Pencil size={16} />}
            >
              Edit
            </ActionButton>
          </Link>
          
          <ActionButton 
            variant="danger"
            icon={<Trash2 size={16} />}
            onClick={handleDelete}
          >
            Hapus
          </ActionButton>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Header with status */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold">{certificate.title?.id || certificate.title?.en}</h2>
            {certificate.title?.en && certificate.title?.id !== certificate.title?.en && (
              <p className="text-sm text-gray-500">{certificate.title.en}</p>
            )}
          </div>
          
          <div className={`px-3 py-1.5 rounded-full text-sm flex items-center gap-1.5 ${
            validStatus ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}>
            {validStatus ? (
              <>
                <Check size={16} />
                <span>Valid</span>
              </>
            ) : (
              <>
                <X size={16} />
                <span>Kedaluwarsa</span>
              </>
            )}
          </div>
        </div>
        
        {/* Certificate details */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
                Deskripsi
              </h3>
              {certificate.description?.id && (
                <div className="mb-2">
                  <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {certificate.description.id}
                  </p>
                </div>
              )}
              {certificate.description?.en && certificate.description?.id !== certificate.description?.en && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 whitespace-pre-wrap">
                    {certificate.description.en}
                  </p>
                </div>
              )}
              {!certificate.description?.id && !certificate.description?.en && (
                <p className="text-sm text-gray-500 italic">Tidak ada deskripsi</p>
              )}
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
                Informasi Sertifikat
              </h3>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <Award size={16} className="text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Dikeluarkan Oleh
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {certificate.issued_by || "-"}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <Calendar size={16} className="text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Tanggal Dikeluarkan
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {certificate.issued_date ? new Date(certificate.issued_date).toLocaleDateString() : "-"}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <Calendar size={16} className="text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Berlaku Hingga
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {certificate.valid_until ? new Date(certificate.valid_until).toLocaleDateString() : "Selamanya"}
                    </p>
                  </div>
                </div>
                
                {certificate.credential_id && (
                  <div className="flex items-start gap-2">
                    <ExternalLink size={16} className="text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        ID Kredensial
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {certificate.credential_id}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            {/* Certificate files */}
            <div>
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">
                File Sertifikat
              </h3>
              
              <div className="grid grid-cols-1 gap-4">
                {certificate.image && (
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <ImageIcon size={16} className="text-green-500" />
                        <span className="text-sm font-medium">Gambar Sertifikat</span>
                      </div>
                      <a 
                        href={certificate.image} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:text-blue-700 text-sm"
                      >
                        Lihat
                      </a>
                    </div>
                    <div className="p-3">
                      <div className="aspect-[4/3] relative bg-gray-100 dark:bg-gray-700 rounded overflow-hidden">
                        <img 
                          src={certificate.image} 
                          alt={certificate.title?.id || certificate.title?.en || "Certificate"} 
                          className="object-contain w-full h-full"
                        />
                      </div>
                    </div>
                  </div>
                )}
                
                {certificate.pdf && (
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <FileText size={16} className="text-blue-500" />
                        <span className="text-sm font-medium">PDF Sertifikat</span>
                      </div>
                      <a 
                        href={certificate.pdf} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:text-blue-700 text-sm"
                      >
                        Unduh
                      </a>
                    </div>
                    <div className="p-3 flex items-center justify-center bg-gray-50 dark:bg-gray-800">
                      <div className="flex items-center gap-2 text-gray-500">
                        <FileText size={24} />
                        <span>PDF Document</span>
                      </div>
                    </div>
                  </div>
                )}
                
                {!certificate.image && !certificate.pdf && (
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-8 text-center">
                    <p className="text-gray-500 dark:text-gray-400">
                      Tidak ada file yang tersedia
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Created/Updated info */}
            <div className="text-xs text-gray-500 pt-4 border-t border-gray-200 dark:border-gray-700">
              <p>Dibuat: {certificate.created_at ? new Date(certificate.created_at).toLocaleString() : "-"}</p>
              <p>Diperbarui: {certificate.updated_at ? new Date(certificate.updated_at).toLocaleString() : "-"}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}