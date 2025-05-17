"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useArticles, useArticleTags } from "@/src/hook/article/useArticle";
import { PageHeader } from "@/src/components/multipage/PageHeader";
import { Filter } from "@/src/components/multipage/Filter";
import { Table } from "@/src/components/multipage/Table";
import { Pagination } from "@/src/components/multipage/Pagination";
import { Button } from "@/src/components/multipage/Button";
import { Article } from "@/src/models/ArticleModels";
import { Edit, Trash2, PlusCircle, Eye, Clock, ToggleLeft, ToggleRight } from "lucide-react";
import Link from "next/link";
import { ArticleService } from "@/src/services/article/ArticleServices";
import { createClient } from "@/src/utils/supabase/client";

const supabase = createClient();

export default function ArticlePage() {
  const router = useRouter();
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  // Filter state
  const [searchQuery, setSearchQuery] = useState("");
  
  // Initialize hook with pagination
  const {
    articles,
    totalCount,
    loading,
    filters,
    setFilters,
    deleteArticle,
    updateArticle
  } = useArticles({
    page: currentPage,
    limit: itemsPerPage,
    sort: "created_at",
    order: "desc"
  });

  // Add these states to store categories and tags
  const [categories, setCategories] = useState<Record<number, string>>({});
  const [tags, setTags] = useState<Record<number, string>>({});
  
  // Use the tags hook
  const { tags: allTags } = useArticleTags();
  
  // Fetch categories on component mount - fixed without dependent on getAllCategories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // Use direct Supabase query instead of non-existent method
        const { data: categoriesData, error } = await supabase
          .from('article_categories')
          .select('*')
          .eq('is_active', true);
          
        if (error) throw error;
        
        // Create a map of id -> name with explicit typing to avoid errors
        const categoryMap: Record<number, string> = {};
        if (categoriesData) {
          categoriesData.forEach((cat) => {
            categoryMap[cat.id] = cat.title?.id || cat.title?.en || `Category ${cat.id}`;
          });
        }
        setCategories(categoryMap);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };
    
    fetchCategories();
  }, []);
  
  // Update tags map when allTags changes
  useEffect(() => {
    const tagMap: Record<number, string> = {};
    allTags.forEach(tag => {
      tagMap[tag.id] = tag.title?.id || tag.title?.en || `Tag ${tag.id}`;
    });
    setTags(tagMap);
  }, [allTags]);

  // Handle filter changes
  const handleFilterChange = (
    draft: Record<string, string | string[] | boolean | null>
  ) => {
    // Handle search
    if (typeof draft.search === "string") {
      setSearchQuery(draft.search);
    } else {
      setSearchQuery("");
    }
    
    // Update filters
    const newFilters = { ...filters };
    
    // Status filter
    if (draft.status !== undefined) {
      newFilters.isActive = 
        draft.status === "active" 
          ? true 
          : draft.status === "inactive" 
          ? false 
          : undefined;
    }
    
    // Category filter
    if (draft.category !== undefined) {
      newFilters.categoryId = draft.category 
        ? parseInt(draft.category as string, 10) 
        : undefined;
    }
    
    // Tag filter
    if (draft.tag !== undefined) {
      newFilters.tagId = draft.tag 
        ? parseInt(draft.tag as string, 10) 
        : undefined;
    }
    
    // Sort filter
    if (draft.sort !== undefined) {
      const sortValue = draft.sort as string;
      if (sortValue) {
        const [field, order] = sortValue.split("-");
        newFilters.sort = field as "created_at" | "total_views" | "like";
        newFilters.order = order as "asc" | "desc";
      } else {
        newFilters.sort = "created_at";
        newFilters.order = "desc";
      }
    }
    
    // Apply search
    newFilters.search = searchQuery || undefined;
    
    // Update filters
    setFilters(newFilters);
    setCurrentPage(1);
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setFilters({ ...filters, page });
  };

  // Handle article deletion
  const handleDelete = async (article: Article) => {
    if (confirm(`Apakah Anda yakin ingin menghapus artikel "${article.title?.id || article.title?.en}"?`)) {
      try {
        await deleteArticle(article.id);
      } catch (error) {
        alert("Gagal menghapus artikel");
        console.error(error);
      }
    }
  };

  // Handle toggle status
  const handleToggleStatus = async (article: Article) => {
    try {
      await updateArticle(article.id, { is_active: !article.is_active });
    } catch (error) {
      alert("Gagal mengubah status artikel");
      console.error(error);
    }
  };

  // Table columns
  const columns = [
    {
      header: "Gambar",
      accessor: (article: Article) => (
        <div className="w-16 h-16 flex items-center justify-center">
          {article.image ? (
            <img
              src={article.image}
              alt={article.title?.id || article.title?.en || "Gambar artikel"}
              className="max-w-full max-h-full object-cover rounded-md"
            />
          ) : (
            <div className="w-16 h-16 rounded-md bg-gray-200 flex items-center justify-center text-gray-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
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
      ),
    },
    {
      header: "Judul",
      accessor: (article: Article) => (
        <div>
          <p className="font-medium">{article.title?.id || "-"}</p>
          {article.title?.en && article.title?.id !== article.title?.en && (
            <p className="text-xs text-muted-foreground">{article.title.en}</p>
          )}
        </div>
      ),
      sortable: true,
    },
    {
      header: "Kategori",
      accessor: (article: Article) => (
        <span className="text-sm">
          {article.article_category_id ? 
            categories[article.article_category_id] || `Category ${article.article_category_id}` 
            : "-"}
        </span>
      ),
    },
    {
      header: "Tags",
      accessor: (article: Article) => {
        // Safely access tags without type errors
        const articleTags = article['tags' as keyof Article];
        
        // Check if it exists and is an array with entries
        if (articleTags && Array.isArray(articleTags) && articleTags.length > 0) {
          return (
            <div className="flex flex-wrap gap-1">
              {articleTags.map((tag) => (
                <span key={tag.id} className="px-2 py-1 bg-gray-100 text-xs rounded-full dark:bg-gray-800">
                  {tags[tag.id] || `Tag ${tag.id}`}
                </span>
              ))}
            </div>
          );
        }
        return <span className="text-sm">-</span>;
      },
    },
    {
      header: "Waktu Baca",
      accessor: (article: Article) => (
        <div className="flex items-center gap-1">
          <Clock size={14} />
          <span>{article.minute_read || 0} menit</span>
        </div>
      ),
    },
    {
      header: "Status",
      accessor: (article: Article) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            article.is_active
              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
              : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
          }`}
        >
          {article.is_active ? "Aktif" : "Tidak Aktif"}
        </span>
      ),
    },
    {
      header: "Statistik",
      accessor: (article: Article) => (
        <div className="flex flex-col text-xs">
          <div className="flex items-center gap-1">
            <Eye size={14} /> {article.total_views || 0} views
          </div>
          <div className="flex items-center gap-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
            </svg>
            {article.like || 0} likes
          </div>
        </div>
      ),
    },
    {
      header: "Tanggal Dibuat",
      accessor: (article: Article) =>
        article.created_at
          ? new Date(article.created_at).toLocaleDateString("id-ID", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })
          : "-",
      sortable: true,
    },
  ];

  // Action buttons
  const actions = [
    {
      label: (article: Article) =>
        article.is_active ? "Nonaktifkan" : "Aktifkan",
      icon: (article: Article) =>
        article.is_active ? <ToggleRight size={14} /> : <ToggleLeft size={14} />,
      onClick: handleToggleStatus,
      variant: "secondary" as const,
    },
    {
      label: "Detail",
      icon: <Eye size={14} />,
      onClick: (article: Article) => router.push(`/article/${article.id}`),
      variant: "primary" as const,
    },
    {
      label: "Edit",
      icon: <Edit size={14} />,
      onClick: (article: Article) => router.push(`/article/${article.id}/edit`),
      variant: "secondary" as const,
    },
    {
      label: "Hapus",
      icon: <Trash2 size={14} />,
      onClick: handleDelete,
      variant: "destructive" as const,
    },
  ];

  // Filter options
  const filterOptionConfig = {
    status: {
      label: "Status",
      options: [
        { label: "Aktif", value: "active" },
        { label: "Tidak Aktif", value: "inactive" },
      ],
    },
    sort: {
      label: "Urutan",
      options: [
        { label: "Terbaru", value: "created_at-desc" },
        { label: "Terlama", value: "created_at-asc" },
        { label: "Terpopuler", value: "total_views-desc" },
        { label: "Paling Disukai", value: "like-desc" },
      ],
    },
  };

  // Calculate total pages
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Artikel"
        description="Kelola artikel blog"
        actions={
          <Link href="/article/new">
            <Button variant="primary" icon={<PlusCircle size={16} />}>
              Tambah Artikel
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
          search: searchQuery,
        }}
        onApply={handleFilterChange}
        searchPlaceholder="Cari artikel..."
        filterOptions={filterOptionConfig}
      />

      <Table
        data={articles}
        columns={columns}
        actions={actions}
        keyField="id"
        isLoading={loading}
        emptyMessage="Belum ada artikel"
        className="mb-4"
      />

      {totalCount > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          className="flex justify-end"
        />
      )}
    </div>
  );
}