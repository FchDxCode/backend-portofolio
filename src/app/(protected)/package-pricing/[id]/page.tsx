"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageHeader } from "@/src/components/multipage/PageHeader";
import { Button } from "@/src/components/multipage/Button";
import { DetailView, DetailItem } from "@/src/components/multipage/DetailView";
import { usePackagePricing } from "@/src/hook/services/usePackagePricing";
import { Pencil, Trash2, DollarSign, Clock, Package, Shield, CheckSquare, Calendar } from "lucide-react";

export default function PackagePricingDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = parseInt(params.id as string);
  
  const { fetchPackageById, deletePackage } = usePackagePricing();
  
  const [packageData, setPackageData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Format date in locale format
  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  useEffect(() => {
    const loadPackageData = async () => {
      try {
        setLoading(true);
        const data = await fetchPackageById(id, true);
        setPackageData(data);
        if (!data) {
          setError("Paket harga tidak ditemukan");
        }
      } catch (err) {
        console.error("Error fetching package pricing:", err);
        setError("Gagal memuat data paket harga");
      } finally {
        setLoading(false);
      }
    };

    loadPackageData();
  }, [id, fetchPackageById]);

  const handleDelete = async () => {
    if (!packageData) return;
    
    if (window.confirm(`Apakah Anda yakin ingin menghapus paket "${packageData.title?.id || packageData.title?.en}"?`)) {
      try {
        await deletePackage(id);
        router.push("/package-pricing");
      } catch (err) {
        console.error("Error deleting package pricing:", err);
        setError("Gagal menghapus paket harga");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !packageData) {
    return (
      <div className="bg-destructive/10 text-destructive p-4 rounded-md">
        <h3 className="font-medium">Error</h3>
        <p>{error || "Paket harga tidak ditemukan"}</p>
        <Button 
          variant="outline" 
          onClick={() => router.push("/package-pricing")}
          className="mt-4"
        >
          Kembali ke Daftar Paket Harga
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={packageData.title?.id || packageData.title?.en || "Detail Paket Harga"}
        backUrl="/package-pricing"
        actions={
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => router.push("/package-pricing")}
            >
              Kembali
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push(`/package-pricing/${id}/edit`)}
              icon={<Pencil size={16} />}
            >
              Edit
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              icon={<Trash2 size={16} />}
            >
              Hapus
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main content - 2/3 width */}
        <div className="md:col-span-2 space-y-6">
          {/* Package Information */}
          <DetailView title="Informasi Paket">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <DetailItem 
                  label="Nama Paket (Indonesia)" 
                  icon={<Package size={16} />}
                >
                  {packageData.title?.id || <span className="italic text-muted-foreground">Tidak tersedia</span>}
                </DetailItem>
              </div>
              
              <div>
                <DetailItem 
                  label="Nama Paket (English)" 
                  icon={<Package size={16} />}
                >
                  {packageData.title?.en || <span className="italic text-muted-foreground">Tidak tersedia</span>}
                </DetailItem>
              </div>
            </div>
          </DetailView>

          {/* Price Information */}
          <DetailView title="Harga & Durasi">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <DetailItem 
                  label="Harga (Indonesia)" 
                  icon={<DollarSign size={16} />}
                >
                  {packageData.price?.id || <span className="italic text-muted-foreground">Tidak tersedia</span>}
                </DetailItem>
                
                <DetailItem 
                  label="Durasi (Indonesia)" 
                  icon={<Clock size={16} />}
                >
                  {packageData.work_duration?.id || <span className="italic text-muted-foreground">Tidak tersedia</span>}
                </DetailItem>
              </div>
              
              <div>
                <DetailItem 
                  label="Harga (English)" 
                  icon={<DollarSign size={16} />}
                >
                  {packageData.price?.en || <span className="italic text-muted-foreground">Tidak tersedia</span>}
                </DetailItem>
                
                <DetailItem 
                  label="Durasi (English)" 
                  icon={<Clock size={16} />}
                >
                  {packageData.work_duration?.en || <span className="italic text-muted-foreground">Tidak tersedia</span>}
                </DetailItem>
              </div>
            </div>
          </DetailView>

          {/* Description */}
          <DetailView title="Deskripsi">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <DetailItem label="Deskripsi (Indonesia)">
                  <div className="prose prose-sm max-w-none">
                    <p className="whitespace-pre-wrap">
                      {packageData.description?.id || <span className="italic text-muted-foreground">Tidak tersedia</span>}
                    </p>
                  </div>
                </DetailItem>
              </div>
              
              <div>
                <DetailItem label="Deskripsi (English)">
                  <div className="prose prose-sm max-w-none">
                    <p className="whitespace-pre-wrap">
                      {packageData.description?.en || <span className="italic text-muted-foreground">Tidak tersedia</span>}
                    </p>
                  </div>
                </DetailItem>
              </div>
            </div>
          </DetailView>
        </div>

        {/* Sidebar - 1/3 width */}
        <div className="space-y-6">
          {/* Benefits */}
          <DetailView title="Benefits">
            {packageData.benefits && packageData.benefits.length > 0 ? (
              <div className="p-3">
                <ul className="list-disc pl-5 space-y-2">
                  {packageData.benefits.map((benefit: any) => (
                    <li key={benefit.id}>
                      {benefit.title?.id || benefit.title?.en || `Benefit ${benefit.id}`}
                      {benefit.title?.en && benefit.title?.id !== benefit.title?.en && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {benefit.title.en}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="p-4 text-center text-muted-foreground text-sm">
                Tidak ada benefit yang tersedia
              </div>
            )}
          </DetailView>

          {/* Exclusions */}
          <DetailView title="Exclusions">
            {packageData.exclusions && packageData.exclusions.length > 0 ? (
              <div className="p-3">
                <ul className="list-disc pl-5 space-y-2">
                  {packageData.exclusions.map((exclusion: any) => (
                    <li key={exclusion.id}>
                      {exclusion.title?.id || exclusion.title?.en || `Exclusion ${exclusion.id}`}
                      {exclusion.title?.en && exclusion.title?.id !== exclusion.title?.en && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {exclusion.title.en}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="p-4 text-center text-muted-foreground text-sm">
                Tidak ada exclusion yang tersedia
              </div>
            )}
          </DetailView>
          
          {/* Metadata */}
          <DetailView title="Metadata">
            <div className="space-y-2 text-sm p-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">ID</span>
                <span>{packageData.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Dibuat</span>
                <span>{formatDate(packageData.created_at)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Diperbarui</span>
                <span>{formatDate(packageData.updated_at)}</span>
              </div>
            </div>
          </DetailView>
        </div>
      </div>
    </div>
  );
}