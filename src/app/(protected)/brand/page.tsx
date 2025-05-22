"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/src/components/multipage/PageHeader";
import { Button } from "@/src/components/multipage/Button";
import { Plus, Pencil, Trash2, ExternalLink } from "lucide-react";
import { useBrands } from "@/src/hook/services/useBrand";
import { Table, Column, ActionButton } from "@/src/components/multipage/Table";
import { Brand } from "@/src/models/ServiceModels";
import { Filter } from "@/src/components/multipage/Filter";
import Link from "next/link";
import Image from "next/image";

export default function BrandPage() {
  const router = useRouter();
  const { 
    brands, 
    loading, 
    error, 
    deleteBrand, 
    filters, 
    setFilters,
    refreshBrands,
    getImageUrl
  } = useBrands({
    sort: "created_at",
    order: "desc"
  });

  const handleFilterChange = (
    draft: Record<string, string | string[] | boolean | null>
  ) => {
    const next = { ...filters };

    // Handle search
    if (typeof draft.search === "string") {
      next.search = draft.search || undefined;
    }

    // Handle sorting
    if (draft.sort !== undefined) {
      const sortValue = draft.sort as string;
      if (sortValue) {
        const [field, ord] = sortValue.split("-");
        next.sort = field as "created_at" | "title";
        next.order = ord as "asc" | "desc";
      } else {
        next.sort = "created_at";
        next.order = "desc";
      }
    }

    setFilters(next);
  };

  const handleDelete = async (brand: Brand) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus brand "${brand.title?.id || brand.title?.en}"?`)) {
      try {
        await deleteBrand(brand.id);
      } catch (err) {
        console.error("Error deleting brand:", err);
        alert("Gagal menghapus brand");
      }
    }
  };

  const columns: Column<Brand>[] = [
    {
      header: "Brand",
      accessor: (brand) => (
        <div className="flex items-center gap-3">
          {brand.image && (
            <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-md">
              <Image 
                src={getImageUrl(brand.image)} 
                alt={brand.title?.id || "Brand logo"} 
                width={40} 
                height={40} 
                className="h-full w-full object-contain"
              />
            </div>
          )}
          <div>
            <p className="font-medium">{brand.title?.id || "-"}</p>
            {brand.title?.en && brand.title?.id !== brand.title?.en && (
              <p className="text-xs text-muted-foreground">{brand.title.en}</p>
            )}
          </div>
        </div>
      ),
      sortable: true
    },
    {
      header: "Tanggal Dibuat",
      accessor: (brand) => brand.created_at ? 
        new Date(brand.created_at).toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        }) : "-",
      sortable: true
    }
  ];

  const actions: ActionButton<Brand>[] = [
    {
      label: "Edit",
      icon: <Pencil size={14} />,
      onClick: (brand) => router.push(`/brand/${brand.id}/edit`),
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
        { label: "Nama A-Z", value: "title-asc" },
        { label: "Nama Z-A", value: "title-desc" },
      ],
    },
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Brand"
        description="Kelola brand yang tersedia"
        actions={
          <Link href="/brand/new">
            <Button variant="primary" icon={<Plus size={16} />}>
              Tambah Brand
            </Button>
          </Link>
        }
      />

      <Filter
        defaultFilters={{
          sort: `${filters.sort}-${filters.order}`,
          search: filters.search || "",
        }}
        onApply={handleFilterChange}
        searchPlaceholder="Cari brand..."
        filterOptions={filterOptionConfig}
      />

      <Table
        data={brands}
        columns={columns}
        actions={actions}
        keyField="id"
        isLoading={loading}
        emptyMessage="Belum ada brand"
        className="mb-4"
      />
    </div>
  );
}