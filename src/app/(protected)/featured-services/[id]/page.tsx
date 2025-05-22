"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageHeader } from "@/src/components/multipage/PageHeader";
import { Button } from "@/src/components/multipage/Button";
import { DetailView, DetailItem } from "@/src/components/multipage/DetailView";
import { FeaturedServiceService } from "@/src/services/services/FeaturedServices";
import { FeaturedService, ServiceBenefit, TechStack } from "@/src/models/ServiceModels";
import { Calendar, Award, FileText, Tag, Layers, CheckCircle, Image as ImageIcon } from "lucide-react";
import Image from "next/image";

export default function FeaturedServicesDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const serviceId = typeof id === 'string' ? parseInt(id, 10) : 0;
  
  const [service, setService] = useState<FeaturedService | null>(null);
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

  // Check if icon is a CSS class or an image URL
  const isIconClass = (icon?: string) => {
    if (!icon) return false;
    return icon.startsWith('fa') || 
           icon.startsWith('bi') || 
           icon.startsWith('material-icons') || 
           icon.startsWith('icon-');
  };

  // Get icon URL
  const getIconUrl = (icon?: string) => {
    if (!icon) return '';
    if (isIconClass(icon)) return icon;
    
    // Fix protocol-relative URLs by ensuring they start with http:// or https://
    if (icon.startsWith('//')) {
      return `https:${icon}`;
    }
    
    // Fix relative URLs that don't start with /
    if (!icon.startsWith('/') && !icon.startsWith('http')) {
      return `/${icon}`;
    }
    
    return icon;
  };

  // Load service data
  useEffect(() => {
    const fetchService = async () => {
      try {
        setLoading(true);
        const data = await FeaturedServiceService.getById(serviceId);
        
        if (!data) {
          setError("Layanan tidak ditemukan");
          return;
        }
        
        setService(data);
      } catch (err) {
        setError("Gagal memuat data layanan");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    if (serviceId) {
      fetchService();
    }
  }, [serviceId]);

  // Handle delete service
  const handleDelete = async () => {
    if (!confirm("Apakah Anda yakin ingin menghapus layanan ini?")) {
      return;
    }
    
    try {
      setLoading(true);
      await FeaturedServiceService.delete(serviceId);
      router.push("/featured-services");
    } catch (err) {
      setError("Gagal menghapus layanan");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="bg-destructive/10 text-destructive p-4 rounded-md">
        <h3 className="font-medium">Error</h3>
        <p>{error || "Layanan tidak ditemukan"}</p>
        <Button 
          variant="outline" 
          onClick={() => router.push("/featured-services")}
          className="mt-4"
        >
          Kembali ke Daftar Layanan
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={service.title?.id || service.title?.en || "Detail Layanan Unggulan"}
        backUrl="/featured-services"
        actions={
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => router.push("/featured-services")}
            >
              Kembali
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push(`/featured-services/${serviceId}/edit`)}
            >
              Edit
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
            >
              Hapus
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main content - 2/3 width */}
        <div className="md:col-span-2 space-y-6">
          {/* Service info */}
          <DetailView title="Informasi Layanan">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <DetailItem 
                  label="Judul (Indonesia)" 
                  icon={<Award size={16} />}
                >
                  {service.title?.id || <span className="italic text-muted-foreground">Tidak tersedia</span>}
                </DetailItem>
                
                <DetailItem 
                  label="Deskripsi Singkat (Indonesia)"
                  icon={<FileText size={16} />}
                >
                  {service.preview_description?.id || <span className="italic text-muted-foreground">Tidak tersedia</span>}
                </DetailItem>
                
                <DetailItem 
                  label="Deskripsi Lengkap (Indonesia)"
                >
                  <div className="prose prose-sm max-w-none">
                    {service.description?.id ? (
                      <div dangerouslySetInnerHTML={{ __html: service.description.id }} />
                    ) : (
                      <span className="italic text-muted-foreground">Tidak tersedia</span>
                    )}
                  </div>
                </DetailItem>
              </div>
              
              <div>
                <DetailItem 
                  label="Judul (English)" 
                  icon={<Award size={16} />}
                >
                  {service.title?.en || <span className="italic text-muted-foreground">Tidak tersedia</span>}
                </DetailItem>
                
                <DetailItem 
                  label="Deskripsi Singkat (English)"
                  icon={<FileText size={16} />}
                >
                  {service.preview_description?.en || <span className="italic text-muted-foreground">Tidak tersedia</span>}
                </DetailItem>
                
                <DetailItem 
                  label="Deskripsi Lengkap (English)"
                >
                  <div className="prose prose-sm max-w-none">
                    {service.description?.en ? (
                      <div dangerouslySetInnerHTML={{ __html: service.description.en }} />
                    ) : (
                      <span className="italic text-muted-foreground">Tidak tersedia</span>
                    )}
                  </div>
                </DetailItem>
              </div>
            </div>
          </DetailView>

          {/* Benefits */}
          <DetailView title="Manfaat Layanan">
            {service.benefits && service.benefits.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {service.benefits.map((benefit: ServiceBenefit) => (
                  <div 
                    key={benefit.id}
                    className="bg-muted/50 p-3 rounded-md flex items-start gap-3"
                  >
                    <CheckCircle size={18} className="text-primary mt-0.5 shrink-0" />
                    <div>
                      <p className="font-medium">{benefit.title?.id || benefit.title?.en}</p>
                      {benefit.title?.en && benefit.title?.id !== benefit.title?.en && (
                        <p className="text-xs text-muted-foreground">{benefit.title.en}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">
                Tidak ada manfaat yang terdaftar
              </p>
            )}
          </DetailView>
          
          {/* Skills */}
          <DetailView title="Teknologi Terkait">
            {service.skills && service.skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {service.skills.map((skill: TechStack) => (
                  <div 
                    key={skill.id}
                    className="bg-muted px-3 py-1 rounded-full text-sm flex items-center gap-1.5"
                  >
                    {skill.icon && isIconClass(skill.icon) && (
                      <i className={skill.icon} style={{ fontSize: '14px' }}></i>
                    )}
                    {skill.title?.id || skill.title?.en || `Skill ${skill.id}`}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">
                Tidak ada teknologi terkait
              </p>
            )}
          </DetailView>
        </div>

        {/* Sidebar - 1/3 width */}
        <div className="space-y-6">
          {/* Service Icon */}
          <DetailView title="Icon Layanan">
            {service.icon ? (
              <div className="flex justify-center p-4">
                {isIconClass(service.icon) ? (
                  <div className="w-24 h-24 flex items-center justify-center bg-muted rounded-lg">
                    <i className={service.icon} style={{ fontSize: '48px' }}></i>
                  </div>
                ) : (
                  <div className="w-full max-w-[200px] aspect-square relative rounded-lg overflow-hidden border border-border">
                    <Image 
                      src={getIconUrl(service.icon)} 
                      alt={service.title?.id || "Service icon"} 
                      fill
                      className="object-contain"
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-6 text-muted-foreground">
                <ImageIcon size={48} strokeWidth={1} />
                <p className="mt-2 text-sm">Tidak ada icon</p>
              </div>
            )}
          </DetailView>
          
          {/* Metadata */}
          <DetailView title="Metadata">
            <DetailItem 
              label="Tanggal Dibuat" 
              icon={<Calendar size={16} />}
            >
              {formatDate(service.created_at) || <span className="italic text-muted-foreground">Tidak tersedia</span>}
            </DetailItem>
            
            <DetailItem 
              label="Terakhir Diperbarui" 
              icon={<Calendar size={16} />}
            >
              {formatDate(service.updated_at) || <span className="italic text-muted-foreground">Tidak tersedia</span>}
            </DetailItem>
          </DetailView>
        </div>
      </div>
    </div>
  );
}