"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/src/components/multipage/PageHeader";
import { Button } from "@/src/components/multipage/Button";
import { Plus, Pencil, Trash2, Eye } from "lucide-react";
import { usePackagePricing } from "@/src/hook/services/usePackagePricing";
import { Table, Column, ActionButton } from "@/src/components/multipage/Table";
import { PackagePricing } from "@/src/models/ServiceModels";
import { Filter } from "@/src/components/multipage/Filter";
import Link from "next/link";

export default function PackagePricingPage() {
  const router = useRouter();
  const { 
    packages, 
    loading, 
    error, 
    deletePackage,
    fetchPackages,
    formatPrice,
    formatDuration
  } = usePackagePricing({
    withRelations: true
  });

  const [filters, setFilters] = useState({
    search: "",
    sort: "created_at" as "created_at",
    order: "desc" as "asc" | "desc"
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
        next.order = ord as "asc" | "desc";
      } else {
        next.sort = "created_at";
        next.order = "desc";
      }
    }

    setFilters(next);
    fetchPackages({
      search: next.search,
      sort: next.sort,
      order: next.order,
      withRelations: true
    });
  };

  const handleDelete = async (pricing: PackagePricing) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus paket "${pricing.title?.id || pricing.title?.en}"?`)) {
      try {
        await deletePackage(pricing.id);
      } catch (err) {
        console.error("Error deleting package pricing:", err);
        alert("Gagal menghapus paket harga");
      }
    }
  };

  const columns: Column<PackagePricing>[] = [
    {
      header: "Nama Paket",
      accessor: (pricing) => (
        <div>
          <p className="font-medium">{pricing.title?.id || "-"}</p>
          {pricing.title?.en && pricing.title?.id !== pricing.title?.en && (
            <p className="text-xs text-muted-foreground">{pricing.title.en}</p>
          )}
        </div>
      ),
      sortable: true
    },
    {
      header: "Harga",
      accessor: (pricing) => {
        return (
          <div className="font-medium">
            {pricing.price && typeof pricing.price === 'object' 
              ? (pricing.price.id || pricing.price.en || '-') 
              : '-'}
          </div>
        );
      },
      sortable: false
    },
    {
      header: "Durasi",
      accessor: (pricing) => (
        <div>
          {pricing.work_duration ? (
            <>
              <p>{pricing.work_duration.id || "-"}</p>
              {pricing.work_duration.en && pricing.work_duration.id !== pricing.work_duration.en && (
                <p className="text-xs text-muted-foreground">{pricing.work_duration.en}</p>
              )}
            </>
          ) : "-"}
        </div>
      )
    },
    {
      header: "Benefit",
      accessor: (pricing) => {
        const benefits = pricing.benefits || [];
        return (
          <div>
            {benefits.length > 0 ? (
              <span className="text-sm">{benefits.length} benefit</span>
            ) : (
              <span className="text-sm text-muted-foreground">Tidak ada</span>
            )}
          </div>
        );
      }
    },
    {
      header: "Pengecualian",
      accessor: (pricing) => {
        const exclusions = pricing.exclusions || [];
        return (
          <div>
            {exclusions.length > 0 ? (
              <span className="text-sm">{exclusions.length} pengecualian</span>
            ) : (
              <span className="text-sm text-muted-foreground">Tidak ada</span>
            )}
          </div>
        );
      }
    },
    {
      header: "Tanggal Dibuat",
      accessor: (pricing) => pricing.created_at ? 
        new Date(pricing.created_at).toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        }) : "-",
      sortable: true
    }
  ];

  const actions: ActionButton<PackagePricing>[] = [
    {
      label: "Detail",
      icon: <Eye size={14} />,
      onClick: (pricing) => router.push(`/package-pricing/${pricing.id}`),
      variant: "secondary"
    },
    {
      label: "Edit",
      icon: <Pencil size={14} />,
      onClick: (pricing) => router.push(`/package-pricing/${pricing.id}/edit`),
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
        title="Package Pricing"
        description="Kelola daftar paket harga layanan"
        actions={
          <Link href="/package-pricing/new">
            <Button variant="primary" icon={<Plus size={16} />}>
              Tambah Paket Harga
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
        searchPlaceholder="Cari paket harga..."
        filterOptions={filterOptionConfig}
      />

      <Table
        data={packages}
        columns={columns}
        actions={actions}
        keyField="id"
        isLoading={loading}
        emptyMessage="Belum ada paket harga"
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