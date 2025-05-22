"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/src/components/multipage/PageHeader";
import { Button } from "@/src/components/multipage/Button";
import { Plus, Pencil, Trash2, Eye } from "lucide-react";
import { useFeaturedService } from "@/src/hook/services/useFeaturedServices";
import { Table, Column, ActionButton } from "@/src/components/multipage/Table";
import { FeaturedService } from "@/src/models/ServiceModels";
import { Filter } from "@/src/components/multipage/Filter";
import Link from "next/link";
import Image from "next/image";

export default function FeaturedServicesPage() {
  const router = useRouter();
  const { 
    services, 
    loading, 
    error, 
    deleteService, 
    fetchServices,
    getIconUrl 
  } = useFeaturedService();

  const [filters, setFilters] = useState({
    search: "",
    benefitId: undefined as number | undefined,
    skillId: undefined as number | undefined,
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

    // Handle benefit filter
    if (typeof draft.benefitId === "string") {
      next.benefitId = draft.benefitId ? Number(draft.benefitId) : undefined;
    }

    // Handle skill filter
    if (typeof draft.skillId === "string") {
      next.skillId = draft.skillId ? Number(draft.skillId) : undefined;
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
    
    // Apply filters to fetch services
    fetchServices({
      search: next.search,
      benefitId: next.benefitId,
      skillId: next.skillId,
      sort: next.sort,
      order: next.order
    });
  };

  const handleDelete = async (service: FeaturedService) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus layanan "${service.title?.id || service.title?.en}"?`)) {
      try {
        await deleteService(service.id);
      } catch (err) {
        console.error("Error deleting service:", err);
        alert("Gagal menghapus layanan");
      }
    }
  };

  const columns: Column<FeaturedService>[] = [
    {
      header: "Icon",
      accessor: (service) => (
        <div className="flex items-center">
          {service.icon && (
            <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-md">
              {service.icon.startsWith('fa') || 
                service.icon.startsWith('bi') || 
                service.icon.startsWith('material-icons') || 
                service.icon.startsWith('icon-') ? (
                <i className={service.icon} style={{ fontSize: '24px' }}></i>
              ) : (
                <Image 
                  src={getIconUrl(service.icon)} 
                  alt={service.title?.id || "Service icon"} 
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
      header: "Nama Layanan",
      accessor: (service) => (
        <div>
          <p className="font-medium">{service.title?.id || "-"}</p>
          {service.title?.en && service.title?.id !== service.title?.en && (
            <p className="text-xs text-muted-foreground">{service.title.en}</p>
          )}
        </div>
      ),
      sortable: true
    },
    {
      header: "Preview",
      accessor: (service) => (
        <div className="max-w-xs truncate">
          <p>{service.preview_description?.id || "-"}</p>
          {service.preview_description?.en && service.preview_description?.id !== service.preview_description?.en && (
            <p className="text-xs text-muted-foreground truncate">{service.preview_description.en}</p>
          )}
        </div>
      ),
    },
    {
      header: "Tanggal Dibuat",
      accessor: (service) => service.created_at ? 
        new Date(service.created_at).toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        }) : "-",
      sortable: true
    }
  ];

  const actions: ActionButton<FeaturedService>[] = [
    {
      label: "Detail",
      icon: <Eye size={14} />,
      onClick: (service) => router.push(`/featured-services/${service.id}`),
      variant: "secondary"
    },
    {
      label: "Edit",
      icon: <Pencil size={14} />,
      onClick: (service) => router.push(`/featured-services/${service.id}/edit`),
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
        title="Layanan Unggulan"
        description="Kelola daftar layanan unggulan yang tersedia"
        actions={
          <Link href="/featured-services/new">
            <Button variant="primary" icon={<Plus size={16} />}>
              Tambah Layanan
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
        searchPlaceholder="Cari layanan..."
        filterOptions={filterOptionConfig}
      />

      <Table
        data={services}
        columns={columns}
        actions={actions}
        keyField="id"
        isLoading={loading}
        emptyMessage="Belum ada layanan unggulan"
        className="mb-4"
      />
    </div>
  );
}