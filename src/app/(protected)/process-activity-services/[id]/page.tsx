"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageHeader } from "@/src/components/multipage/PageHeader";
import { Button } from "@/src/components/multipage/Button";
import { DetailView, DetailItem } from "@/src/components/multipage/DetailView";
import { Pencil, Trash2, ArrowLeft, Calendar, ListChecks, Clock } from "lucide-react";
import { useProcessActivity } from "@/src/hook/services/useProcessActivity";
import { ProcessActivity } from "@/src/models/ServiceModels";

export default function ProcessActivityDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const activityId = typeof id === 'string' ? parseInt(id, 10) : 0;
  
  const { fetchActivityById, deleteActivity, getRelatedProcessIds } = useProcessActivity();
  
  const [activity, setActivity] = useState<ProcessActivity | null>(null);
  const [relatedProcessIds, setRelatedProcessIds] = useState<number[]>([]);
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
    const loadData = async () => {
      try {
        setLoading(true);
        const activityData = await fetchActivityById(activityId);
        if (activityData) {
          setActivity(activityData);
          
          // Get related process IDs
          const processIds = await getRelatedProcessIds(activityId);
          setRelatedProcessIds(processIds);
        } else {
          setError("Aktivitas tidak ditemukan");
        }
      } catch (err) {
        console.error("Error fetching activity:", err);
        setError(err instanceof Error ? err.message : "Gagal memuat data aktivitas");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [activityId, fetchActivityById, getRelatedProcessIds]);

  const handleDelete = async () => {
    if (!activity) return;
    
    if (window.confirm(`Apakah Anda yakin ingin menghapus aktivitas "${activity.title?.id || activity.title?.en}"?`)) {
      try {
        await deleteActivity(activity.id);
        router.push("/process-activity-services");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal menghapus aktivitas");
        console.error(err);
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

  if (error || !activity) {
    return (
      <div className="bg-destructive/10 text-destructive p-4 rounded-md">
        <h3 className="font-medium">Error</h3>
        <p>{error || "Aktivitas tidak ditemukan"}</p>
        <Button 
          variant="outline" 
          onClick={() => router.push("/process-activity-services")}
          className="mt-4"
        >
          Kembali ke Daftar Aktivitas
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={activity.title?.id || activity.title?.en || "Detail Aktivitas Proses"}
        backUrl="/process-activity-services"
        actions={
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => router.push("/process-activity-services")}
            >
              Kembali
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push(`/process-activity-services/${activityId}/edit`)}
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
          {/* Activity Information */}
          <DetailView title="Informasi Aktivitas">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <DetailItem 
                  label="Judul (Indonesia)" 
                  icon={<ListChecks size={16} />}
                >
                  {activity.title?.id || <span className="italic text-muted-foreground">Tidak tersedia</span>}
                </DetailItem>
              </div>
              
              <div>
                <DetailItem 
                  label="Judul (English)" 
                  icon={<ListChecks size={16} />}
                >
                  {activity.title?.en || <span className="italic text-muted-foreground">Tidak tersedia</span>}
                </DetailItem>
              </div>
            </div>
          </DetailView>

          {/* Related Processes */}
          <DetailView title="Proses Terkait">
            {relatedProcessIds.length > 0 ? (
              <div className="grid grid-cols-1 gap-2">
                {relatedProcessIds.map((processId) => (
                  <DetailItem
                    key={processId}
                    label={`Process ID: ${processId}`}
                  >
                    <div className="flex items-center">
                      <span className="text-sm">Terkait dengan aktivitas ini</span>
                    </div>
                  </DetailItem>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-muted-foreground">
                Tidak ada proses yang terkait dengan aktivitas ini
              </div>
            )}
          </DetailView>
        </div>

        {/* Sidebar - 1/3 width */}
        <div className="space-y-6">
          {/* Metadata */}
          <DetailView title="Metadata">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">ID</span>
                <span>{activity.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Dibuat</span>
                <span>{formatDate(activity.created_at)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Diperbarui</span>
                <span>{formatDate(activity.updated_at)}</span>
              </div>
            </div>
          </DetailView>

          {/* Activity Status */}
          <DetailView title="Status Aktivitas">
            <div className="p-4 text-center">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-800">
                <Clock size={14} className="mr-1" />
                <span>Aktif</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Aktivitas ini dapat digunakan dalam proses layanan
              </p>
            </div>
          </DetailView>
        </div>
      </div>
    </div>
  );
}