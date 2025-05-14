"use client";

import { useState, useEffect } from "react";
import { useArticleCategories } from "@/src/hook/article/useArticleCategory";
import { ActionButton, Table } from "@/src/components/multipage/Table";
import { PageHeader } from "@/src/components/multipage/PageHeader";
import { Filter } from "@/src/components/multipage/Filter";
import { Pagination } from "@/src/components/multipage/Pagination";
import { Button } from "@/src/components/multipage/Button";
import { ArticleCategory } from "@/src/models/ArticleModels";
import { Edit, Trash2, PlusCircle, Eye } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CategoryArticlePage() {
  const router = useRouter();
  const {
    categories,
    loading,
    filters,         
    setFilters,       
    deleteCategory
  } = useArticleCategories({
    isActive: undefined,
    sort: "created_at",
    order: "desc"
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const handleFilterApply = (
    draft: Record<string, string | string[] | boolean | null>
  ) => {
    if (typeof draft.search === "string") {
      setSearchQuery(draft.search);
    } else {
      setSearchQuery("");
    }

    const next = { ...filters }; 

    // Handle status filter
    if (draft.status !== undefined) {
      next.isActive =
        draft.status === "active"
          ? true
          : draft.status === "inactive"
          ? false
          : undefined;
    }

    // Handle sort filter
    if (draft.sort !== undefined) {
      const sortValue = draft.sort as string;
      if (sortValue) {
        const [field, ord] = sortValue.split("-");
        next.sort = field as "created_at" | "title";
        next.order = ord as "asc" | "desc";
      } else {
        // Default sort when reset
        next.sort = "created_at";
        next.order = "desc";
      }
    }

    setFilters(next);   
    setCurrentPage(1); 
  };

  const itemsPerPage = 10;
  const searchLower = searchQuery.toLowerCase();

  const filteredCategories = categories.filter((c) => {
    if (!searchQuery) return true; 
    const title = c.title?.id || c.title?.en || "";
    const subtitle = c.subtitle?.id || c.subtitle?.en || "";
    return (
      title.toLowerCase().includes(searchLower) ||
      subtitle.toLowerCase().includes(searchLower)
    );
  });

  const displayedCategories = filteredCategories
    .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleDelete = async (c: ArticleCategory) => {
    if (
      confirm(
        `Apakah Anda yakin ingin menghapus kategori "${c.title?.id || c.title?.en}"?`
      )
    ) {
      try {
        await deleteCategory(c.id);
      } catch {
        alert("Gagal menghapus kategori");
      }
    }
  };

  const columns = [
    {
      header: "Icon",
      accessor: (c: ArticleCategory) => (
        <div className="w-12 h-12 flex items-center justify-center">
          {c.icon ? (
            <img
              src={c.icon}
              alt={c.title?.id || c.title?.en || "Icon kategori"}
              className="max-w-full max-h-full object-contain"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
              {/* …svg placeholder… */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                <circle cx="9" cy="9" r="2" />
                <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
              </svg>
            </div>
          )}
        </div>
      )
    },
    {
      header: "Judul",
      accessor: (c: ArticleCategory) => (
        <div>
          <p className="font-medium">{c.title?.id || "-"}</p>
          {c.title?.en && c.title?.id !== c.title?.en && (
            <p className="text-xs text-muted-foreground">{c.title.en}</p>
          )}
        </div>
      ),
      sortable: true
    },
    {
      header: "Subtitle",
      accessor: (c: ArticleCategory) => (
        <div>
          <p className="text-sm">{c.subtitle?.id || "-"}</p>
          {c.subtitle?.en && c.subtitle?.id !== c.subtitle?.en && (
            <p className="text-xs text-muted-foreground">{c.subtitle.en}</p>
          )}
        </div>
      )
    },
    {
      header: "Status",
      accessor: (c: ArticleCategory) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            c.is_active
              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
              : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
          }`}
        >
          {c.is_active ? "Aktif" : "Tidak Aktif"}
        </span>
      )
    },
    {
      header: "Tanggal Dibuat",
      accessor: (c: ArticleCategory) =>
        c.created_at
          ? new Date(c.created_at).toLocaleDateString("id-ID", {
              day: "2-digit",
              month: "long",
              year: "numeric"
            })
          : "-",
      sortable: true
    }
  ];

  const actions: ActionButton<ArticleCategory>[] = [
    {
      label: "Detail",
      icon: <Eye size={14} />,
      onClick: (c) => router.push(`/category-article/${c.id}`),
      variant: "primary"
    },
    {
      label: "Edit",
      icon: <Edit size={14} />,
      onClick: (c) => router.push(`/category-article/${c.id}/edit`),
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
    status: {
      label: "Status",
      options: [
        { label: "Aktif", value: "active" },
        { label: "Tidak Aktif", value: "inactive" }
      ]
    },
    sort: {
      label: "Urutan",
      options: [
        { label: "Terbaru", value: "created_at-desc" },
        { label: "Terlama", value: "created_at-asc" },
        { label: "Judul A-Z", value: "title-asc" },
        { label: "Judul Z-A", value: "title-desc" }
      ]
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kategori Artikel"
        description="Kelola kategori untuk artikel blog"
        actions={
          <Link href="/category-article/new">
            <Button variant="primary" icon={<PlusCircle size={16} />}>
              Tambah Kategori
            </Button>
          </Link>
        }
      />

      <Filter
        defaultFilters={{
          status:
            filters.isActive === undefined
              ? null
              : filters.isActive
              ? "active"
              : "inactive",
          sort: `${filters.sort}-${filters.order}`,
          search: searchQuery
        }}
        onApply={handleFilterApply}
        searchPlaceholder="Cari kategori..."
        filterOptions={filterOptionConfig}
      />

      <Table
        data={displayedCategories}
        columns={columns}
        actions={actions}
        keyField="id"
        isLoading={loading}
        emptyMessage="Belum ada kategori artikel"
        className="mb-4"
      />

      {filteredCategories.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={Math.ceil(filteredCategories.length / itemsPerPage)}
          onPageChange={setCurrentPage}
          className="flex justify-end"
        />
      )}
    </div>
  );
}