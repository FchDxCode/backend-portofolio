"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageHeader } from "@/src/components/multipage/PageHeader";
import { Button } from "@/src/components/multipage/Button";
import { DetailView, DetailItem } from "@/src/components/multipage/DetailView";
import { useTestimonials } from "@/src/hook/services/useTestimonial";
import { Testimonial } from "@/src/models/ServiceModels";
import { Calendar, Star, Award, FileText, Image } from "lucide-react";

export default function TestimonialDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const testimonialId = Number(id);

  const { getTestimonialById, getIndustryName } = useTestimonials();
  const [testimonial, setTestimonial] = useState<Testimonial | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTestimonial = async () => {
      try {
        setLoading(true);
        const data = await getTestimonialById(testimonialId);

        if (!data) {
          setError("Testimonial tidak ditemukan");
          return;
        }

        console.log("Testimonial data:", data);
        console.log("Industry data:", data.industry);
        
        setTestimonial(data);
      } catch (err) {
        setError("Gagal memuat data testimonial");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (testimonialId) {
      fetchTestimonial();
    }
  }, [testimonialId, getTestimonialById]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !testimonial) {
    return (
      <div className="bg-destructive/10 text-destructive p-4 rounded-md">
        <h3 className="font-medium">Error</h3>
        <p>{error || "Testimonial tidak ditemukan"}</p>
        <Button
          variant="outline"
          onClick={() => router.push("/testimonial")}
          className="mt-4"
        >
          Kembali ke Daftar Testimonial
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={testimonial.name || "Detail Testimonial"}
        backUrl="/testimonial"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push("/testimonial")}>
              Kembali
            </Button>
            <Button variant="outline" onClick={() => router.push(`/testimonial/${testimonialId}/edit`)}>
              Edit
            </Button>
            <Button variant="destructive" onClick={() => router.push(`/testimonial/${testimonialId}/delete`)}>
              Hapus
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main content - 2/3 width */}
        <div className="md:col-span-2 space-y-6">
          {/* Testimonial info */}
          <DetailView title="Informasi Testimonial">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <DetailItem label="Nama" icon={<Award size={16} />}>
                  {testimonial.name || <span className="italic text-muted-foreground">Tidak tersedia</span>}
                </DetailItem>

                <DetailItem label="Posisi/Jabatan" icon={<Award size={16} />}>
                  {testimonial.job ? testimonial.job.id || testimonial.job.en : <span className="italic text-muted-foreground">Tidak tersedia</span>}
                </DetailItem>
                
                <DetailItem label="Kategori" icon={<FileText size={16} />}>
                  {(() => {
                    if (!testimonial.testimonial_categories) {
                      return <span className="italic text-muted-foreground">Tidak tersedia</span>;
                    }
                    
                    const category = testimonial.testimonial_categories;
                    const categoryTitle = 
                      typeof category.title === 'string' 
                        ? category.title 
                        : category.title?.id || 
                          category.title?.en || 
                          `Kategori ${category.id}`;
                          
                    return categoryTitle || <span className="italic text-muted-foreground">Tidak tersedia</span>;
                  })()}
                </DetailItem>
              </div>

              <div>
                <DetailItem label="Industri" icon={<Star size={16} />}>
                  {(() => {
                    console.log("Industry in render:", testimonial.industry);
                    
                    if (!testimonial.industry) {
                      return <span className="italic text-muted-foreground">Tidak tersedia</span>;
                    }
                    
                    const industryName = 
                      getIndustryName(testimonial.industry) ||
                      testimonial.industry.name ||
                      testimonial.industry.title ||

                      (typeof testimonial.industry === 'string' ? testimonial.industry : '') ||
                      testimonial.industry.id ||
                      testimonial.industry.en ||
                      JSON.stringify(testimonial.industry);
                      
                    return industryName || <span className="italic text-muted-foreground">Tidak tersedia</span>;
                  })()}
                </DetailItem>

                <DetailItem label="Tahun" icon={<Calendar size={16} />}>
                  {testimonial.year || <span className="italic text-muted-foreground">Tidak tersedia</span>}
                </DetailItem>
              </div>
            </div>
          </DetailView>

          {/* Message */}
          <DetailView title="Testimonial">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <DetailItem label="Testimonial (Indonesia)" icon={<FileText size={16} />}>
                  {testimonial.message?.id || <span className="italic text-muted-foreground">Tidak tersedia</span>}
                </DetailItem>
              </div>

              <div>
                <DetailItem label="Testimonial (English)" icon={<FileText size={16} />}>
                  {testimonial.message?.en || <span className="italic text-muted-foreground">Tidak tersedia</span>}
                </DetailItem>
              </div>
            </div>
          </DetailView>
        </div>

        {/* Sidebar - 1/3 width */}
        <div className="space-y-6">
          {/* Profile Image */}
          <DetailView title="Foto Profil">
            <div className="space-y-4">
              {testimonial.profile ? (
                <img
                  src={testimonial.profile}
                  alt={testimonial.name || "Profile"}
                  className="rounded-md border border-border"
                />
              ) : (
                <span className="italic text-muted-foreground">Tidak ada foto profil</span>
              )}
            </div>
          </DetailView>

          {/* Metadata */}
          <DetailView title="Metadata">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">ID</span>
                <span>{testimonial.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Dibuat</span>
                <span>{formatDate(testimonial.created_at)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Diperbarui</span>
                <span>{formatDate(testimonial.updated_at)}</span>
              </div>
            </div>
          </DetailView>
        </div>
      </div>
    </div>
  );
}
