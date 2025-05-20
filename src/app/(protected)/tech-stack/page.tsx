"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/src/components/multipage/PageHeader";
import { Button } from "@/src/components/multipage/Button";
import { Plus, Pencil, Trash2, Eye } from "lucide-react";
import { useTechStacks } from "@/src/hook/services/useTechStack";
import { useTechStackSkills } from "@/src/hook/services/useTechStackSkill";
import { Table, Column, ActionButton } from "@/src/components/multipage/Table";
import { TechStack } from "@/src/models/ServiceModels";
import { Filter } from "@/src/components/multipage/Filter";
import Link from "next/link";
import Image from "next/image";

export default function TechStackPage() {
  const router = useRouter();
  const { 
    techStacks, 
    loading, 
    error, 
    deleteTechStack, 
    filters, 
    setFilters,
    refreshTechStacks,
    getIconUrl
  } = useTechStacks({
    sort: "created_at",
    order: "desc"
  });

  const { skills } = useTechStackSkills();

  const handleFilterChange = (
    draft: Record<string, string | string[] | boolean | null>
  ) => {
    const next = { ...filters };

    // Handle search
    if (typeof draft.search === "string") {
      next.search = draft.search || undefined;
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
        next.sort = field as "created_at" | "title";
        next.order = ord as "asc" | "desc";
      } else {
        next.sort = "created_at";
        next.order = "desc";
      }
    }

    setFilters(next);
  };

  const handleDelete = async (techStack: TechStack) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus tech stack "${techStack.title?.id || techStack.title?.en}"?`)) {
      try {
        await deleteTechStack(techStack.id);
      } catch (err) {
        console.error("Error deleting tech stack:", err);
        alert("Gagal menghapus tech stack");
      }
    }
  };

  const columns: Column<TechStack>[] = [
    {
      header: "Icon",
      accessor: (techStack) => (
        <div className="flex items-center">
          {techStack.icon && (
            <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-md">
              {techStack.icon.startsWith('fa') || 
                techStack.icon.startsWith('bi') || 
                techStack.icon.startsWith('material-icons') || 
                techStack.icon.startsWith('icon-') ? (
                <i className={techStack.icon} style={{ fontSize: '24px' }}></i>
              ) : (
                <Image 
                  src={getIconUrl(techStack.icon)} 
                  alt={techStack.title?.id || "Tech stack icon"} 
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
      header: "Nama",
      accessor: (techStack) => (
        <div>
          <p className="font-medium">{techStack.title?.id || "-"}</p>
          {techStack.title?.en && techStack.title?.id !== techStack.title?.en && (
            <p className="text-xs text-muted-foreground">{techStack.title.en}</p>
          )}
        </div>
      ),
      sortable: true
    },
    {
      header: "Kategori Skill",
      accessor: (techStack) => {
        if (!techStack.tech_stack_skill_id) return "-";
        const skill = skills.find(s => s.id === techStack.tech_stack_skill_id); 
        return (
          <div>
            <p className="font-medium">{skill?.title?.id || "-"}</p>
            {skill?.title?.en && skill?.title?.id !== skill?.title?.en && (
              <p className="text-xs text-muted-foreground">{skill.title.en}</p>
            )}
          </div>
        );
      }
    },
    {
      header: "Tanggal Dibuat",
      accessor: (techStack) => techStack.created_at ? 
        new Date(techStack.created_at).toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        }) : "-",
      sortable: true
    }
  ];

  const actions: ActionButton<TechStack>[] = [
    {
      label: "Detail",
      icon: <Eye size={14} />,
      onClick: (techStack) => router.push(`/tech-stack/${techStack.id}`),
      variant: "secondary"
    },
    {
      label: "Edit",
      icon: <Pencil size={14} />,
      onClick: (techStack) => router.push(`/tech-stack/${techStack.id}/edit`),
      variant: "secondary"
    },
    {
      label: "Hapus",
      icon: <Trash2 size={14} />,
      onClick: handleDelete,
      variant: "destructive"
    }
  ];

  // Create skill options for the filter
  const skillOptions = skills.map(skill => ({
    label: skill.title?.id || skill.title?.en || `Skill ${skill.id}`,
    value: skill.id.toString()
  }));

  const filterOptionConfig = {
    sort: {
      label: "Urutan",
      options: [
        { label: "Terbaru", value: "created_at-desc" },
        { label: "Terlama", value: "created_at-asc" },
        { label: "Nama (A-Z)", value: "title-asc" },
        { label: "Nama (Z-A)", value: "title-desc" },
      ],
    },
    skillId: {
      label: "Kategori Skill",
      options: [
        { label: "Semua Skill", value: "" },
        ...skillOptions
      ],
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tech Stack"
        description="Kelola daftar tech stack yang tersedia"
        actions={
          <Link href="/tech-stack/new">
            <Button variant="primary" icon={<Plus size={16} />}>
              Tambah Tech Stack
            </Button>
          </Link>
        }
      />

      <Filter
        defaultFilters={{
          sort: `${filters.sort}-${filters.order}`,
          search: filters.search || "",
          skillId: filters.skillId?.toString() || "",
        }}
        onApply={handleFilterChange}
        searchPlaceholder="Cari tech stack..."
        filterOptions={filterOptionConfig}
      />

      <Table
        data={techStacks}
        columns={columns}
        actions={actions}
        keyField="id"
        isLoading={loading}
        emptyMessage="Belum ada tech stack"
        className="mb-4"
      />
    </div>
  );
}