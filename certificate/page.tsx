"use client";

import { useState } from "react";
import { useCertificates } from "@/src/hook/useCertificate";
import { Column, DataTable } from "@/src/components/multipage/DataTable";
import { ActionButton } from "@/src/components/multipage/ActionButton";
import { Certificate } from "@/src/models/CertificateModels";
import { 
  PlusCircle, 
  Pencil, 
  Trash2, 
  FileText, 
  Image as ImageIcon,
  Eye
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CertificatePage() {
  const router = useRouter();
  const { 
    certificates, 
    loading, 
    totalCount, 
    filters, 
    setFilters,
    deleteCertificate,
    isValid
  } = useCertificates();

  // Handle delete
  const handleDelete = async (certificate: Certificate) => {
    if (confirm("Apakah Anda yakin ingin menghapus sertifikat ini?")) {
      try {
        await deleteCertificate(certificate.id);
      } catch (error) {
        alert("Gagal menghapus sertifikat");
      }
    }
  };

  // Table columns
  const columns = [
    {
      header: "Judul",
      accessor: (cert: Certificate) => (
        <div>
          <p className="font-medium">{cert.title?.id || cert.title?.en || "-"}</p>
          {cert.title?.en && cert.title?.en !== cert.title?.id && (
            <p className="text-xs text-gray-500">{cert.title.en}</p>
          )}
        </div>
      ),
      sortable: true
    },
    {
      header: "Dikeluarkan Oleh",
      accessor: "issued_by",
      sortable: true
    },
    {
      header: "Tanggal",
      accessor: (cert: Certificate) => (
        <div>
          <p>Dikeluarkan: {cert.issued_date ? new Date(cert.issued_date).toLocaleDateString() : "-"}</p>
          <p>Berlaku hingga: {cert.valid_until ? new Date(cert.valid_until).toLocaleDateString() : "Selamanya"}</p>
        </div>
      )
    },
    {
      header: "Status",
      accessor: (cert: Certificate) => (
        <span className={`px-2 py-1 rounded-full text-xs ${isValid(cert) ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
          {isValid(cert) ? "Valid" : "Kedaluwarsa"}
        </span>
      )
    },
    {
      header: "File",
      accessor: (cert: Certificate) => (
        <div className="flex space-x-2">
          {cert.pdf && (
            <a 
              href={cert.pdf} 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-1 rounded-md hover:bg-gray-100"
            >
              <FileText size={16} className="text-blue-500" />
            </a>
          )}
          {cert.image && (
            <a 
              href={cert.image} 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-1 rounded-md hover:bg-gray-100"
            >
              <ImageIcon size={16} className="text-green-500" />
            </a>
          )}
        </div>
      )
    }
  ];

  // Action buttons for table rows
  const actions = [
    {
      label: "Lihat",
      icon: <Eye size={14} />,
      onClick: (cert: Certificate) => router.push(`/certificate/${cert.id}`),
      variant: "primary" as const
    },
    {
      label: "Edit",
      icon: <Pencil size={14} />,
      onClick: (cert: Certificate) => router.push(`/certificate/${cert.id}/edit`),
      variant: "secondary" as const
    },
    {
      label: "Hapus",
      icon: <Trash2 size={14} />,
      onClick: handleDelete,
      variant: "danger" as const
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Sertifikat</h1>
        <Link href="/certificate/new">
          <ActionButton 
            variant="primary"
            icon={<PlusCircle size={16} />}
          >
            Tambah Sertifikat
          </ActionButton>
        </Link>
      </div>

      {/* Certificate list */}
      <DataTable
        data={certificates}
        columns={columns as Column<Certificate>[]}
        actions={actions}
        keyField="id"
        isLoading={loading}
        emptyMessage="Belum ada sertifikat"
      />
    </div>
  );
}