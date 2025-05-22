'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/src/components/multipage/PageHeader';
import { Button } from '@/src/components/multipage/Button';
import { FormSection } from '@/src/components/multipage/FormSection';
import { DetailView } from '@/src/components/multipage/DetailView';
import { InputMultipage } from '@/src/components/multipage/InputMultipage';
import { DropdownMultipage } from '@/src/components/multipage/DropdownMultipage';
import { ImageUpload } from '@/src/components/multipage/ImageUpload';
import { useServiceProcess } from '@/src/hook/services/useProcessServices';

type FormData = {
  title: { id: string; en: string };
  description: { id: string; en: string };
  work_duration?: number;
  icon?: string;
  is_active: boolean;
  activityIds: number[];
};

export default function ProcessNewPage() {
  const router = useRouter();
  const { createProcess, activities, fetchActivities } = useServiceProcess();

  const [activeTab, setActiveTab] = useState<'id' | 'en'>('id');
  const [formData, setFormData] = useState<FormData>({
    title: { id: '', en: '' },
    description: { id: '', en: '' },
    work_duration: undefined,
    is_active: true,
    activityIds: []
  });
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconType, setIconType] = useState<'file' | 'class'>('file');
  const [iconClass, setIconClass] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // INPUT HANDLER
  const handleInputChange = (
    field: keyof FormData,
    value: any,
    lang?: 'id' | 'en'
  ) => {
    if (lang) {
      setFormData((prev) => {
        const currentField = prev[field] as Record<string, string>;
        
        return {
          ...prev,
          [field]: {
            ...currentField,
            [lang]: value,
          },
        };
      });
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  // VALIDASI
  const validateForm = () => {
    setError(null);

    if (!formData.title.id && !formData.title.en) {
      setError('Judul proses harus diisi (ID atau EN)');
      return false;
    }
    return true;
  };

  // SUBMIT
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      
      const processData = {
        ...formData,
        icon: iconType === 'class' ? iconClass : undefined,
      };
      
      await createProcess(
        processData,
        iconType === 'file' ? iconFile || undefined : undefined
      );
      
      router.push('/processes');
    } catch (err) {
      console.error('Error creating process:', err);
      
      let errorMessage = 'Terjadi kesalahan saat menyimpan data';
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'object' && err !== null) {
        errorMessage = JSON.stringify(err);
      }
      
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // OPTIONS
  const activityOptions = activities.map((activity) => ({
    label: activity.title?.id || activity.title?.en || `Activity ${activity.id}`,
    value: activity.id,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tambah Proses Layanan"
        backUrl="/processes"
        actions={
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => router.push('/processes')}
            >
              Batal
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              isLoading={isSubmitting}
            >
              Simpan
            </Button>
          </div>
        }
      />

      {error && (
        <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <DetailView>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Main content - 2/3 width */}
            <div className="md:col-span-2 space-y-6">
              {/* Language tabs */}
              <div className="flex border-b border-gray-200">
                <button
                  type="button"
                  onClick={() => setActiveTab('id')}
                  className={`py-2 px-4 ${
                    activeTab === 'id'
                      ? 'border-b-2 border-primary font-medium'
                      : 'text-muted-foreground'
                  }`}
                >
                  Bahasa Indonesia
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('en')}
                  className={`py-2 px-4 ${
                    activeTab === 'en'
                      ? 'border-b-2 border-primary font-medium'
                      : 'text-muted-foreground'
                  }`}
                >
                  English
                </button>
              </div>

              {/* Process Information */}
              <FormSection title="Informasi Proses">
                <div className="space-y-4">
                  {/* Process Title */}
                  <div className="space-y-2">
                    <InputMultipage
                      value={formData.title[activeTab]}
                      onChange={(e) =>
                        handleInputChange('title', e.target.value, activeTab)
                      }
                      label={`Judul Proses ${
                        activeTab === 'id' ? '(Indonesia)' : '(English)'
                      }`}
                      language={activeTab}
                      required={activeTab === 'id'}
                      placeholder={`Masukkan judul proses ${
                        activeTab === 'id'
                          ? 'dalam Bahasa Indonesia'
                          : 'in English'
                      }`}
                    />
                  </div>

                  {/* Process Description */}
                  <div className="space-y-2">
                    <InputMultipage
                      value={formData.description[activeTab]}
                      onChange={(e) =>
                        handleInputChange(
                          'description',
                          e.target.value,
                          activeTab
                        )
                      }
                      label={`Deskripsi Proses ${
                        activeTab === 'id' ? '(Indonesia)' : '(English)'
                      }`}
                      language={activeTab}
                      multiline
                      rows={5}
                      placeholder={`Masukkan deskripsi proses ${
                        activeTab === 'id'
                          ? 'dalam Bahasa Indonesia'
                          : 'in English'
                      }`}
                    />
                  </div>
                </div>
              </FormSection>
            </div>

            {/* Sidebar - 1/3 width */}
            <div className="space-y-6">
              <FormSection title="Pengaturan Proses">
                <div className="space-y-4">
                  {/* Work Duration */}
                  <div className="space-y-2">
                    <InputMultipage
                      value={formData.work_duration?.toString() || ''}
                      onChange={(e) =>
                        handleInputChange(
                          'work_duration',
                          e.target.value ? parseInt(e.target.value) : undefined
                        )
                      }
                      label="Durasi Pengerjaan (bulan)"
                      type="number"
                      min={1}
                      placeholder="Masukkan durasi pengerjaan dalam bulan"
                    />
                  </div>

                  {/* Active Status */}
                  <div className="space-y-2">
                    <DropdownMultipage
                      label="Status"
                      options={[
                        { label: 'Aktif', value: true },
                        { label: 'Tidak Aktif', value: false }
                      ]}
                      value={formData.is_active ? 'Aktif' : 'Tidak Aktif'}
                      onChange={(value) =>
                        handleInputChange('is_active', value)
                      }
                      placeholder="Pilih status"
                    />
                  </div>

                  {/* Activities Selection - Multiple */}
                  <div className="space-y-2">
                    <DropdownMultipage
                      label="Aktivitas Terkait"
                      options={activityOptions}
                      value={formData.activityIds}
                      onChange={(value) =>
                        handleInputChange('activityIds', value)
                      }
                      placeholder="Pilih aktivitas terkait"
                      isMultiple={true}
                    />
                  </div>
                </div>
              </FormSection>

              <FormSection title="Icon Proses">
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <button
                      type="button"
                      onClick={() => setIconType('file')}
                      className={`px-3 py-1.5 text-sm rounded-md ${
                        iconType === 'file'
                          ? 'bg-primary text-white'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      Upload File
                    </button>
                    <button
                      type="button"
                      onClick={() => setIconType('class')}
                      className={`px-3 py-1.5 text-sm rounded-md ${
                        iconType === 'class'
                          ? 'bg-primary text-white'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      Class Icon
                    </button>
                  </div>

                  {iconType === 'file' ? (
                    <>
                      <ImageUpload
                        onChange={setIconFile}
                        label="Unggah Icon Proses"
                        value={iconFile}
                        maxSize={5 * 1024 * 1024}
                        accept="image/*"
                      />
                      <p className="text-xs text-muted-foreground mt-2">
                        Format: JPG, PNG, SVG. Ukuran maksimal: 5MB.
                      </p>
                    </>
                  ) : (
                    <>
                      <InputMultipage
                        label="Class Icon"
                        value={iconClass}
                        onChange={(e) => setIconClass(e.target.value)}
                        placeholder="Contoh: fa fa-code, bi bi-app, material-icons-work"
                      />
                      <p className="text-xs text-muted-foreground mt-2">
                        Gunakan class icon dari Font Awesome, Bootstrap Icons, atau Material Icons.
                      </p>
                    </>
                  )}
                </div>
              </FormSection>
            </div>
          </div>
        </DetailView>
      </form>
    </div>
  );
}