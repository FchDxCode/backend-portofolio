"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/src/components/multipage/PageHeader";
import { Button } from "@/src/components/multipage/Button";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { usePackageExclusion } from "@/src/hook/services/usePackageExclusion";
import { Table, Column, ActionButton } from "@/src/components/multipage/Table";
import { PackageExclusion } from "@/src/models/ServiceModels";
import { Filter } from "@/src/components/multipage/Filter";
import Link from "next/link";

export default function PackageExclusionPage() {
  const router = useRouter();
  const { 
    exclusions, 
    loading, 
    error, 
    deleteExclusion,
    fetchExclusions
  } = usePackageExclusion();

  const [filters, setFilters] = useState({
    search: "",
    sort: "created_at" as const,
    order: "desc" as const
  });

  const handleFilterChange = (
    draft: Record<string, string | string[] | boolean | null>
  ) => {
    const next = { ...filters };

    // Handle search
    if (typeof draft.search === "string") {
      next.search = draft.search || "";
    }

    // Handle sorting
    if (draft.sort !== undefined) {
      const sortValue = draft.sort as string;
      if (sortValue) {
        const [field, ord] = sortValue.split("-");
        next.sort = field as "created_at";
      } else {
        next.sort = "created_at";
        next.order = "desc";
      }
    }

    setFilters(next);
    fetchExclusions({
      search: next.search,
      sort: next.sort,
      order: next.order
    });
  };

  const handleDelete = async (exclusion: PackageExclusion) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus exclusion "${exclusion.title?.id || exclusion.title?.en}"?`)) {
      try {
        await deleteExclusion(exclusion.id);
      } catch (err) {
        console.error("Error deleting package exclusion:", err);
        alert("Gagal menghapus package exclusion");
      }
    }
  };

  const columns: Column<PackageExclusion>[] = [
    {
      header: "Nama",
      accessor: (exclusion) => (
        <div>
          <p className="font-medium">{exclusion.title?.id || "-"}</p>
          {exclusion.title?.en && exclusion.title?.id !== exclusion.title?.en && (
            <p className="text-xs text-muted-foreground">{exclusion.title.en}</p>
          )}
        </div>
      ),
      sortable: true
    },
    {
      header: "Tanggal Dibuat",
      accessor: (exclusion) => exclusion.created_at ? 
        new Date(exclusion.created_at).toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        }) : "-",
      sortable: true
    }
  ];

  const actions: ActionButton<PackageExclusion>[] = [
    {
      label: "Edit",
      icon: <Pencil size={14} />,
      onClick: (exclusion) => router.push(`/package-exclusion/${exclusion.id}/edit`),
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
      ],
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Package Exclusion"
        description="Kelola daftar pengecualian paket layanan"
        actions={
          <Link href="/package-exclusion/new">
            <Button variant="primary" icon={<Plus size={16} />}>
              Tambah Pengecualian
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
        searchPlaceholder="Cari pengecualian..."
        filterOptions={filterOptionConfig}
      />

      <Table
        data={exclusions}
        columns={columns}
        actions={actions}
        keyField="id"
        isLoading={loading}
        emptyMessage="Belum ada package exclusion"
        className="mb-4"
      />

      {error && (
        <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm">
          {error.message}
        </div>
      )}
    </div>
  );
}