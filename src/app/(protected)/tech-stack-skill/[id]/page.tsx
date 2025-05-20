"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageHeader } from "@/src/components/multipage/PageHeader";
import { Button } from "@/src/components/multipage/Button";
import { DetailView } from "@/src/components/multipage/DetailView";
import { TechStackSkillService } from "@/src/services/services/TechStackSkillServices";
import { TechStackSkill } from "@/src/models/ServiceModels";
import { Pencil, Trash2 } from "lucide-react";
import { useTechStackSkills } from "@/src/hook/services/useTechStackSkill";

export default function TechStackSkillDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = parseInt(params.id as string);
  const { deleteSkill, getTechStackCount } = useTechStackSkills();
  
  const [skill, setSkill] = useState<TechStackSkill | null>(null);
  const [techStackCount, setTechStackCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch skill data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch skill details
        const skillData = await TechStackSkillService.getById(id);
        setSkill(skillData);
        
        // Fetch tech stack count
        const count = await getTechStackCount(id);
        setTechStackCount(count);
        
      } catch (err) {
        console.error("Error fetching skill details:", err);
        setError("Gagal memuat data skill");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [id, getTechStackCount]);

  const handleDelete = async () => {
    if (!skill) return;
    
    try {
      if (techStackCount > 0) {
        alert(`Skill ini digunakan oleh ${techStackCount} tech stack. Tidak dapat dihapus.`);
        return;
      }
      
      if (window.confirm(`Apakah Anda yakin ingin menghapus skill "${skill.title?.id || skill.title?.en}"?`)) {
        await deleteSkill(id);
        router.push("/tech-stack-skill");
      }
    } catch (err) {
      console.error("Error deleting skill:", err);
      setError("Gagal menghapus skill");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!skill) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <h3 className="text-lg font-medium">Skill tidak ditemukan</h3>
        <Button
          variant="outline"
          onClick={() => router.push("/tech-stack-skill")}
          className="mt-4"
        >
          Kembali
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Detail Tech Stack Skill"
        backUrl="/tech-stack-skill"
        actions={
          <div className="flex gap-2">
            <Button
              variant="outline"
              icon={<Pencil size={16} />}
              onClick={() => router.push(`/tech-stack-skill/${id}/edit`)}
            >
              Edit
            </Button>
            <Button
              variant="destructive"
              icon={<Trash2 size={16} />}
              onClick={handleDelete}
              disabled={techStackCount > 0}
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

      <DetailView>
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Informasi Skill</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Nama (Indonesia)</p>
                  <p className="font-medium">{skill.title?.id || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Nama (English)</p>
                  <p className="font-medium">{skill.title?.en || "-"}</p>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground">Tanggal Dibuat</p>
                <p className="font-medium">
                  {skill.created_at
                    ? new Date(skill.created_at).toLocaleDateString("id-ID", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })
                    : "-"}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground">Terakhir Diperbarui</p>
                <p className="font-medium">
                  {skill.updated_at
                    ? new Date(skill.updated_at).toLocaleDateString("id-ID", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })
                    : "-"}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground">Digunakan oleh</p>
                <p className="font-medium">{techStackCount} tech stack</p>
              </div>
            </div>
          </div>
        </div>
      </DetailView>
    </div>
  );
}