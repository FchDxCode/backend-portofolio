"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/src/components/multipage/PageHeader";
import { Button } from "@/src/components/multipage/Button";
import { Plus, Pencil, Trash2, Eye } from "lucide-react";
import { usePackageBenefit } from "@/src/hook/services/usePackageBenefit";
import { Table, Column, ActionButton } from "@/src/components/multipage/Table";
import { PackageBenefit } from "@/src/models/ServiceModels";
import { Filter } from "@/src/components/multipage/Filter";
import Link from "next/link";

export default function PackageBenefitPage() {
  const router = useRouter();
  const { 
    benefits, 
    loading, 
    error, 
    deleteBenefit,
    fetchBenefits
  } = usePackageBenefit();

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
    fetchBenefits({
      search: next.search,
      sort: next.sort,
      order: next.order
    });
  };

  const handleDelete = async (benefit: PackageBenefit) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus benefit "${benefit.title?.id || benefit.title?.en}"?`)) {
      try {
        await deleteBenefit(benefit.id);
      } catch (err) {
        console.error("Error deleting package benefit:", err);
        alert("Gagal menghapus package benefit");
      }
    }
  };

  const columns: Column<PackageBenefit>[] = [
    {
      header: "Nama",
      accessor: (benefit) => (
        <div>
          <p className="font-medium">{benefit.title?.id || "-"}</p>
          {benefit.title?.en && benefit.title?.id !== benefit.title?.en && (
            <p className="text-xs text-muted-foreground">{benefit.title.en}</p>
          )}
        </div>
      ),
      sortable: true
    },
    {
      header: "Tanggal Dibuat",
      accessor: (benefit) => benefit.created_at ? 
        new Date(benefit.created_at).toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        }) : "-",
      sortable: true
    }
  ];

  const actions: ActionButton<PackageBenefit>[] = [
    {
      label: "Edit",
      icon: <Pencil size={14} />,
      onClick: (benefit) => router.push(`/package-benefit/${benefit.id}/edit`),
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
        title="Package Benefit"
        description="Kelola daftar benefit paket layanan"
        actions={
          <Link href="/package-benefit/new">
            <Button variant="primary" icon={<Plus size={16} />}>
              Tambah Benefit
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
        searchPlaceholder="Cari benefit..."
        filterOptions={filterOptionConfig}
      />

      <Table
        data={benefits}
        columns={columns}
        actions={actions}
        keyField="id"
        isLoading={loading}
        emptyMessage="Belum ada package benefit"
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