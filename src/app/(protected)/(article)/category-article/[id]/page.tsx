"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { PageHeader } from "@/src/components/multipage/PageHeader";
import { Button } from "@/src/components/multipage/Button";
import { DetailView, DetailItem } from "@/src/components/multipage/DetailView";
import { ArticleCategoryService } from "@/src/services/article/ArticleCategoryServices";
import { ArticleCategory } from "@/src/models/ArticleModels";
import { Edit, Trash2, Globe, AlignLeft, Calendar, CheckCircle, XCircle } from "lucide-react";
import { useArticleCategories } from "@/src/hook/article/useArticleCategory";

export default function CategoryArticleDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = parseInt(params.id as string, 10);
  
  const { deleteCategory } = useArticleCategories();
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState<ArticleCategory | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch category data
  useEffect(() => {
    const fetchCategory = async () => {
      try {
        setIsLoading(true);
        const data = await ArticleCategoryService.getById(id);
        setCategory(data);
      } catch (err) {
        setError("Gagal memuat data kategori");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchCategory();
    }
  }, [id]);

  // Handle delete
  const handleDelete = async () => {
    if (confirm(`Apakah Anda yakin ingin menghapus kategori "${category?.title?.id || category?.title?.en}"?`)) {
      try {
        setIsDeleting(true);
        await deleteCategory(id);
        router.push("/category-article");
      } catch (error) {
        alert("Gagal menghapus kategori");
        console.error(error);
        setIsDeleting(false);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-semibold text-destructive">Kategori tidak ditemukan</h2>
        <Button 
          variant="primary" 
          className="mt-4"
          onClick={() => router.push("/category-article")}
        >
          Kembali ke Daftar Kategori
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Detail Kategori Artikel"
        backUrl="/category-article"
        actions={
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              icon={<Edit size={16} />}
              onClick={() => router.push(`/category-article/${id}/edit`)}
            >
              Edit
            </Button>
            <Button
              variant="destructive"
              icon={<Trash2 size={16} />}
              onClick={handleDelete}
              isLoading={isDeleting}
            >
              Hapus
            </Button>
          </div>
        }
      />

      {error && (
        <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column - Icon Preview */}
        <div>
          <DetailView title="Icon Kategori">
            <div className="flex justify-center items-center p-4">
              {category.icon ? (
                <div className="relative w-40 h-40 bg-muted/30 rounded-md p-4 flex items-center justify-center">
                  <img
                    src={category.icon}
                    alt={category.title?.id || category.title?.en || "Icon kategori"}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              ) : (
                <div className="w-40 h-40 rounded-md bg-muted/30 flex items-center justify-center text-muted-foreground">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                    <circle cx="9" cy="9" r="2" />
                    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                  </svg>
                  <span className="absolute mt-24 text-xs">Tidak ada icon</span>
                </div>
              )}
            </div>
          </DetailView>
        </div>

        {/* Right Column - Category Details */}
        <div className="md:col-span-2 space-y-6">
          <DetailView title="Informasi Kategori">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <DetailItem 
                  label="Judul Bahasa Indonesia" 
                  icon={<Globe size={16} className="text-primary" />}
                >
                  {category.title?.id || "-"}
                </DetailItem>
                
                <DetailItem 
                  label="Subtitle Bahasa Indonesia" 
                  icon={<AlignLeft size={16} className="text-primary" />}
                >
                  {category.subtitle?.id || "-"}
                </DetailItem>
                
                <DetailItem 
                  label="Status" 
                  icon={category.is_active 
                    ? <CheckCircle size={16} className="text-green-500" />
                    : <XCircle size={16} className="text-destructive" />
                  }
                >
                  <span className={category.is_active 
                    ? "text-green-600 dark:text-green-400" 
                    : "text-destructive"
                  }>
                    {category.is_active ? "Aktif" : "Tidak Aktif"}
                  </span>
                </DetailItem>
              </div>
              
              <div className="space-y-4">
                <DetailItem 
                  label="Judul Bahasa Inggris" 
                  icon={<Globe size={16} className="text-primary" />}
                >
                  {category.title?.en || "-"}
                </DetailItem>
                
                <DetailItem 
                  label="Subtitle Bahasa Inggris" 
                  icon={<AlignLeft size={16} className="text-primary" />}
                >
                  {category.subtitle?.en || "-"}
                </DetailItem>
                
                <DetailItem 
                  label="Tanggal Dibuat" 
                  icon={<Calendar size={16} className="text-primary" />}
                >
                  {category.created_at 
                    ? new Date(category.created_at).toLocaleDateString('id-ID', { 
                        day: '2-digit', 
                        month: 'long', 
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })
                    : "-"
                  }
                </DetailItem>
                
                <DetailItem 
                  label="Terakhir Diperbarui" 
                  icon={<Calendar size={16} className="text-primary" />}
                >
                  {category.updated_at 
                    ? new Date(category.updated_at).toLocaleDateString('id-ID', { 
                        day: '2-digit', 
                        month: 'long', 
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })
                    : "-"
                  }
                </DetailItem>
              </div>
            </div>
          </DetailView>

          {/* Optional: You can add related articles here if needed */}
          <DetailView title="Statistik" description="Informasi penggunaan kategori">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-muted/20 p-4 rounded-md">
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Total Artikel</h4>
                <p className="text-2xl font-bold">0</p>
                <p className="text-xs text-muted-foreground mt-1">Artikel yang menggunakan kategori ini</p>
              </div>
              
              <div className="bg-muted/20 p-4 rounded-md">
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Total Views</h4>
                <p className="text-2xl font-bold">0</p>
                <p className="text-xs text-muted-foreground mt-1">Jumlah view pada artikel dengan kategori ini</p>
              </div>
            </div>
          </DetailView>
        </div>
      </div>
    </div>
  );
}