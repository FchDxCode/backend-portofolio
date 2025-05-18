"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Edit,
  Trash2,
  PlusCircle,
  CheckCircle,
  XCircle,
  Eye,
} from "lucide-react";

import { useCertificates } from "@/src/hook/useCertificate";
import { Certificate } from "@/src/models/CertificateModels";

import { PageHeader } from "@/src/components/multipage/PageHeader";
import { Filter } from "@/src/components/multipage/Filter";
import { Table } from "@/src/components/multipage/Table";
import { Pagination } from "@/src/components/multipage/Pagination";
import { Button } from "@/src/components/multipage/Button";
import { CertificateService } from "@/src/services/CertificateServices";

export default function CertificatePage() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const {
    certificates,
    loadingList,
    deleteCertificate,
    filters,
    setFilters,
  } = useCertificates({
    isValid: undefined,
    sort: "created_at",
    order: "desc",
  });

  const handleFilterChange = (
    draft: Record<string, string | string[] | boolean | null>
  ) => {
    if (typeof draft.search === "string") {
      setSearchQuery(draft.search);
    } else {
      setSearchQuery("");
    }

    const next = { ...filters };

    if (draft.status !== undefined) {
      next.isValid =
        draft.status === "valid"
          ? true
          : draft.status === "expired"
          ? false
          : undefined;
    }

    if (draft.sort !== undefined) {
      const sortValue = draft.sort as string;
      if (sortValue) {
        const [field, ord] = sortValue.split("-");
        next.sort = field as
          | "created_at"
          | "issued_date"
          | "valid_until";
        next.order = ord as "asc" | "desc";
      } else {
        next.sort = "created_at";
        next.order = "desc";
      }
    }

    setFilters(next);
    setCurrentPage(1);
  };

  const itemsPerPage = 10;
  const searchLower = searchQuery.toLowerCase();

  const filteredCertificates = certificates.filter((cert) => {
    if (!searchQuery) return true;
    const title =
      cert.title?.id ||
      cert.title?.en ||
      cert.issued_by ||
      "";
    return title.toLowerCase().includes(searchLower);
  });

  const totalPages = Math.ceil(filteredCertificates.length / itemsPerPage);
  const displayed = filteredCertificates.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleDelete = async (cert: Certificate) => {
    if (
      confirm(
        `Hapus sertifikat "${cert.title?.id || cert.title?.en}"?`
      )
    ) {
      try {
        await deleteCertificate(cert.id);
      } catch (err) {
        alert("Gagal menghapus sertifikat");
        console.error(err);
      }
    }
  };

  const columns = [
    {
      header: "Judul",
      accessor: (cert: Certificate) => (
        <div>
          <p className="font-medium">{cert.title?.id || "-"}</p>
          {cert.title?.en && cert.title.id !== cert.title.en && (
            <p className="text-xs text-muted-foreground">
              {cert.title.en}
            </p>
          )}
        </div>
      ),
      sortable: true,
    },
    {
      header: "Penerbit",
      accessor: (cert: Certificate) => cert.issued_by || "-",
    },
    {
      header: "Tanggal Terbit",
      accessor: (cert: Certificate) =>
        cert.issued_date
          ? new Date(cert.issued_date).toLocaleDateString("id-ID", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })
          : "-",
      sortable: true,
    },
    {
      header: "Berlaku Hingga",
      accessor: (cert: Certificate) =>
        cert.valid_until
          ? new Date(cert.valid_until).toLocaleDateString("id-ID", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })
          : "-",
      sortable: true,
    },
    {
      header: "Status",
      accessor: (cert: Certificate) => {
        const valid = CertificateService.isValid(cert);
        return (
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
              valid
                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
            }`}
          >
            {valid ? (
              <>
                <CheckCircle size={12} />
                Valid
              </>
            ) : (
              <>
                <XCircle size={12} />
                Expired
              </>
            )}
          </span>
        );
      },
    },
  ];

  const actions = [
    {
      label: "Detail",
      icon: <Eye size={14} />,
      onClick: (cert: Certificate) =>
        router.push(`/certificate/${cert.id}`),
      variant: "secondary" as const,
    },
    {
      label: "Edit",
      icon: <Edit size={14} />,
      onClick: (cert: Certificate) =>
        router.push(`/certificate/${cert.id}/edit`),
      variant: "secondary" as const,
    },
    {
      label: "Hapus",
      icon: <Trash2 size={14} />,
      onClick: handleDelete,
      variant: "destructive" as const,
    },
  ];

  const filterOptionConfig = {
    status: {
      label: "Status",
      options: [
        { label: "Valid", value: "valid" },
        { label: "Expired", value: "expired" },
      ],
    },
    sort: {
      label: "Urutan",
      options: [
        { label: "Terbaru Dibuat", value: "created_at-desc" },
        { label: "Terlama Dibuat", value: "created_at-asc" },
        { label: "Terbaru Terbit", value: "issued_date-desc" },
        { label: "Terlama Terbit", value: "issued_date-asc" },
        { label: "Terdekat Kadaluarsa", value: "valid_until-asc" },
        { label: "Terjauh Kadaluarsa", value: "valid_until-desc" },
        { label: "Judul A-Z", value: "title-asc" },
        { label: "Judul Z-A", value: "title-desc" },
      ],
    },
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sertifikat"
        description="Kelola sertifikat & kaitan skill"
        actions={
          <Link href="/certificate/new">
            <Button variant="primary" icon={<PlusCircle size={16} />}>
              Tambah Sertifikat
            </Button>
          </Link>
        }
      />

      <Filter
        defaultFilters={{
          status:
            filters.isValid === undefined
              ? null
              : filters.isValid
              ? "valid"
              : "expired",
          sort: `${filters.sort}-${filters.order}`,
          search: searchQuery,
        }}
        onApply={handleFilterChange}
        searchPlaceholder="Cari sertifikat / penerbit…"
        filterOptions={filterOptionConfig}
      />

      <Table
        data={displayed}
        columns={columns}
        actions={actions}
        keyField="id"
        isLoading={loadingList}
        emptyMessage="Belum ada sertifikat"
        className="mb-4"
      />

      {filteredCertificates.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          className="flex justify-end"
        />
      )}
    </div>
  );
}
