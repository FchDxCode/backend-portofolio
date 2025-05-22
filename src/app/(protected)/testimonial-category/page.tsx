"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/src/components/multipage/PageHeader";
import { Button } from "@/src/components/multipage/Button";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useTestimonialCategories } from "@/src/hook/services/useTestimonialCategory";
import { Table, Column, ActionButton } from "@/src/components/multipage/Table";
import { TestimonialCategory } from "@/src/models/ServiceModels";
import { Filter } from "@/src/components/multipage/Filter";
import Link from "next/link";

export default function TestimonialCategoryPage() {
  const router = useRouter();
  const { 
    categories, 
    loading, 
    error, 
    deleteCategory, 
    checkCategoryUsage,
    filters, 
    setFilters,
    refreshCategories
  } = useTestimonialCategories({
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

  const handleDelete = async (category: TestimonialCategory) => {
    try {
      const isUsed = await checkCategoryUsage(category.id);
      if (isUsed) {
        alert("Kategori ini sedang digunakan dalam testimonial dan tidak dapat dihapus");
        return;
      }
      
      if (window.confirm(`Apakah Anda yakin ingin menghapus kategori "${category.title?.id || category.title?.en}"?`)) {
        await deleteCategory(category.id);
      }
    } catch (err) {
      console.error("Error deleting category:", err);
      alert("Gagal menghapus kategori testimonial");
    }
  };

  const columns: Column<TestimonialCategory>[] = [
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
    },
    {
      header: "Terakhir Diperbarui",
      accessor: (category) => category.updated_at ? 
        new Date(category.updated_at).toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        }) : "-",
    }
  ];

  const actions: ActionButton<TestimonialCategory>[] = [
    {
      label: "Edit",
      icon: <Pencil size={14} />,
      onClick: (category) => router.push(`/testimonial-category/${category.id}/edit`),
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
        title="Kategori Testimonial"
        description="Kelola daftar kategori testimonial yang tersedia"
        actions={
          <Link href="/testimonial-category/new">
            <Button variant="primary" icon={<Plus size={16} />}>
              Tambah Kategori
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
        searchPlaceholder="Cari kategori testimonial..."
        filterOptions={filterOptionConfig}
      />

      <Table
        data={categories}
        columns={columns}
        actions={actions}
        keyField="id"
        isLoading={loading}
        emptyMessage="Belum ada kategori testimonial"
        className="mb-4"
      />
    </div>
  );
}