"use client";

import { useState, useEffect } from "react";
import { useArticleTags } from "@/src/hook/article/useArticleTag";
import { Table } from "@/src/components/multipage/Table";
import { PageHeader } from "@/src/components/multipage/PageHeader";
import { Filter } from "@/src/components/multipage/Filter";
import { Pagination } from "@/src/components/multipage/Pagination";
import { Button } from "@/src/components/multipage/Button";
import { ArticleTag } from "@/src/models/ArticleModels";
import {
  Edit,
  Trash2,
  PlusCircle,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ArticleTagPage() {
  const router = useRouter();

  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  

  const { tags, loading, deleteTag, toggleTagActive, filters, setFilters } =
    useArticleTags({
      isActive: undefined,
      sort: "created_at",
      order: "desc",
    });

  const handleFilterChange = (
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

  const itemsPerPage = 10;
  const searchLower = searchQuery.toLowerCase();

  const filteredTags = tags.filter((tag) => {
    if (!searchQuery) return true;
    const title = tag.title?.id || tag.title?.en || "";
    return title.toLowerCase().includes(searchLower);
  });
  
  const totalPages = Math.ceil(filteredTags.length / itemsPerPage);
  const displayedTags = filteredTags.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleDelete = async (tag: ArticleTag) => {
    if (
      confirm(
        `Apakah Anda yakin ingin menghapus tag "${
          tag.title?.id || tag.title?.en
        }"?`
      )
    ) {
      try {
        await deleteTag(tag.id);
      } catch (error) {
        alert("Gagal menghapus tag");
        console.error(error);
      }
    }
  };

  const handleToggleStatus = async (tag: ArticleTag) => {
    try {
      await toggleTagActive(tag.id);
    } catch (error) {
      alert("Gagal mengubah status tag");
      console.error(error);
    }
  };

  const columns = [
    {
      header: "Judul",
      accessor: (tag: ArticleTag) => (
        <div>
          <p className="font-medium">{tag.title?.id || "-"}</p>
          {tag.title?.en && tag.title?.id !== tag.title?.en && (
            <p className="text-xs text-muted-foreground">{tag.title.en}</p>
          )}
        </div>
      ),
      sortable: true,
    },
    {
      header: "Status",
      accessor: (tag: ArticleTag) => (
        <div>
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              tag.is_active
                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
            }`}
          >
            {tag.is_active ? "Aktif" : "Tidak Aktif"}
          </span>
        </div>
      ),
    },
    {
      header: "Tanggal Dibuat",
      accessor: (tag: ArticleTag) =>
        tag.created_at
          ? new Date(tag.created_at).toLocaleDateString("id-ID", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })
          : "-",
      sortable: true,
    },
  ];

  const actions = [
    {
      label: (tag: ArticleTag) =>
        tag.is_active ? "Nonaktifkan" : "Aktifkan",
      icon: (tag: ArticleTag) =>
        tag.is_active ? <ToggleRight size={14} /> : <ToggleLeft size={14} />,
      onClick: handleToggleStatus,
      variant: "secondary" as const,
    },
    {
      label: "Edit",
      icon: <Edit size={14} />,
      onClick: (tag: ArticleTag) =>
        router.push(`/article-tag/${tag.id}/edit`),
      variant: "secondary" as const,
    },
    {
      label: "Hapus",
      icon: <Trash2 size={14} />,
      onClick: handleDelete,
      variant: "destructive" as const,
    },
  ];

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
        { label: "Judul A-Z", value: "title-asc" },
        { label: "Judul Z-A", value: "title-desc" },
      ],
    },
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tag Artikel"
        description="Kelola tag untuk artikel blog"
        actions={
          <Link href="/article-tag/new">
            <Button variant="primary" icon={<PlusCircle size={16} />}>
              Tambah Tag
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
        searchPlaceholder="Cari tag..."
        filterOptions={filterOptionConfig}
      />

      <Table
        data={displayedTags}
        columns={columns}
        actions={actions}
        keyField="id"
        isLoading={loading}
        emptyMessage="Belum ada tag artikel"
        className="mb-4"
      />

      {filteredTags.length > 0 && (
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