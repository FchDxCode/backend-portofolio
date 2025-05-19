"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/src/components/multipage/PageHeader";
import { Button } from "@/src/components/multipage/Button";
import { Plus, Pencil, Trash2, ExternalLink, Eye } from "lucide-react";
import { useProject } from "@/src/hook/useProject";
import { Table, Column, ActionButton } from "@/src/components/multipage/Table";
import { ProjectFull } from "@/src/services/ProjectServices";
import { Filter } from "@/src/components/multipage/Filter";
import Link from "next/link";
import Image from "next/image";

export default function ProyekPage() {
  const router = useRouter();
  const { 
    projects, 
    loading, 
    error, 
    deleteProject,
    fetchList
  } = useProject();

  const [filters, setFilters] = useState({
    search: "",
    sort: "created_at",
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
  };

  const handleDelete = async (project: ProjectFull) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus proyek "${project.title?.id || project.title?.en}"?`)) {
      try {
        await deleteProject(project.id);
      } catch (err) {
        console.error("Error deleting project:", err);
        alert("Gagal menghapus proyek");
      }
    }
  };

  // Filter projects based on search
  const filteredProjects = projects?.filter(project => {
    if (!filters.search) return true;
    
    const searchLower = filters.search.toLowerCase();
    return (
      project.title?.id?.toLowerCase().includes(searchLower) ||
      project.title?.en?.toLowerCase().includes(searchLower) ||
      project.subtitle?.id?.toLowerCase().includes(searchLower) ||
      project.subtitle?.en?.toLowerCase().includes(searchLower)
    );
  }) || [];

  // Sort projects
  const sortedProjects = [...filteredProjects].sort((a, b) => {
    if (filters.sort === "created_at") {
      const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return filters.order === "asc" ? dateA - dateB : dateB - dateA;
    }
    return 0;
  });

  const columns: Column<ProjectFull>[] = [
    {
      header: "Proyek",
      accessor: (project) => (
        <div className="flex items-center gap-3">
          {project.images && project.images.length > 0 && (
            <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-md">
              <Image 
                src={project.images[0].image || ""} 
                alt={project.title?.id || "Project image"} 
                width={40} 
                height={40} 
                className="h-full w-full object-cover"
              />
            </div>
          )}
          <div>
            <p className="font-medium">{project.title?.id || "-"}</p>
            {project.title?.en && project.title?.id !== project.title?.en && (
              <p className="text-xs text-muted-foreground">{project.title.en}</p>
            )}
          </div>
        </div>
      ),
      sortable: true
    },
    {
      header: "Subtitle",
      accessor: (project) => (
        <div>
          <p>{project.subtitle?.id || "-"}</p>
          {project.subtitle?.en && project.subtitle?.id !== project.subtitle?.en && (
            <p className="text-xs text-muted-foreground">{project.subtitle.en}</p>
          )}
        </div>
      ),
    },
    {
      header: "Link Demo",
      accessor: (project) => (
        project.link_demo ? (
          <a 
            href={project.link_demo} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline flex items-center gap-1"
          >
            Demo <ExternalLink size={14} />
          </a>
        ) : "-"
      ),
    },
    {
      header: "Link Source Code",
      accessor: (project) => (
        project.link_source_code ? (
          <a 
            href={project.link_source_code} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline flex items-center gap-1"
          >
            Source <ExternalLink size={14} />
          </a>
        ) : "-"
      ),
    },
    {
      header: "Tanggal Dibuat",
      accessor: (project) => project.created_at ? 
        new Date(project.created_at).toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        }) : "-",
      sortable: true
    }
  ];

  const actions: ActionButton<ProjectFull>[] = [
    {
      label: "Detail",
      icon: <Eye size={14} />,
      onClick: (project) => router.push(`/proyek/${project.id}`),
      variant: "secondary"
    },
    {
      label: "Edit",
      icon: <Pencil size={14} />,
      onClick: (project) => router.push(`/proyek/${project.id}/edit`),
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
    },
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Proyek"
        description="Kelola proyek yang tersedia"
        actions={
          <Link href="/proyek/new">
            <Button variant="primary" icon={<Plus size={16} />}>
              Tambah Proyek
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
        searchPlaceholder="Cari proyek..."
        filterOptions={filterOptionConfig}
      />

      <Table
        data={sortedProjects}
        columns={columns}
        actions={actions}
        keyField="id"
        isLoading={loading}
        emptyMessage="Belum ada proyek"
        className="mb-4"
      />
    </div>
  );
}