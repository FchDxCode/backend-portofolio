"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/src/components/multipage/PageHeader";
import { Button } from "@/src/components/multipage/Button";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useTechStackSkills } from "@/src/hook/services/useTechStackSkill";
import { Table, Column, ActionButton } from "@/src/components/multipage/Table";
import { TechStackSkill } from "@/src/models/ServiceModels";
import { Filter } from "@/src/components/multipage/Filter";
import Link from "next/link";

export default function TechStackSkillPage() {
  const router = useRouter();
  const {
    skills,
    loading,
    error,
    deleteSkill,
    filters,
    setFilters,
    getTechStackCount,
    refreshSkills
  } = useTechStackSkills({
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

  const handleDelete = async (skill: TechStackSkill) => {
    try {
      // Check if skill is being used
      const count = await getTechStackCount(skill.id);
      if (count > 0) {
        alert(`Skill ini digunakan oleh ${count} tech stack. Tidak dapat dihapus.`);
        return;
      }
      
      if (window.confirm(`Apakah Anda yakin ingin menghapus skill "${skill.title?.id || skill.title?.en}"?`)) {
        await deleteSkill(skill.id);
      }
    } catch (err) {
      console.error("Error deleting skill:", err);
      alert("Gagal menghapus skill");
    }
  };

  const columns: Column<TechStackSkill>[] = [
    {
      header: "Nama Skill",
      accessor: (skill) => (
        <div>
          <p className="font-medium">{skill.title?.id || "-"}</p>
          {skill.title?.en && skill.title?.id !== skill.title?.en && (
            <p className="text-xs text-muted-foreground">{skill.title.en}</p>
          )}
        </div>
      ),
      sortable: true
    },
    {
      header: "Tanggal Dibuat",
      accessor: (skill) => skill.created_at ? 
        new Date(skill.created_at).toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        }) : "-",
      sortable: true
    }
  ];

  const actions: ActionButton<TechStackSkill>[] = [
    {
      label: "Edit",
      icon: <Pencil size={14} />,
      onClick: (skill) => router.push(`/tech-stack-skill/${skill.id}/edit`),
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
        { label: "Nama (A-Z)", value: "title-asc" },
        { label: "Nama (Z-A)", value: "title-desc" },
      ],
    },
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tech Stack Skills"
        description="Kelola daftar kemampuan tech stack yang tersedia"
        actions={
          <Link href="/tech-stack-skill/new">
            <Button variant="primary" icon={<Plus size={16} />}>
              Tambah Skill
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
        searchPlaceholder="Cari skill..."
        filterOptions={filterOptionConfig}
      />

      <Table
        data={skills}
        columns={columns}
        actions={actions}
        keyField="id"
        isLoading={loading}
        emptyMessage="Belum ada tech stack skill"
        className="mb-4"
      />
    </div>
  );
}