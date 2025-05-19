"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/src/components/multipage/PageHeader";
import { Button } from "@/src/components/multipage/Button";
import { Plus, Pencil, Trash2, ExternalLink, Eye } from "lucide-react";
import { useExperiences } from "@/src/hook/experience/useExperience";
import { Table, Column, ActionButton } from "@/src/components/multipage/Table";
import { Experience } from "@/src/models/ExperienceModels";
import { Filter } from "@/src/components/multipage/Filter";
import { Pagination } from "@/src/components/multipage/Pagination";
import Link from "next/link";
import Image from "next/image";

export default function ExperiencePage() {
  const router = useRouter();
  const { 
    experiences, 
    totalCount,
    loading, 
    error, 
    deleteExperience, 
    filters, 
    setFilters,
    refreshExperiences
  } = useExperiences({
    sort: "created_at",
    order: "desc",
    page: 1,
    limit: 10
  });

  const handleFilterChange = (
    draft: Record<string, string | string[] | boolean | null>
  ) => {
    const next = { ...filters };

    // Handle search
    if (typeof draft.search === "string") {
      next.search = draft.search || undefined;
    }

    // Handle category filter
    if (typeof draft.categoryId === "string") {
      next.categoryId = draft.categoryId ? Number(draft.categoryId) : undefined;
    }

    // Handle sorting
    if (draft.sort !== undefined) {
      const sortValue = draft.sort as string;
      if (sortValue) {
        const [field, ord] = sortValue.split("-");
        next.sort = field as "created_at" | "experience_long";
        next.order = ord as "asc" | "desc";
      } else {
        next.sort = "created_at";
        next.order = "desc";
      }
    }

    // Handle pagination
    if (typeof draft.page === "string") {
      next.page = Number(draft.page);
    }

    setFilters(next);
  };

  const handleDelete = async (experience: Experience) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus pengalaman "${experience.title?.id || experience.title?.en}"?`)) {
      try {
        await deleteExperience(experience.id);
      } catch (err) {
        console.error("Error deleting experience:", err);
        alert("Gagal menghapus pengalaman");
      }
    }
  };

  const handlePageChange = (page: number) => {
    setFilters({
      ...filters,
      page
    });
  };

  const columns: Column<Experience>[] = [
    {
      header: "Perusahaan",
      accessor: (experience) => (
        <div className="flex items-center gap-3">
          {experience.company_logo && (
            <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-md">
              <Image 
                src={experience.company_logo} 
                alt={experience.title?.id || "Company logo"} 
                width={40} 
                height={40} 
                className="h-full w-full object-contain"
              />
            </div>
          )}
          <div>
            <p className="font-medium">{experience.title?.id || "-"}</p>
            {experience.title?.en && experience.title?.id !== experience.title?.en && (
              <p className="text-xs text-muted-foreground">{experience.title.en}</p>
            )}
            {experience.company_link && (
              <a 
                href={experience.company_link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:underline flex items-center gap-1"
              >
                Website <ExternalLink size={12} />
              </a>
            )}
          </div>
        </div>
      ),
      sortable: true
    },
    {
      header: "Posisi",
      accessor: (experience) => (
        <div>
          <p className="font-medium">{experience.subtitle?.id || "-"}</p>
          {experience.subtitle?.en && experience.subtitle?.id !== experience.subtitle?.en && (
            <p className="text-xs text-muted-foreground">{experience.subtitle.en}</p>
          )}
        </div>
      ),
    },
    {
      header: "Durasi",
      accessor: (experience) => (
        experience.experience_long !== undefined ? 
        `${experience.experience_long} ${experience.experience_long > 1 ? 'tahun' : 'tahun'}` : 
        "-"
      ),
      sortable: true
    },
    {
      header: "Lokasi",
      accessor: (experience) => (
        <div>
          <p>{experience.location?.id || "-"}</p>
          {experience.location?.en && experience.location?.id !== experience.location?.en && (
            <p className="text-xs text-muted-foreground">{experience.location.en}</p>
          )}
        </div>
      ),
    },
    {
      header: "Tanggal Dibuat",
      accessor: (experience) => experience.created_at ? 
        new Date(experience.created_at).toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        }) : "-",
      sortable: true
    }
  ];

  const actions: ActionButton<Experience>[] = [
    {
      label: "Detail",
      icon: <Eye size={14} />,
      onClick: (experience) => router.push(`/experience/${experience.id}`),
      variant: "secondary"
    },
    {
      label: "Edit",
      icon: <Pencil size={14} />,
      onClick: (experience) => router.push(`/experience/${experience.id}/edit`),
      variant: "secondary"
    },
    {
      label: "Hapus",
      icon: <Trash2 size={14} />,
      onClick: handleDelete,
      variant: "destructive"
    }
  ];

  const filterOptionConfig = {
    sort: {
      label: "Urutan",
      options: [
        { label: "Terbaru", value: "created_at-desc" },
        { label: "Terlama", value: "created_at-asc" },
        { label: "Durasi Terlama", value: "experience_long-desc" },
        { label: "Durasi Tersingkat", value: "experience_long-asc" },
      ],
    },
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pengalaman Kerja"
        description="Kelola pengalaman kerja yang tersedia"
        actions={
          <Link href="/experience/new">
            <Button variant="primary" icon={<Plus size={16} />}>
              Tambah Pengalaman
            </Button>
          </Link>
        }
      />

      <Filter
        defaultFilters={{
          sort: `${filters.sort}-${filters.order}`,
          search: filters.search || "",
          categoryId: filters.categoryId?.toString() || "",
        }}
        onApply={handleFilterChange}
        searchPlaceholder="Cari pengalaman..."
        filterOptions={filterOptionConfig}
      />

      <Table
        data={experiences}
        columns={columns}
        actions={actions}
        keyField="id"
        isLoading={loading}
        emptyMessage="Belum ada pengalaman kerja"
        className="mb-4"
      />

      {totalCount > 0 && (
        <Pagination
          currentPage={filters.page || 1}
          totalPages={Math.ceil(totalCount / (filters.limit || 10))}
          onPageChange={handlePageChange}
          className="flex justify-end"
        />
      )}
    </div>
  );
}