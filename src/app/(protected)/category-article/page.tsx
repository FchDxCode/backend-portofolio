"use client";

import { useState } from "react";
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
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterOptions, setFilterOptions] = useState({
    isActive: null as boolean | null,
    sort: "created_at" as "created_at" | "title",
    order: "desc" as "asc" | "desc"
  });
  
  const { 
    categories, 
    loading, 
    deleteCategory,
    setFilters
  } = useArticleCategories({
    isActive: filterOptions.isActive || undefined,
    sort: filterOptions.sort,
    order: filterOptions.order
  });

  // Handle search and filter
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // Reset to first page when searching
    setCurrentPage(1);
  };

  const handleFilterChange = (filters: Record<string, string | string[] | boolean | null>) => {
    // Update filter options based on selected filters
    const newOptions = { ...filterOptions };
    
    if (filters.status !== undefined) {
      newOptions.isActive = filters.status === "active" ? true : filters.status === "inactive" ? false : null;
    }
    
    if (filters.sort !== undefined) {
      const [field, order] = (filters.sort as string).split('-');
      newOptions.sort = field as "created_at" | "title";
      newOptions.order = order as "asc" | "desc";
    }
    
    setFilterOptions(newOptions);
    setCurrentPage(1);
  };

  // Pagination setup
  const itemsPerPage = 10;
  const totalPages = Math.ceil(categories.length / itemsPerPage);
  const displayedCategories = categories
    .filter(category => {
      // Apply search filter
      if (!searchQuery) return true;
      
      const title = category.title?.id || category.title?.en || "";
      const subtitle = category.subtitle?.id || category.subtitle?.en || "";
      const searchLower = searchQuery.toLowerCase();
      
      return (
        typeof title === "string" && title.toLowerCase().includes(searchLower) ||
        typeof subtitle === "string" && subtitle.toLowerCase().includes(searchLower)
      );
    })
    .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Handle delete category
  const handleDelete = async (category: ArticleCategory) => {
    if (confirm(`Apakah Anda yakin ingin menghapus kategori "${category.title?.id || category.title?.en}"?`)) {
      try {
        await deleteCategory(category.id);
      } catch (error) {
        alert("Gagal menghapus kategori");
        console.error(error);
      }
    }
  };

  // Table columns
  const columns = [
    {
      header: "Icon",
      accessor: (category: ArticleCategory) => (
        <div className="w-12 h-12 flex items-center justify-center">
          {category.icon ? (
            <img 
              src={category.icon} 
              alt={category.title?.id || category.title?.en || "Icon"} 
              className="max-w-full max-h-full object-contain"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
      accessor: (category: ArticleCategory) => (
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
      header: "Subtitle",
      accessor: (category: ArticleCategory) => (
        <div>
          <p className="text-sm">{category.subtitle?.id || "-"}</p>
          {category.subtitle?.en && category.subtitle?.id !== category.subtitle?.en && (
            <p className="text-xs text-muted-foreground">{category.subtitle.en}</p>
          )}
        </div>
      )
    },
    {
      header: "Status",
      accessor: (category: ArticleCategory) => (
        <div>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            category.is_active 
              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
          }`}>
            {category.is_active ? 'Aktif' : 'Tidak Aktif'}
          </span>
        </div>
      )
    },
    {
      header: "Tanggal Dibuat",
      accessor: (category: ArticleCategory) => (
        category.created_at 
          ? new Date(category.created_at).toLocaleDateString('id-ID', { 
              day: '2-digit', 
              month: 'long', 
              year: 'numeric' 
            })
          : "-"
      ),
      sortable: true
    }
  ];

  // Action buttons
  const actions = [
    {
      label: "Detail",
      icon: <Eye size={14} />,
      onClick: (category: ArticleCategory) => router.push(`/category-article/${category.id}`),
      variant: "primary" as const
    },
    {
      label: "Edit",
      icon: <Edit size={14} />,
      onClick: (category: ArticleCategory) => router.push(`/category-article/${category.id}/edit`),
      variant: "secondary" as const
    },
    {
      label: "Hapus",
      icon: <Trash2 size={14} />,
      onClick: handleDelete,
      variant: "destructive" as const
    }
  ];

  // Filter options for dropdown
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
        onFilterChange={handleFilterChange}
        searchPlaceholder="Cari kategori..."
        filterOptions={filterOptionConfig}
      />

      <Table
        data={displayedCategories}
        columns={columns}
        actions={actions as ActionButton<ArticleCategory>[]}
        keyField="id"
        isLoading={loading}
        emptyMessage="Belum ada kategori artikel"
        className="mb-4"
      />

      {categories.length > 0 && (
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