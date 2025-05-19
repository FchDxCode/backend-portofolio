'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';

import { PageHeader } from '@/src/components/multipage/PageHeader';
import { Button } from '@/src/components/multipage/Button';
import { FormSection } from '@/src/components/multipage/FormSection';
import { InputMultipage } from '@/src/components/multipage/InputMultipage';
import { ImageUpload } from '@/src/components/multipage/ImageUpload';
import { DropdownMultipage } from '@/src/components/multipage/DropdownMultipage';
import { RichTextEditor } from '@/src/components/richtext/RichEditor';
import { ProjectImage } from '@/src/models/ProjectModels';

import { useProject } from '@/src/hook/useProject';
import { useSkills } from '@/src/hook/skill/useSkill';
import { saveFile } from '@/src/utils/server/FileStorage';

type Lang = 'id' | 'en';
type MultilingualFields = 'title' | 'subtitle' | 'description';

interface FormData {
  title: Record<Lang, string>;
  subtitle: Record<Lang, string>;
  description: Record<Lang, string>;
  meta_title: string;
  meta_description: string;
  link_demo: string;
  link_source_code: string;
  skill_ids: number[];
}

export default function ProyekEditPage() {
  const { id } = useParams(); // from /proyek/[id]/edit
  const projectId = Number(id);
  const router = useRouter();

  // hook state
  const {
    project,
    loading: loadingProject,
    error: projectError,
    updateProject,
  } = useProject(projectId);

  const { skills } = useSkills();  

  // local form state
  const [activeTab, setActiveTab] = useState<Lang>('id');
  const [formData, setFormData] = useState<FormData>({
    title: { id: '', en: '' },
    subtitle: { id: '', en: '' },
    description: { id: '', en: '' },
    meta_title: '',
    meta_description: '',
    link_demo: '',
    link_source_code: '',
    skill_ids: [],
  });

  // images state
  const [existingImages, setExistingImages] = useState<ProjectImage[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [removeImageIds, setRemoveImageIds] = useState<number[]>([]);

  // UI state
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // when project loads, initialize form
  useEffect(() => {
    if (project) {
      setFormData({
        title: project.title as Record<Lang, string>,
        subtitle: project.subtitle as Record<Lang, string>,
        description: project.description as Record<Lang, string>,
        meta_title: project.meta_title || '',
        meta_description: project.meta_description || '',
        link_demo: project.link_demo || '',
        link_source_code: project.link_source_code || '',
        skill_ids: project.skills,
      });
      setExistingImages(project.images);
    }
  }, [project]);

  // handlers
  const handleMulti = (
    field: MultilingualFields,
    lang: Lang,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: { ...prev[field], [lang]: value },
    }));
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSkills = (vals: number[]) =>
    setFormData((prev) => ({ ...prev, skill_ids: vals }));

  const handleEditorChange = (content: string, lang: Lang) => {
    setFormData((prev) => ({
      ...prev,
      description: { ...prev.description, [lang]: content },
    }));
  };

  const handleEditorImageUpload = async (file: File) => {
    return await saveFile(file, { folder: 'projects/content' });
  };

  const handleRemoveExistingImage = (imgId: number) => {
    setExistingImages((prev) => prev.filter((img) => img.id !== imgId));
    setRemoveImageIds((prev) => [...prev, imgId]);
  };

  const validate = () => {
    setError(null);
    if (!formData.title.id.trim()) {
      setError('Judul Proyek (ID) wajib diisi');
      return false;
    }
    if (!formData.description.id.trim()) {
      setError('Deskripsi Proyek (ID) wajib diisi');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setError(null);

    try {
      await updateProject(
        projectId,
        {
          title: formData.title,
          subtitle: formData.subtitle,
          description: formData.description,
          meta_title: formData.meta_title,
          meta_description: formData.meta_description,
          link_demo: formData.link_demo,
          link_source_code: formData.link_source_code,
        },
        formData.skill_ids,
        newImages,
        removeImageIds
      );

      setSuccess(true);
      setTimeout(() => router.push('/proyek'), 1500);
    } catch (err) {
      console.error(err);
      setError('Gagal memperbarui proyek. Silakan coba lagi.');
    } finally {
      setSubmitting(false);
    }
  };

  // skill options for dropdown
  const skillOptions = skills.map((s) => ({
    value: s.id,
    label: s.title?.[activeTab] || s.slug,
  }));

  if (loadingProject) {
    return <div>Memuat data proyek…</div>;
  }
  if (projectError) {
    return <div className="text-red-600">Error: {projectError.message}</div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Proyek"
        description="Perbarui detail proyek"
        actions={
          <Link href="/proyek">
            <Button variant="outline" icon={<ArrowLeft size={16} />}>
              Kembali
            </Button>
          </Link>
        }
      />

      {error && (
        <div className="bg-destructive/15 text-destructive px-4 py-3 rounded-md">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-emerald-500/15 text-emerald-500 px-4 py-3 rounded-md">
          Proyek berhasil diperbarui!
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Language Tabs */}
        <div className="flex border-b border-gray-200">
          {(['id', 'en'] as Lang[]).map((lang) => (
            <button
              key={lang}
              type="button"
              onClick={() => setActiveTab(lang)}
              className={`py-2 px-4 ${
                activeTab === lang
                  ? 'border-b-2 border-primary font-medium'
                  : 'text-muted-foreground'
              }`}
            >
              {lang === 'id' ? 'Bahasa Indonesia' : 'English'}
            </button>
          ))}
        </div>

        {/* Informasi Dasar */}
        <FormSection
          title={`Informasi Dasar (${activeTab.toUpperCase()})`}
          description="Judul & subtitle proyek"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputMultipage
              label="Judul"
              language={activeTab}
              value={formData.title[activeTab]}
              onChange={(e) =>
                handleMulti('title', activeTab, e.target.value)
              }
              required
            />
            <InputMultipage
              label="Subtitle"
              language={activeTab}
              value={formData.subtitle[activeTab]}
              onChange={(e) =>
                handleMulti('subtitle', activeTab, e.target.value)
              }
            />
          </div>
        </FormSection>

        {/* Deskripsi */}
        <FormSection
          title={`Deskripsi (${activeTab.toUpperCase()})`}
          description="Detail deskripsi proyek"
        >
          <RichTextEditor
            value={formData.description[activeTab]}
            onChange={(c) => handleEditorChange(c, activeTab)}
            onImageUpload={handleEditorImageUpload}
            placeholder={`Tulis deskripsi proyek (${activeTab})`}
            language={activeTab}
          />
        </FormSection>

        {/* SEO */}
        <FormSection title="SEO" description="Meta title & description">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputMultipage
              label="Meta Title"
              language={activeTab}
              name="meta_title"
              value={formData.meta_title}
              onChange={handleChange}
            />
            <InputMultipage
              label="Meta Description"
              language={activeTab}
              name="meta_description"
              value={formData.meta_description}
              onChange={handleChange}
              multiline
              rows={3}
            />
          </div>
        </FormSection>

        {/* Link */}
        <FormSection title="Link" description="Demo & source code">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputMultipage
              label="Link Demo"
              type="url"
              language={activeTab}
              name="link_demo"
              value={formData.link_demo}
              onChange={handleChange}
            />
            <InputMultipage
              label="Link Source Code"
              type="url"
              language={activeTab}
              name="link_source_code"
              value={formData.link_source_code}
              onChange={handleChange}
            />
          </div>
        </FormSection>

        {/* Gambar */}
        <FormSection
          title="Gambar"
          description="Hapus / tambahkan gambar proyek"
        >
          <div className="flex gap-3 flex-wrap">
            {existingImages.map((img) => (
              <div key={img.id} className="relative w-24 h-24">
                <img
                  src={img.image}
                  alt=""
                  className="w-full h-full object-cover rounded"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveExistingImage(img.id)}
                  className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <ImageUpload
              images={newImages}
              onChange={setNewImages}
              maxFiles={5}
              label="Upload gambar baru"
            />
          </div>
        </FormSection>

        {/* Skills */}
        <FormSection
          title="Skills"
          description="Pilih skill yang digunakan"
        >
          <DropdownMultipage
            label="Skills"
            isMultiple
            value={formData.skill_ids}
            onChange={(value) => handleSkills(value as number[])}
            options={skillOptions}
            placeholder="Pilih skill..."
          />
        </FormSection>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Link href="/proyek">
            <Button variant="outline">Batal</Button>
          </Link>
          <Button
            type="submit"
            variant="primary"
            icon={<Save size={16} />}
            isLoading={submitting}
          >
            Simpan
          </Button>
        </div>
      </form>
    </div>
  );
}
