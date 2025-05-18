"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageHeader } from "@/src/components/multipage/PageHeader";
import { Button } from "@/src/components/multipage/Button";
import { DetailView, DetailItem } from "@/src/components/multipage/DetailView";
import { CertificateService } from "@/src/services/CertificateServices";
import { Certificate } from "@/src/models/CertificateModels";
import { useSkills } from "@/src/hook/skill/useSkill";
import { Skill } from "@/src/models/SkillModels";
import { Calendar, Award, FileText, Image, Link2, Clock, CalendarCheck2, CheckCircle, XCircle } from "lucide-react";

export default function CertificateDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const certificateId = typeof id === 'string' ? parseInt(id, 10) : 0;
  
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const { skills: allSkills } = useSkills();
  
  // Get skills associated with this certificate
  const certificateSkills = allSkills?.filter(skill => 
    certificate?.skills?.includes(skill.id)
  ) || [];

  // Format date in locale format
  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Check if certificate is valid
  const isValid = (cert: Certificate) => {
    return CertificateService.isValid(cert);
  };

  // Load certificate data
  useEffect(() => {
    const fetchCertificate = async () => {
      try {
        setLoading(true);
        const data = await CertificateService.getById(certificateId);
        
        if (!data) {
          setError("Sertifikat tidak ditemukan");
          return;
        }
        
        setCertificate(data);
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

  // Handle delete certificate
  const handleDelete = async () => {
    if (!confirm("Apakah Anda yakin ingin menghapus sertifikat ini?")) {
      return;
    }
    
    try {
      setLoading(true);
      await CertificateService.delete(certificateId);
      router.push("/certificate");
    } catch (err) {
      setError("Gagal menghapus sertifikat");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !certificate) {
    return (
      <div className="bg-destructive/10 text-destructive p-4 rounded-md">
        <h3 className="font-medium">Error</h3>
        <p>{error || "Sertifikat tidak ditemukan"}</p>
        <Button 
          variant="outline" 
          onClick={() => router.push("/certificate")}
          className="mt-4"
        >
          Kembali ke Daftar Sertifikat
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={certificate.title?.id || certificate.title?.en || "Detail Sertifikat"}
        // subtitle={certificate.issued_by}
        backUrl="/certificate"
        actions={
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => router.push("/certificate")}
            >
              Kembali
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push(`/certificate/${certificateId}/edit`)}
            >
              Edit
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
            >
              Hapus
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main content - 2/3 width */}
        <div className="md:col-span-2 space-y-6">
          {/* Certificate info */}
          <DetailView title="Informasi Sertifikat">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <DetailItem 
                  label="Judul (Indonesia)" 
                  icon={<Award size={16} />}
                >
                  {certificate.title?.id || <span className="italic text-muted-foreground">Tidak tersedia</span>}
                </DetailItem>
                
                <DetailItem 
                  label="Deskripsi (Indonesia)"
                >
                  {certificate.description?.id || <span className="italic text-muted-foreground">Tidak tersedia</span>}
                </DetailItem>
              </div>
              
              <div>
                <DetailItem 
                  label="Judul (English)" 
                  icon={<Award size={16} />}
                >
                  {certificate.title?.en || <span className="italic text-muted-foreground">Tidak tersedia</span>}
                </DetailItem>
                
                <DetailItem 
                  label="Deskripsi (English)"
                >
                  {certificate.description?.en || <span className="italic text-muted-foreground">Tidak tersedia</span>}
                </DetailItem>
              </div>
            </div>
          </DetailView>

          {/* Certificate details */}
          <DetailView title="Detail Sertifikasi">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <DetailItem 
                  label="Penerbit Sertifikat" 
                  icon={<Award size={16} />}
                >
                  {certificate.issued_by || <span className="italic text-muted-foreground">Tidak tersedia</span>}
                </DetailItem>
                
                <DetailItem 
                  label="ID Kredensial" 
                  icon={<Link2 size={16} />}
                >
                  {certificate.credential_id || <span className="italic text-muted-foreground">Tidak tersedia</span>}
                </DetailItem>
              </div>
              
              <div>
                <DetailItem 
                  label="Tanggal Terbit" 
                  icon={<Calendar size={16} />}
                >
                  {formatDate(certificate.issued_date) || <span className="italic text-muted-foreground">Tidak tersedia</span>}
                </DetailItem>
                
                <DetailItem 
                  label="Berlaku Hingga" 
                  icon={<CalendarCheck2 size={16} />}
                >
                  {formatDate(certificate.valid_until) || <span className="italic text-muted-foreground">Tidak memiliki masa berlaku</span>}
                </DetailItem>
                
                <DetailItem 
                  label="Status" 
                  icon={isValid(certificate) ? <CheckCircle size={16} className="text-green-500" /> : <XCircle size={16} className="text-red-500" />}
                >
                  <span className={isValid(certificate) ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                    {isValid(certificate) ? "Masih Berlaku" : "Sudah Kedaluwarsa"}
                  </span>
                </DetailItem>
              </div>
            </div>
          </DetailView>
          
          {/* Skills */}
          <DetailView title="Keterampilan Terkait">
            {certificateSkills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {certificateSkills.map(skill => (
                  <div 
                    key={skill.id}
                    className="bg-muted px-3 py-1 rounded-full text-sm"
                  >
                    {skill.title?.id || skill.title?.en || `Skill ${skill.id}`}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">
                Tidak ada keterampilan terkait
              </p>
            )}
          </DetailView>
        </div>

        {/* Sidebar - 1/3 width */}
        <div className="space-y-6">
          {/* Certificate Files */}
          <DetailView title="Berkas Sertifikat">
            <div className="space-y-4">
              {/* PDF Certificate */}
              <DetailItem 
                label="PDF Sertifikat" 
                icon={<FileText size={16} />}
              >
                {certificate.pdf ? (
                  <div className="flex flex-col gap-2">
                    <a 
                      href={certificate.pdf} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline inline-flex items-center gap-1"
                    >
                      <FileText size={14} />
                      Lihat PDF
                    </a>
                    <a 
                      href={certificate.pdf} 
                      download
                      className="text-primary hover:underline inline-flex items-center gap-1"
                    >
                      <FileText size={14} />
                      Unduh PDF
                    </a>
                  </div>
                ) : (
                  <span className="italic text-muted-foreground">Tidak ada file PDF</span>
                )}
              </DetailItem>
              
              {/* Image Certificate */}
              <DetailItem 
                label="Gambar Sertifikat" 
                icon={<Image size={16} />}
              >
                {certificate.image ? (
                  <div className="mt-2">
                    <img 
                      src={certificate.image} 
                      alt="Certificate" 
                      className="max-w-full rounded-md border border-border"
                    />
                  </div>
                ) : (
                  <span className="italic text-muted-foreground">Tidak ada gambar</span>
                )}
              </DetailItem>
            </div>
          </DetailView>
          
          {/* Metadata */}
          <DetailView title="Metadata">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">ID</span>
                <span>{certificate.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Dibuat</span>
                <span>{formatDate(certificate.created_at)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Diperbarui</span>
                <span>{formatDate(certificate.updated_at)}</span>
              </div>
            </div>
          </DetailView>
        </div>
      </div>
    </div>
  );
}