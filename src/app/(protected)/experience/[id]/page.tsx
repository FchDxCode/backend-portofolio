"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageHeader } from "@/src/components/multipage/PageHeader";
import { Button } from "@/src/components/multipage/Button";
import { DetailView, DetailItem } from "@/src/components/multipage/DetailView";
import { ExperienceService } from "@/src/services/experience/ExperienceServices";
import { ExperienceCategoryService } from "@/src/services/experience/ExperienceCategoryServices";
import { Experience, ExperienceCategory } from "@/src/models/ExperienceModels";
import { Pencil, Trash2, ExternalLink, Calendar, MapPin, Award, Briefcase, Building, Clock, User, Code } from "lucide-react";
import { useExperiences } from "@/src/hook/experience/useExperience";
import Image from "next/image";
import { Skill } from "@/src/models/SkillModels";
import { createClient } from "@/src/utils/supabase/client";

export default function ExperienceDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const experienceId = typeof id === 'string' ? parseInt(id, 10) : 0;
  
  const { deleteExperience } = useExperiences();
  
  const [experience, setExperience] = useState<Experience | null>(null);
  const [category, setCategory] = useState<ExperienceCategory | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loadingSkills, setLoadingSkills] = useState<boolean>(false);

  // Format date in locale format
  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Fungsi untuk mengambil data skill berdasarkan array ID
  const fetchSkills = async (skillIds: number[]) => {
    if (!skillIds || skillIds.length === 0) return [];
    
    try {
      setLoadingSkills(true);
      const supabase = createClient();
      const { data, error } = await supabase
        .from('skills')
        .select('*')
        .in('id', skillIds);
        
      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Error fetching skills:', err);
      return [];
    } finally {
      setLoadingSkills(false);
    }
  };

  useEffect(() => {
    const fetchExperience = async () => {
      try {
        setLoading(true);
        const data = await ExperienceService.getById(experienceId, true);
        setExperience(data);
        
        // Fetch category if available
        if (data?.experience_category_id) {
          const categoryData = await ExperienceCategoryService.getById(data.experience_category_id);
          setCategory(categoryData);
        }
        
        // Fetch associated skills if available
        if (data && 'skillIds' in data && data.skillIds && data.skillIds.length > 0) {
          const skillsData = await fetchSkills(data.skillIds);
          setSkills(skillsData);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal memuat data pengalaman");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchExperience();
  }, [experienceId]);

  const handleDelete = async () => {
    if (!experience) return;
    
    if (window.confirm(`Apakah Anda yakin ingin menghapus pengalaman "${experience.title?.id || experience.title?.en}"?`)) {
      try {
        await deleteExperience(experience.id);
        router.push("/experience");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal menghapus pengalaman");
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

  if (error || !experience) {
    return (
      <div className="bg-destructive/10 text-destructive p-4 rounded-md">
        <h3 className="font-medium">Error</h3>
        <p>{error || "Pengalaman tidak ditemukan"}</p>
        <Button 
          variant="outline" 
          onClick={() => router.push("/experience")}
          className="mt-4"
        >
          Kembali ke Daftar Pengalaman
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={experience.title?.id || experience.title?.en || "Detail Pengalaman"}
        backUrl="/experience"
        actions={
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => router.push("/experience")}
            >
              Kembali
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push(`/experience/${experienceId}/edit`)}
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
          {/* Company Information */}
          <DetailView title="Informasi Perusahaan">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <DetailItem 
                  label="Nama Perusahaan (Indonesia)" 
                  icon={<Building size={16} />}
                >
                  {experience.title?.id || <span className="italic text-muted-foreground">Tidak tersedia</span>}
                </DetailItem>
                
                {experience.company_link && (
                  <DetailItem 
                    label="Website Perusahaan" 
                    icon={<ExternalLink size={16} />}
                  >
                    <a 
                      href={experience.company_link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline flex items-center gap-1"
                    >
                      {experience.company_link} <ExternalLink size={14} />
                    </a>
                  </DetailItem>
                )}
              </div>
              
              <div>
                <DetailItem 
                  label="Nama Perusahaan (English)" 
                  icon={<Building size={16} />}
                >
                  {experience.title?.en || <span className="italic text-muted-foreground">Tidak tersedia</span>}
                </DetailItem>
              </div>
            </div>
          </DetailView>

          {/* Position Information */}
          <DetailView title="Informasi Posisi">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <DetailItem 
                  label="Posisi/Jabatan (Indonesia)" 
                  icon={<User size={16} />}
                >
                  {experience.subtitle?.id || <span className="italic text-muted-foreground">Tidak tersedia</span>}
                </DetailItem>
                
                <DetailItem 
                  label="Kategori" 
                  icon={<Award size={16} />}
                >
                  {category ? (category.title?.id || category.title?.en) : 
                    <span className="italic text-muted-foreground">Tidak tersedia</span>}
                  {category?.title?.en && category.title?.id !== category.title?.en && (
                    <span className="text-xs text-muted-foreground block mt-1">
                      {category.title.en}
                    </span>
                  )}
                </DetailItem>
              </div>
              
              <div>
                <DetailItem 
                  label="Posisi/Jabatan (English)" 
                  icon={<User size={16} />}
                >
                  {experience.subtitle?.en || <span className="italic text-muted-foreground">Tidak tersedia</span>}
                </DetailItem>
                
                <DetailItem 
                  label="Durasi" 
                  icon={<Clock size={16} />}
                >
                  {experience.experience_long !== undefined ? 
                    `${experience.experience_long} ${experience.experience_long > 1 ? 'tahun' : 'tahun'}` : 
                    <span className="italic text-muted-foreground">Tidak tersedia</span>}
                </DetailItem>
              </div>
              
              <div>
                <DetailItem 
                  label="Lokasi (Indonesia)" 
                  icon={<MapPin size={16} />}
                >
                  {experience.location?.id || <span className="italic text-muted-foreground">Tidak tersedia</span>}
                </DetailItem>
              </div>
              
              <div>
                <DetailItem 
                  label="Lokasi (English)" 
                  icon={<MapPin size={16} />}
                >
                  {experience.location?.en || <span className="italic text-muted-foreground">Tidak tersedia</span>}
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
                      {experience.description?.id || <span className="italic text-muted-foreground">Tidak tersedia</span>}
                    </p>
                  </div>
                </DetailItem>
              </div>
              
              <div>
                <DetailItem label="Deskripsi (English)">
                  <div className="prose prose-sm max-w-none">
                    <p className="whitespace-pre-wrap">
                      {experience.description?.en || <span className="italic text-muted-foreground">Tidak tersedia</span>}
                    </p>
                  </div>
                </DetailItem>
              </div>
            </div>
          </DetailView>
          
          {/* Key Achievements */}
          <DetailView title="Pencapaian Utama">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <DetailItem label="Pencapaian Utama (Indonesia)">
                  <div className="prose prose-sm max-w-none">
                    <p className="whitespace-pre-wrap">
                      {experience.key_achievements?.id || <span className="italic text-muted-foreground">Tidak tersedia</span>}
                    </p>
                  </div>
                </DetailItem>
              </div>
              
              <div>
                <DetailItem label="Pencapaian Utama (English)">
                  <div className="prose prose-sm max-w-none">
                    <p className="whitespace-pre-wrap">
                      {experience.key_achievements?.en || <span className="italic text-muted-foreground">Tidak tersedia</span>}
                    </p>
                  </div>
                </DetailItem>
              </div>
            </div>
          </DetailView>
        </div>

        {/* Sidebar - 1/3 width */}
        <div className="space-y-6">
          {/* Company Logo */}
          <DetailView title="Logo Perusahaan">
            <div className="flex justify-center p-4">
              {experience.company_logo ? (
                <div className="h-40 w-40 overflow-hidden rounded-md border border-border">
                  <Image 
                    src={experience.company_logo} 
                    alt={experience.title?.id || "Company logo"} 
                    width={160} 
                    height={160} 
                    className="h-full w-full object-contain"
                  />
                </div>
              ) : (
                <div className="h-40 w-40 flex items-center justify-center rounded-md border border-dashed border-border bg-muted/30">
                  <span className="text-sm text-muted-foreground">
                    Tidak ada logo
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
                <span>{experience.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Dibuat</span>
                <span>{formatDate(experience.created_at)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Diperbarui</span>
                <span>{formatDate(experience.updated_at)}</span>
              </div>
            </div>
          </DetailView>

          {/* Skills Section */}
          <DetailView title="Keterampilan Terkait">
            {loadingSkills ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : skills.length > 0 ? (
              <div className="flex flex-wrap gap-2 p-3">
                {skills.map(skill => (
                  <div 
                    key={skill.id} 
                    className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                  >
                    {skill.title?.id || skill.title?.en || skill.slug}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-muted-foreground text-sm">
                Tidak ada keterampilan yang terkait
              </div>
            )}
          </DetailView>
        </div>
      </div>
    </div>
  );
}