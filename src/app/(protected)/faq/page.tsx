"use client";

import { useRouter } from "next/navigation";
import { useFaqs } from "@/src/hook/services/useFaq";
import { PageHeader } from "@/src/components/multipage/PageHeader";
import { Filter } from "@/src/components/multipage/Filter";
import { Table, Column, ActionButton } from "@/src/components/multipage/Table";
import { Button } from "@/src/components/multipage/Button";
import { Plus, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { Faq } from "@/src/models/ServiceModels";

export default function FaqPage() {
  const router = useRouter();
  const {
    faqs,
    loading,
    deleteFaq,
    filters,
    setFilters,
  } = useFaqs({
    sort: "created_at",
    order: "desc",
  });

  /* ---------- Filter ---------- */
  const handleFilterChange = (
    draft: Record<string, string | string[] | boolean | null>
  ) => {
    const next = { ...filters };

    if (typeof draft.search === "string") {
      next.search = draft.search || undefined;
    }

    if (draft.sort !== undefined) {
      const v = draft.sort as string;
      if (v) {
        const [field, ord] = v.split("-");
        next.sort = field as "created_at";
        next.order = ord as "asc" | "desc";
      } else {
        next.sort = "created_at";
        next.order = "desc";
      }
    }

    setFilters(next);
  };

  /* ---------- Table ---------- */
  const columns: Column<Faq>[] = [
    {
      header: "Judul",
      accessor: (faq) => (
        <div>
          <p className="font-medium">{faq.title?.id || "-"}</p>
          {faq.title?.en && faq.title.id !== faq.title.en && (
            <p className="text-xs text-muted-foreground">{faq.title.en}</p>
          )}
        </div>
      ),
      sortable: true,
    },
    {
      header: "Tanggal Dibuat",
      accessor: (faq) =>
        faq.created_at
          ? new Date(faq.created_at).toLocaleDateString("id-ID", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })
          : "-",
      sortable: true,
    },
  ];

  const actions: ActionButton<Faq>[] = [
    {
      label: "Edit",
      icon: <Pencil size={14} />,
      onClick: (faq) => router.push(`/faq/${faq.id}/edit`),
      variant: "secondary",
    },
    {
      label: "Hapus",
      icon: <Trash2 size={14} />,
      onClick: async (faq) => {
        if (
          window.confirm(
            `Yakin ingin menghapus FAQ "${faq.title?.id || faq.title?.en}"?`
          )
        ) {
          await deleteFaq(faq.id);
        }
      },
      variant: "destructive",
    },
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
        title="FAQ"
        description="Kelola daftar Frequently Asked Questions"
        actions={
          <Link href="/faq/new">
            <Button variant="primary" icon={<Plus size={16} />}>
              Tambah FAQ
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
        searchPlaceholder="Cari FAQ..."
        filterOptions={filterOptionConfig}
      />

      <Table
        data={faqs}
        columns={columns}
        actions={actions}
        keyField="id"
        isLoading={loading}
        emptyMessage="Belum ada FAQ"
        className="mb-4"
      />
    </div>
  );
}
