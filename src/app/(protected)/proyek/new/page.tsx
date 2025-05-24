'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';

import { PageHeader } from '@/src/components/multipage/PageHeader';
import { Button } from '@/src/components/multipage/Button';
import { FormSection } from '@/src/components/multipage/FormSection';
import { InputMultipage } from '@/src/components/multipage/InputMultipage';
import { ImageUpload } from '@/src/components/multipage/ImageUpload';
import { DropdownMultipage } from '@/src/components/multipage/DropdownMultipage';
import { RichTextEditor } from '@/src/components/richtext/RichEditor';

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
  images: File[];
}

export default function ProyekNewPage() {
  const router = useRouter();
  const { createProject } = useProject();
  const { skills } = useSkills();

  const [activeTab, setActiveTab] = useState<Lang>('id');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormData>({
    title: { id: '', en: '' },
    subtitle: { id: '', en: '' },
    description: { id: '', en: '' },
    meta_title: '',
    meta_description: '',
    link_demo: '',
    link_source_code: '',
    skill_ids: [],
    images: [],
  });

  // ganti field multilingual
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

  // change biasa
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // skills select
  const handleSkills = (vals: number[]) =>
    setFormData((prev) => ({ ...prev, skill_ids: vals }));

  // images
  const handleImages = (files: File[]) =>
    setFormData((prev) => ({ ...prev, images: files }));

  // editor change
  const handleEditorChange = (content: string, lang: Lang) => {
    setFormData((prev) => ({
      ...prev,
      description: { ...prev.description, [lang]: content },
    }));
  };

  // image upload di editor
  const handleEditorImageUpload = async (file: File) => {
    // simpan di folder content
    return await saveFile(file, { folder: 'projects/content' });
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

    setLoading(true);
    try {
      await createProject(
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
        formData.images
      );
      router.push('/proyek');
    } catch {
      setError('Gagal membuat proyek. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  // options untuk DropdownMultipage
  const skillOptions = skills.map((s) => ({
    value: s.id,
    label: s.title?.id || s.title?.en,
  }));

    return (
    <div className="space-y-6">
      <PageHeader
        title="Tambah Proyek Baru"
        description="Isi detail proyek di bawah ini"
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
              name="meta_title"
              language={activeTab}
              value={formData.meta_title}
              onChange={handleChange}
            />
            <InputMultipage
              label="Meta Description"
              name="meta_description"
              language={activeTab}
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
              name="link_demo"
              type="url"
              language={activeTab}
              value={formData.link_demo}
              onChange={handleChange}
            />
            <InputMultipage
              label="Link Source Code"
              name="link_source_code"
              type="url"
              language={activeTab}
              value={formData.link_source_code}
              onChange={handleChange}
            />
          </div>
        </FormSection>

        {/* Gambar */}
        <FormSection
          title="Gambar"
          description="Unggah hingga 5 gambar proyek"
        >
          <ImageUpload
            images={formData.images}
            onChange={handleImages}
            maxFiles={5}
            maxSize={10}
            label="Pilih gambar"
          />
        </FormSection>

        {/* Skills */}
        <FormSection
          title="Skills"
          description="Pilih skill yang digunakan"
        >
          <DropdownMultipage
            label="Skills"
            isMultiple={true}
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
            isLoading={loading}
          >
            Simpan
          </Button>
        </div>
      </form>
    </div>
  );
}
