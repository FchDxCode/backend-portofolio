"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageHeader } from "@/src/components/multipage/PageHeader";
import { Button } from "@/src/components/multipage/Button";
import { DetailView, DetailItem } from "@/src/components/multipage/DetailView";
import { Pencil, Trash2, Clock, ListChecks, FileText, Link2 } from "lucide-react";
import { useServiceProcess } from "@/src/hook/services/useProcessServices";
import { ServiceProcess } from "@/src/models/ServiceModels";
import Image from "next/image";

export default function ServicesProcessDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const processId = typeof id === 'string' ? parseInt(id, 10) : 0;
  
  const { fetchProcessById, deleteProcess, getIconUrl } = useServiceProcess();
  
  const [process, setProcess] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
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
    const fetchProcess = async () => {
      try {
        setLoading(true);
        const data = await fetchProcessById(processId);
        setProcess(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal memuat data proses");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProcess();
  }, [processId, fetchProcessById]);

  const handleDelete = async () => {
    if (!process) return;
    
    if (window.confirm(`Apakah Anda yakin ingin menghapus proses "${process.title?.id || process.title?.en}"?`)) {
      try {
        await deleteProcess(process.id);
        router.push("/services-process");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal menghapus proses");
        console.error(err);
      }
    }
  };

  // Check if icon is a class name or an image path
  const isIconClass = (icon?: string) => {
    if (!icon) return false;
    return icon.startsWith('fa') || 
           icon.startsWith('bi') || 
           icon.startsWith('material-icons') || 
           icon.startsWith('icon-');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !process) {
    return (
      <div className="bg-destructive/10 text-destructive p-4 rounded-md">
        <h3 className="font-medium">Error</h3>
        <p>{error || "Proses tidak ditemukan"}</p>
        <Button 
          variant="outline" 
          onClick={() => router.push("/services-process")}
          className="mt-4"
        >
          Kembali ke Daftar Proses
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={process.title?.id || process.title?.en || "Detail Proses Layanan"}
        backUrl="/services-process"
        actions={
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => router.push("/services-process")}
            >
              Kembali
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push(`/services-process/${processId}/edit`)}
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
          {/* Process Information */}
          <DetailView title="Informasi Proses">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <DetailItem 
                  label="Judul Proses (Indonesia)" 
                  icon={<ListChecks size={16} />}
                >
                  {process.title?.id || <span className="italic text-muted-foreground">Tidak tersedia</span>}
                </DetailItem>
                
                <DetailItem 
                  label="Durasi Pengerjaan" 
                  icon={<Clock size={16} />}
                >
                  {process.work_duration ? (
                    <>
                      {process.work_duration.id && <div>{process.work_duration.id}</div>}
                      {process.work_duration.en && process.work_duration.en !== process.work_duration.id && 
                        <div className="text-xs text-muted-foreground">{process.work_duration.en}</div>
                      }
                    </>
                  ) : (
                    <span className="italic text-muted-foreground">Tidak tersedia</span>
                  )}
                </DetailItem>
              </div>
              
              <div>
                <DetailItem 
                  label="Judul Proses (English)" 
                  icon={<ListChecks size={16} />}
                >
                  {process.title?.en || <span className="italic text-muted-foreground">Tidak tersedia</span>}
                </DetailItem>
                
                <DetailItem 
                  label="Status" 
                  icon={<Clock size={16} />}
                >
                  <div className={`px-2 py-1 rounded-full text-xs font-medium inline-flex items-center ${
                    process.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                  }`}>
                    <span className={`w-2 h-2 rounded-full mr-1 ${
                      process.is_active ? "bg-green-500" : "bg-gray-500"
                    }`}></span>
                    {process.is_active ? "Aktif" : "Nonaktif"}
                  </div>
                </DetailItem>
              </div>
            </div>
          </DetailView>

          {/* Description */}
          <DetailView title="Deskripsi">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <DetailItem 
                  label="Deskripsi (Indonesia)"
                  icon={<FileText size={16} />}
                >
                  <div className="prose prose-sm max-w-none">
                    <p className="whitespace-pre-wrap">
                      {process.description?.id || <span className="italic text-muted-foreground">Tidak tersedia</span>}
                    </p>
                  </div>
                </DetailItem>
              </div>
              
              <div>
                <DetailItem 
                  label="Deskripsi (English)"
                  icon={<FileText size={16} />}
                >
                  <div className="prose prose-sm max-w-none">
                    <p className="whitespace-pre-wrap">
                      {process.description?.en || <span className="italic text-muted-foreground">Tidak tersedia</span>}
                    </p>
                  </div>
                </DetailItem>
              </div>
            </div>
          </DetailView>

          {/* Related Activities */}
          <DetailView title="Aktivitas Terkait">
            {process.activities && process.activities.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {process.activities.map((activity: any) => (
                  <DetailItem 
                    key={activity.id}
                    label={`Aktivitas #${activity.id}`}
                    icon={<Link2 size={16} />}
                  >
                    <div>
                      <p className="font-medium">{activity.title?.id || "-"}</p>
                      {activity.title?.en && activity.title?.id !== activity.title?.en && (
                        <p className="text-xs text-muted-foreground">{activity.title.en}</p>
                      )}
                    </div>
                  </DetailItem>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-muted-foreground">
                Tidak ada aktivitas yang terkait dengan proses ini
              </div>
            )}
          </DetailView>
        </div>

        {/* Sidebar - 1/3 width */}
        <div className="space-y-6">
          {/* Process Icon */}
          <DetailView title="Ikon Proses">
            <div className="flex justify-center p-4">
              {process.icon ? (
                <div className="h-40 w-40 overflow-hidden rounded-md border border-border">
                  {isIconClass(process.icon) ? (
                    <div className="h-full w-full flex items-center justify-center bg-muted/30">
                      <i className={process.icon} style={{ fontSize: '64px' }}></i>
                    </div>
                  ) : (
                    <Image 
                      src={getIconUrl(process.icon)} 
                      alt={process.title?.id || "Process icon"} 
                      width={160} 
                      height={160} 
                      className="h-full w-full object-contain"
                    />
                  )}
                </div>
              ) : (
                <div className="h-40 w-40 flex items-center justify-center rounded-md border border-dashed border-border bg-muted/30">
                  <span className="text-sm text-muted-foreground">
                    Tidak ada ikon
                  </span>
                </div>
              )}
            </div>
          </DetailView>
          
          {/* Metadata */}
          <DetailView title="Metadata">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">ID</span>
                <span>{process.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Urutan</span>
                <span>{process.order_no || "-"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Dibuat</span>
                <span>{formatDate(process.created_at)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Diperbarui</span>
                <span>{formatDate(process.updated_at)}</span>
              </div>
            </div>
          </DetailView>
        </div>
      </div>
    </div>
  );
}