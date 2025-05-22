"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/src/components/multipage/PageHeader";
import { Button } from "@/src/components/multipage/Button";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useServiceBenefits } from "@/src/hook/services/useBenefitServices";
import { Table, Column, ActionButton } from "@/src/components/multipage/Table";
import { ServiceBenefit } from "@/src/models/ServiceModels";
import { Filter } from "@/src/components/multipage/Filter";
import Link from "next/link";

export default function ServiceBenefitPage() {
  const router = useRouter();
  const { 
    benefits, 
    loading, 
    error, 
    deleteBenefit, 
    filters, 
    setFilters,
    refreshBenefits
  } = useServiceBenefits({
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

  const handleDelete = async (benefit: ServiceBenefit) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus benefit "${benefit.title?.id || benefit.title?.en}"?`)) {
      try {
        await deleteBenefit(benefit.id);
      } catch (err) {
        console.error("Error deleting benefit:", err);
        alert("Gagal menghapus benefit");
      }
    }
  };

  const columns: Column<ServiceBenefit>[] = [
    {
      header: "Judul",
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

  const actions: ActionButton<ServiceBenefit>[] = [
    {
      label: "Edit",
      icon: <Pencil size={14} />,
      onClick: (benefit) => router.push(`/service-benefit/${benefit.id}/edit`),
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
        { label: "Judul A-Z", value: "title-asc" },
        { label: "Judul Z-A", value: "title-desc" },
      ],
    },
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Service Benefit"
        description="Kelola benefit layanan yang tersedia"
        actions={
          <Link href="/service-benefit/new">
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
        emptyMessage="Belum ada benefit layanan"
        className="mb-4"
      />
    </div>
  );
}