'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { PageHeader } from '@/src/components/multipage/PageHeader';
import { Button } from '@/src/components/multipage/Button';
import { DetailItem, DetailView } from '@/src/components/multipage/DetailView';
import { useProject } from '@/src/hook/useProject';
import { useSkills } from '@/src/hook/skill/useSkill';
import { 
  ArrowLeft, 
  Save, 
  FileText, 
  Image, 
  Link2, 
  Calendar, 
  CheckCircle, 
  XCircle 
} from 'lucide-react';

type Lang = 'id' | 'en';

export default function ProyekDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const projectId = Number(id);

  const { project, loading, error } = useProject(projectId);
  const { skills: allSkills } = useSkills();

  const [activeTab, setActiveTab] = useState<Lang>('id');

  // Related skills from allSkills filtered by project.skills
  const relatedSkills = allSkills.filter(s => project?.skills.includes(s.id));

  const formatDate = (d?: string | null) => {
    if (!d) return '-';
    try {
      return new Date(d).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return d;
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  );

  if (error || !project) return (
    <div className="bg-destructive/10 text-destructive p-4 rounded-md">
      <h3 className="font-medium">Error</h3>
      <p>{error?.message || 'Proyek tidak ditemukan'}</p>
      <Button 
        variant="outline" 
        onClick={() => router.push('/proyek')}
        className="mt-4"
      >
        Kembali ke Daftar Proyek
      </Button>
    </div>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title={project.title?.[activeTab] || project.title?.id || 'Detail Proyek'}
        backUrl="/proyek"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push('/proyek')}>
              Kembali
            </Button>
            <Button variant="outline" onClick={() => router.push(`/proyek/${projectId}/edit`)}>
              Edit
            </Button>
          </div>
        }
      />

      {/* Language Tabs */}
      <div className="flex border-b border-gray-200">
        {(['id', 'en'] as Lang[]).map(lang => (
          <button
            key={lang}
            type="button"
            onClick={() => setActiveTab(lang)}
            className={`py-2 px-4 ${
              activeTab === lang ? 'border-b-2 border-primary font-medium' : 'text-muted-foreground'
            }`}
          >
            {lang === 'id' ? 'Bahasa Indonesia' : 'English'}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main content - 2/3 */}
        <div className="md:col-span-2 space-y-6">
          <DetailView title="Informasi Proyek">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <DetailItem label="Judul" icon={<Save size={16} />}>
                  {project.title?.[activeTab] || <i className="text-muted-foreground">Tidak tersedia</i>}
                </DetailItem>
                <DetailItem label="Subtitle">
                  {project.subtitle?.[activeTab] || <i className="text-muted-foreground">Tidak tersedia</i>}
                </DetailItem>
                <DetailItem label="Deskripsi">
                  <div 
                    className="prose max-w-none"
                    dangerouslySetInnerHTML={{ __html: project.description?.[activeTab] || '<i>Tidak tersedia</i>' }}
                  />
                </DetailItem>
              </div>
              <div>
                <DetailItem label="Link Demo" icon={<Link2 size={16} />}>
                  {project.link_demo ? (
                    <a href={project.link_demo} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                      {project.link_demo}
                    </a>
                  ) : (
                    <i className="text-muted-foreground">Tidak tersedia</i>
                  )}
                </DetailItem>
                <DetailItem label="Link Source Code" icon={<Link2 size={16} />}>
                  {project.link_source_code ? (
                    <a href={project.link_source_code} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                      {project.link_source_code}
                    </a>
                  ) : (
                    <i className="text-muted-foreground">Tidak tersedia</i>
                  )}
                </DetailItem>
              </div>
            </div>
          </DetailView>

          <DetailView title="Skills Terkait">
            {relatedSkills.length ? (
              <div className="flex flex-wrap gap-2">
                {relatedSkills.map(skill => (
                  <span 
                    key={skill.id} 
                    className="bg-muted px-3 py-1 rounded-full text-sm"
                  >
                    {skill.title?.[activeTab] || skill.title?.id || skill.slug}
                  </span>
                ))}
              </div>
            ) : (
              <p className="italic text-muted-foreground">Tidak ada skill terkait</p>
            )}
          </DetailView>
        </div>

        {/* Sidebar - 1/3 */}
        <div className="space-y-6">
          <DetailView title="Gambar Proyek">
            <div className="space-y-2">
              {project.images.length ? (
                <div className="grid grid-cols-2 gap-4">
                  {project.images.map(img => (
                    <img
                      key={img.id}
                      src={img.image}
                      alt={`Gambar proyek ${img.id}`}
                      className="w-full h-32 object-cover rounded-md border border-border"
                    />
                  ))}
                </div>
              ) : (
                <i className="text-muted-foreground">Tidak ada gambar</i>
              )}
            </div>
          </DetailView>

          <DetailView title="SEO & Metadata">
            <DetailItem label="Meta Title">
              {project.meta_title || <i className="text-muted-foreground">Tidak tersedia</i>}
            </DetailItem>
            <DetailItem label="Meta Description">
              {project.meta_description || <i className="text-muted-foreground">Tidak tersedia</i>}
            </DetailItem>
          </DetailView>

          <DetailView title="Metadata">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">ID</span>
                <span>{project.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Dibuat</span>
                <span>{formatDate(project.created_at)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Diperbarui</span>
                <span>{formatDate(project.updated_at)}</span>
              </div>
            </div>
          </DetailView>
        </div>
      </div>
    </div>
  );
}

function formatDate(dateString?: string | null) {
  if (!dateString) return '-';
  try {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}
