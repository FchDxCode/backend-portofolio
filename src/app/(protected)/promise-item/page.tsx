"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/src/components/multipage/PageHeader";
import { Button } from "@/src/components/multipage/Button";
import { Plus, Pencil, Trash2, Eye } from "lucide-react";
import { usePromiseItems } from "@/src/hook/services/usePromiseItem";
import { Table, Column, ActionButton } from "@/src/components/multipage/Table";
import { PromiseItem } from "@/src/models/ServiceModels";
import { Filter } from "@/src/components/multipage/Filter";
import Link from "next/link";
import Image from "next/image";

export default function PromiseItemPage() {
  const router = useRouter();
  const { 
    promises, 
    loading, 
    error, 
    deletePromise, 
    filters, 
    setFilters,
    refreshPromises,
    getIconUrl
  } = usePromiseItems({
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
        next.sort = field as "created_at";
        next.order = ord as "asc" | "desc";
      } else {
        next.sort = "created_at";
        next.order = "desc";
      }
    }

    setFilters(next);
  };

  const handleDelete = async (promise: PromiseItem) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus promise item "${promise.title?.id || promise.title?.en}"?`)) {
      try {
        await deletePromise(promise.id);
      } catch (err) {
        console.error("Error deleting promise item:", err);
        alert("Gagal menghapus promise item");
      }
    }
  };

  const columns: Column<PromiseItem>[] = [
    {
      header: "Icon",
      accessor: (promise) => (
        <div className="flex items-center">
          {promise.icon && (
            <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-md">
              {promise.icon.startsWith('fa') || 
                promise.icon.startsWith('bi') || 
                promise.icon.startsWith('material-icons') || 
                promise.icon.startsWith('icon-') ? (
                <i className={promise.icon} style={{ fontSize: '24px' }}></i>
              ) : (
                <Image 
                  src={getIconUrl(promise.icon)} 
                  alt={promise.title?.id || "Promise item icon"} 
                  width={40} 
                  height={40} 
                  className="h-full w-full object-contain"
                />
              )}
            </div>
          )}
        </div>
      ),
    },
    {
      header: "Judul",
      accessor: (promise) => (
        <div>
          <p className="font-medium">{promise.title?.id || "-"}</p>
          {promise.title?.en && promise.title?.id !== promise.title?.en && (
            <p className="text-xs text-muted-foreground">{promise.title.en}</p>
          )}
        </div>
      ),
      sortable: true
    },
    {
      header: "Subjudul",
      accessor: (promise) => (
        <div>
          <p className="font-medium">{promise.subtitle?.id || "-"}</p>
          {promise.subtitle?.en && promise.subtitle?.id !== promise.subtitle?.en && (
            <p className="text-xs text-muted-foreground">{promise.subtitle.en}</p>
          )}
        </div>
      ),
    },
    {
      header: "Tanggal Dibuat",
      accessor: (promise) => promise.created_at ? 
        new Date(promise.created_at).toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        }) : "-",
      sortable: true
    }
  ];

  const actions: ActionButton<PromiseItem>[] = [
    {
      label: "Edit",
      icon: <Pencil size={14} />,
      onClick: (promise) => router.push(`/promise-item/${promise.id}/edit`),
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
        title="Promise Item"
        description="Kelola daftar promise item yang tersedia"
        actions={
          <Link href="/promise-item/new">
            <Button variant="primary" icon={<Plus size={16} />}>
              Tambah Promise Item
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
        searchPlaceholder="Cari promise item..."
        filterOptions={filterOptionConfig}
      />

      <Table
        data={promises}
        columns={columns}
        actions={actions}
        keyField="id"
        isLoading={loading}
        emptyMessage="Belum ada promise item"
        className="mb-4"
      />
    </div>
  );
}