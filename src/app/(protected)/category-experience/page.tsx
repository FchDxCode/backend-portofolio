"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/src/components/multipage/PageHeader";
import { Button } from "@/src/components/multipage/Button";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useExperienceCategories } from "@/src/hook/experience/useExperienceCategory";
import { Table, Column, ActionButton } from "@/src/components/multipage/Table";
import { ExperienceCategory } from "@/src/models/ExperienceModels";
import { Filter } from "@/src/components/multipage/Filter";
import { Pagination } from "@/src/components/multipage/Pagination";
import Link from "next/link";

export default function CategoryExperiencePage() {
  const router = useRouter();
  const { 
    categories, 
    loading, 
    error, 
    deleteCategory, 
    filters, 
    setFilters,
    refreshCategories
  } = useExperienceCategories({
    sort: "created_at",
    order: "desc",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  const handleFilterChange = (
    draft: Record<string, string | string[] | boolean | null>
  ) => {
    if (typeof draft.search === "string") {
      setSearchQuery(draft.search);
    } else {
      setSearchQuery("");
    }

    const next = { ...filters };

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
    setCurrentPage(1);
  };

  const handleDelete = async (category: ExperienceCategory) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus kategori "${category.title?.id || category.title?.en}"?`)) {
      try {
        await deleteCategory(category.id);
      } catch (err) {
        console.error("Error deleting category:", err);
        alert("Gagal menghapus kategori");
      }
    }
  };

  const itemsPerPage = 10;
  const searchLower = searchQuery.toLowerCase();

  const filteredCategories = categories.filter((category) => {
    if (!searchQuery) return true;
    const title = category.title?.id || category.title?.en || "";
    return title.toLowerCase().includes(searchLower);
  });
  
  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);
  const displayedCategories = filteredCategories.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const columns: Column<ExperienceCategory>[] = [
    {
      header: "Judul",
      accessor: (category) => (
        <div>
          <p className="font-medium">{category.title?.id || "-"}</p>
          {category.title?.en && category.title?.id !== category.title?.en && (
            <p className="text-xs text-muted-foreground">{category.title.en}</p>
          )}
        </div>
      ),
      sortable: true
    },
    {
      header: "Tanggal Dibuat",
      accessor: (category) => category.created_at ? 
        new Date(category.created_at).toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        }) : "-",
      sortable: true
    }
  ];

  const actions: ActionButton<ExperienceCategory>[] = [
    {
      label: "Edit",
      icon: <Pencil size={14} />,
      onClick: (category) => router.push(`/category-experience/${category.id}/edit`),
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
        title="Kategori Pengalaman"
        description="Kelola kategori pengalaman yang tersedia"
        actions={
          <Link href="/category-experience/new">
            <Button variant="primary" icon={<Plus size={16} />}>
              Tambah Kategori
            </Button>
          </Link>
        }
      />

      <Filter
        defaultFilters={{
          sort: `${filters.sort}-${filters.order}`,
          search: searchQuery,
        }}
        onApply={handleFilterChange}
        searchPlaceholder="Cari kategori..."
        filterOptions={filterOptionConfig}
      />

      <Table
        data={displayedCategories}
        columns={columns}
        actions={actions}
        keyField="id"
        isLoading={loading}
        emptyMessage="Belum ada kategori pengalaman"
        className="mb-4"
      />

      {filteredCategories.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          className="flex justify-end"
        />
      )}
    </div>
  );
}