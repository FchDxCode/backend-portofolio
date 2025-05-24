"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Edit, Eye, Trash, Plus } from "lucide-react";

import { useTestimonials } from "@/src/hook/services/useTestimonial";
import { Testimonial } from "@/src/models/ServiceModels";
import { PageHeader } from "@/src/components/multipage/PageHeader";
import { Table } from "@/src/components/multipage/Table";
import { Button } from "@/src/components/multipage/Button";
import { Filter } from "@/src/components/multipage/Filter";

export default function TestimonialPage() {
  const router = useRouter();
  const [filters, setFilters] = useState<{
    search?: string;
    category?: string;
    star?: string;
  }>({});

  const {
    testimonials,
    loading,
    error,
    setFilters: setApiFilters,
    deleteTestimonial,
    formatStars,
    getProfileUrl,
    getLocalizedText
  } = useTestimonials({ withCategory: true });

  const handleDelete = async (t: Testimonial) => {
    if (
      window.confirm(
        `Apakah Anda yakin ingin menghapus testimonial dari "${t.name}"?`
      )
    ) {
      try {
        await deleteTestimonial(t.id);
      } catch (err) {
        console.error("Error deleting testimonial:", err);
        alert("Gagal menghapus testimonial");
      }
    }
  };

  const applyFilters = (newFilters: Record<string, any>) => {
    setFilters(newFilters);
    setApiFilters({
      search: newFilters.search || undefined,
      categoryId: newFilters.category
        ? Number(newFilters.category)
        : undefined,
      star: newFilters.star ? Number(newFilters.star) : undefined
    });
  };

  // derive unique kategori options from loaded data
  const categoryOptions = testimonials
    .map((t) => t.testimonial_categories)
    .filter(Boolean)
    .map((cat) => ({
      label: getLocalizedText(cat!.title, "id"),
      value: String(cat!.id)
    }))
    .filter(
      (opt, idx, arr) => arr.findIndex((o) => o.value === opt.value) === idx
    );

  const filterOptions = {
    category: {
      label: "Kategori",
      options: categoryOptions
    },
    star: {
      label: "Rating",
      options: [1, 2, 3, 4, 5].map((s) => ({
        label: formatStars(s),
        value: String(s)
      }))
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Testimonial"
        description="Kelola testimonial dari klien"
        actions={
          <Button
            onClick={() => router.push("/testimonial/new")}
            icon={<Plus className="h-4 w-4" />}
          >
            Tambah
          </Button>
        }
      />

      <Filter
        onApply={applyFilters}
        filterOptions={filterOptions}
        searchPlaceholder="Cari testimonial..."
      />

      <Table
        data={testimonials}
        keyField="id"
        isLoading={loading}
        columns={[
          {
            header: "Profil",
            accessor: (item) => (
              <div className="flex items-center">
                {item.profile ? (
                  <img
                    src={getProfileUrl(item.profile)}
                    alt={item.name || ""}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                    <span className="text-muted-foreground text-xs font-medium">
                      {item.name?.charAt(0) || "?"}
                    </span>
                  </div>
                )}
              </div>
            ),
            className: "w-16"
          },
          {
            header: "Nama",
            accessor: "name",
            sortable: true
          },
          {
            header: "Pekerjaan",
            accessor: (item) => getLocalizedText(item.job, "id")
          },
          {
            header: "Rating",
            accessor: (item) => (
              <div className="flex items-center">
                <span className="text-amber-500">
                  {formatStars(item.star || 0)}
                </span>
                <span className="ml-1 text-muted-foreground">
                  ({item.star || 0})
                </span>
              </div>
            ),
            sortable: true
          },
          {
            header: "Industri",
            accessor: (item) =>
              item.industry
                ? getLocalizedText(item.industry, "id")
                : "-"
          },
          {
            header: "Tahun",
            accessor: "year",
            sortable: true
          },
          {
            header: "Kategori",
            accessor: (item) =>
              item.testimonial_categories
                ? getLocalizedText(
                    item.testimonial_categories.title,
                    "id"
                  )
                : "-"
          }
        ]}
        actions={[
          {
            label: "Detail",
            icon: <Eye className="h-4 w-4" />,
            onClick: (item) => router.push(`/testimonial/${item.id}`),
            variant: "secondary"
          },
          {
            label: "Edit",
            icon: <Edit className="h-4 w-4" />,
            onClick: (item) =>
              router.push(`/testimonial/${item.id}/edit`),
            variant: "primary"
          },
          {
            label: "Hapus",
            icon: <Trash className="h-4 w-4" />,
            onClick: handleDelete,
            variant: "destructive"
          }
        ]}
        emptyMessage="Belum ada testimonial"
      />

      {error && (
        <div className="p-4 mt-4 bg-destructive/10 border border-destructive text-destructive rounded-md">
          Error: {error.message}
        </div>
      )}
    </div>
  );
}
