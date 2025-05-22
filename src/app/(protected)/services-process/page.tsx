"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/src/components/multipage/PageHeader";
import { Button } from "@/src/components/multipage/Button";
import { Plus, Pencil, Trash2, Eye, ArrowUpDown } from "lucide-react";
import { useServiceProcess } from "@/src/hook/services/useProcessServices";
import { useProcessActivity } from "@/src/hook/services/useProcessActivity";
import { Table, Column, ActionButton } from "@/src/components/multipage/Table";
import { ServiceProcess } from "@/src/models/ServiceModels";
import { Filter } from "@/src/components/multipage/Filter";
import Link from "next/link";
import Image from "next/image";

export default function ServicesProcessPage() {
  const router = useRouter();
  const { 
    processes, 
    loading, 
    error, 
    deleteProcess,
    reorderProcesses,
    getIconUrl,
  } = useServiceProcess();

  const { activities } = useProcessActivity();
  
  const [filters, setFilters] = useState({
    search: "",
    isActive: undefined as boolean | undefined, // Changed from true to undefined
    activityId: undefined as number | undefined,
    sort: "order_no" as const,
    order: "asc" as const
  });

  const handleFilterChange = (
    draft: Record<string, string | string[] | boolean | null>
  ) => {
    const next = { ...filters };

    // Handle search
    if (typeof draft.search === "string") {
      next.search = draft.search || "";
    }

    // Handle active filter
    if (draft.isActive !== undefined) {
      next.isActive = draft.isActive === "true" ? true : 
                     draft.isActive === "false" ? false : undefined;
    }

    // Handle activity filter
    if (typeof draft.activityId === "string") {
      next.activityId = draft.activityId ? Number(draft.activityId) : undefined;
    }

    setFilters(next);
  };

  const handleDelete = async (process: ServiceProcess) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus proses "${process.title?.id || process.title?.en}"?`)) {
      try {
        await deleteProcess(process.id);
      } catch (err) {
        console.error("Error deleting process:", err);
        alert("Gagal menghapus proses");
      }
    }
  };

  const handleReorder = async (processes: ServiceProcess[]) => {
    try {
      const newOrder = processes.map((process, index) => ({
        id: process.id,
        order_no: index + 1
      }));
      
      await reorderProcesses(newOrder);
    } catch (err) {
      console.error("Error reordering processes:", err);
      alert("Gagal mengubah urutan proses");
    }
  };

  const columns: Column<ServiceProcess>[] = [
    {
      header: "Urutan",
      accessor: (process) => process.order_no || 0,
    },
    {
      header: "Icon",
      accessor: (process) => (
        <div className="flex items-center">
          {process.icon && (
            <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-md">
              {process.icon.startsWith('fa') || 
                process.icon.startsWith('bi') || 
                process.icon.startsWith('material-icons') || 
                process.icon.startsWith('icon-') ? (
                <i className={process.icon} style={{ fontSize: '24px' }}></i>
              ) : (
                <Image 
                  src={getIconUrl(process.icon)} 
                  alt={process.title?.id || "Process icon"} 
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
      header: "Nama Proses",
      accessor: (process) => (
        <div>
          <p className="font-medium">{process.title?.id || "-"}</p>
          {process.title?.en && process.title?.id !== process.title?.en && (
            <p className="text-xs text-muted-foreground">{process.title.en}</p>
          )}
        </div>
      ),
    },
    {
      header: "Durasi",
      accessor: (process) => {
        if (!process.work_duration) return "-";
        
        if (typeof process.work_duration === 'object') {
          return process.work_duration.id || process.work_duration.en || "-";
        }
        
        return process.work_duration;
      },
    },
    {
      header: "Status",
      accessor: (process) => (
        <div className={`px-2 py-1 rounded-full text-xs font-medium inline-flex items-center ${
          process.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
        }`}>
          <span className={`w-2 h-2 rounded-full mr-1 ${
            process.is_active ? "bg-green-500" : "bg-gray-500"
          }`}></span>
          {process.is_active ? "Aktif" : "Nonaktif"}
        </div>
      ),
    }
  ];

  const actions: ActionButton<ServiceProcess>[] = [
    {
      label: "Detail",
      icon: <Eye size={14} />,
      onClick: (process) => router.push(`/services-process/${process.id}`),
      variant: "secondary"
    },
    {
      label: "Edit",
      icon: <Pencil size={14} />,
      onClick: (process) => router.push(`/services-process/${process.id}/edit`),
      variant: "secondary"
    },
    {
      label: "Hapus",
      icon: <Trash2 size={14} />,
      onClick: handleDelete,
      variant: "destructive"
    }
  ];

  // Create activity options for the filter
  const activityOptions = activities.map(activity => ({
    label: activity.title?.id || activity.title?.en || `Activity ${activity.id}`,
    value: activity.id.toString()
  }));

  const filterOptionConfig = {
    isActive: {
      label: "Status",
      options: [
        { label: "Aktif", value: "true" },
        { label: "Nonaktif", value: "false" },
      ],
    },
    activityId: {
      label: "Aktivitas",
      options: [
        ...activityOptions
      ],
    }
  };

  // Filter processes based on filters
  const filteredProcesses = processes.filter(process => {
    // Filter by active status - only filter if explicitly set
    if (filters.isActive !== undefined && process.is_active !== filters.isActive) {
      return false;
    }

    // Filter by search term
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const titleId = process.title?.id?.toLowerCase() || '';
      const titleEn = process.title?.en?.toLowerCase() || '';
      const descId = process.description?.id?.toLowerCase() || '';
      const descEn = process.description?.en?.toLowerCase() || '';
      
      if (!titleId.includes(searchLower) && 
          !titleEn.includes(searchLower) && 
          !descId.includes(searchLower) && 
          !descEn.includes(searchLower)) {
        return false;
      }
    }

    return true;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Proses Layanan"
        description="Kelola daftar proses layanan yang tersedia"
        actions={
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              icon={<ArrowUpDown size={16} />}
              onClick={() => handleReorder(filteredProcesses)}
            >
              Perbarui Urutan
            </Button>
            <Link href="/services-process/new">
              <Button variant="primary" icon={<Plus size={16} />}>
                Tambah Proses
              </Button>
            </Link>
          </div>
        }
      />

      <Filter
        defaultFilters={{
          search: filters.search || "",
          isActive: filters.isActive === undefined ? "" : filters.isActive.toString(),
          activityId: filters.activityId?.toString() || "",
        }}
        onApply={handleFilterChange}
        searchPlaceholder="Cari proses layanan..."
        filterOptions={filterOptionConfig}
      />

      <Table
        data={filteredProcesses}
        columns={columns}
        actions={actions}
        keyField="id"
        isLoading={loading}
        emptyMessage="Belum ada proses layanan"
        className="mb-4"
      />
    </div>
  );
}