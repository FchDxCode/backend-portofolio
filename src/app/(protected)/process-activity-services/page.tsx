"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/src/components/multipage/PageHeader";
import { Button } from "@/src/components/multipage/Button";
import { Plus, Pencil, Trash2, Eye } from "lucide-react";
import { useProcessActivity } from "@/src/hook/services/useProcessActivity";
import { Table, Column, ActionButton } from "@/src/components/multipage/Table";
import { ProcessActivity } from "@/src/models/ServiceModels";
import { Filter } from "@/src/components/multipage/Filter";
import Link from "next/link";

export default function ProcessActivityServicesPage() {
  const router = useRouter();
  const { 
    activities, 
    loading, 
    error, 
    deleteActivity,
    fetchActivities
  } = useProcessActivity();

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
      fetchActivities({ search: next.search });
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
  };

  const handleDelete = async (activity: ProcessActivity) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus aktivitas "${activity.title?.id || activity.title?.en}"?`)) {
      try {
        await deleteActivity(activity.id);
      } catch (err) {
        console.error("Error deleting process activity:", err);
        alert("Gagal menghapus aktivitas proses");
      }
    }
  };

  const columns: Column<ProcessActivity>[] = [
    {
      header: "Nama Aktivitas",
      accessor: (activity) => (
        <div>
          <p className="font-medium">{activity.title?.id || "-"}</p>
          {activity.title?.en && activity.title?.id !== activity.title?.en && (
            <p className="text-xs text-muted-foreground">{activity.title.en}</p>
          )}
        </div>
      ),
      sortable: true
    },
    {
      header: "Tanggal Dibuat",
      accessor: (activity) => activity.created_at ? 
        new Date(activity.created_at).toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        }) : "-",
      sortable: true
    }
  ];

  const actions: ActionButton<ProcessActivity>[] = [
    {
      label: "Detail",
      icon: <Eye size={14} />,
      onClick: (activity) => router.push(`/process-activity-services/${activity.id}`),
      variant: "secondary"
    },
    {
      label: "Edit",
      icon: <Pencil size={14} />,
      onClick: (activity) => router.push(`/process-activity-services/${activity.id}/edit`),
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

  // Sort activities based on filters
  const sortedActivities = [...activities].sort((a, b) => {
    if (filters.sort === "created_at") {
      const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
    }
    return 0;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Aktivitas Proses"
        description="Kelola daftar aktivitas proses layanan"
        actions={
          <Link href="/process-activity-services/new">
            <Button variant="primary" icon={<Plus size={16} />}>
              Tambah Aktivitas
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
        searchPlaceholder="Cari aktivitas proses..."
        filterOptions={filterOptionConfig}
      />

      <Table
        data={sortedActivities}
        columns={columns}
        actions={actions}
        keyField="id"
        isLoading={loading}
        emptyMessage="Belum ada aktivitas proses"
        className="mb-4"
      />
    </div>
  );
}