"use client";

import { useState, useEffect } from 'react';
import { useHomeHero } from '@/src/hook/useHomeHero';

// Import komponen singleton
import HeroCard from '@/src/components/singleton/HeroCard';
import SectionTitle from '@/src/components/singleton/SectionTitle';
import FormSection from '@/src/components/singleton/FormSection';
import ImagePreview from '@/src/components/singleton/ImagePreview';
import SaveButton from '@/src/components/singleton/SaveButton';
import FileUpload from '@/src/components/singleton/FileUpload';
import { useMultilingualForm } from '@/src/utils/client/Multilingual';
import { LanguageSwitcher } from '@/src/components/ui/multilingual/LanguageSwitcher';
import { MultilingualInput } from '@/src/components/ui/multilingual/MultilingualInput';
import { MultilingualTextarea } from '@/src/components/ui/multilingual/MultilingualTextArea';
import { useAlert } from '@/src/components/ui/alert/AlertProvider';
import { PageLoader } from '@/src/components/ui/Loader';

export default function HomeHero() {
    const { hero, loading, saveHero, updateImage } = useHomeHero();
    const [title, setTitle] = useState<Record<string, any>>({});
    const [subtitle, setSubtitle] = useState<Record<string, any>>({});
    const [description, setDescription] = useState<Record<string, any>>({});
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [preview, setPreview] = useState<string>('');
    const [isSaving, setIsSaving] = useState(false);
    
    const { 
      activeLanguage, 
      setActiveLanguage, 
      languages,
      createFieldHandler 
    } = useMultilingualForm();

    const alert = useAlert();

    // Buat handler untuk setiap field
    const handleTitleChange = createFieldHandler(setTitle);
    const handleSubtitleChange = createFieldHandler(setSubtitle);
    
    const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement> | string) => {
        if (typeof e === 'string') {
          // Handle TipTap HTML string
          setDescription(prev => ({
            ...prev,
            [activeLanguage]: e
          }));
        } else {
          // Handle textarea event
          const value = e.target.value;
          setDescription(prev => ({
            ...prev,
            [activeLanguage]: value
          }));
        }
    };

    // Load data when component mounts
    useEffect(() => {
        if (hero) {
            console.log("Data hero yang diterima:", hero); // Untuk debugging
            
            // Pastikan format data sesuai dengan yang diharapkan
            // Jika description adalah string, konversi ke objek
            if (typeof hero.description === 'string') {
                try {
                    // Coba parse jika JSON string
                    const parsedDesc = JSON.parse(hero.description);
                    setDescription(parsedDesc || {});
                } catch (e) {
                    // Jika bukan JSON valid, gunakan sebagai string bahasa default
                    setDescription({ [activeLanguage]: hero.description });
                }
            } else {
                // Gunakan seperti biasa jika sudah objek
                setDescription(hero.description || {});
            }
            
            // Lakukan hal yang sama untuk field lainnya jika perlu
            if (typeof hero.title === 'string') {
                try {
                    setTitle(JSON.parse(hero.title) || {});
                } catch (e) {
                    setTitle({ [activeLanguage]: hero.title });
                }
            } else {
                setTitle(hero.title || {});
            }
            
            if (typeof hero.subtitle === 'string') {
                try {
                    setSubtitle(JSON.parse(hero.subtitle) || {});
                } catch (e) {
                    setSubtitle({ [activeLanguage]: hero.subtitle });
                }
            } else {
                setSubtitle(hero.subtitle || {});
            }
            
            setPreview(hero.image || '');
        }
    }, [hero, activeLanguage]);

    // Preview selected image
    useEffect(() => {
        if (!selectedImage) return;
        const objectUrl = URL.createObjectURL(selectedImage);
        setPreview(objectUrl);
        
        return () => URL.revokeObjectURL(objectUrl);
    }, [selectedImage]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        setSelectedImage(e.target.files[0]);
    };

    const handleSave = async () => {
        if (!hero) return;
        
        try {
            setIsSaving(true);
            
            // Pastikan data dalam format yang benar sebelum disimpan
            // Log data yang akan disimpan untuk debugging
            console.log("Data yang akan disimpan:", {
                title, subtitle, description
            });
            
            // Save all text data in one call
            await saveHero({
                id: hero.id,
                title: title,
                subtitle: subtitle,
                description: description,
            });
            
            // Update image separately if needed
            if (selectedImage) {
                await updateImage(hero.id, selectedImage);
                setSelectedImage(null);
            }
            
            alert.success('Data berhasil disimpan!');
        } catch (error) {
            console.error('Error saving data:', error);
            alert.warning('Gagal menyimpan data: ' + (error instanceof Error ? error.message : 'Unknown error'));
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) {
        return <PageLoader text="Memuat konten..." />;
    }

    return (
        <div className="space-y-8">
            {/* Header with breadcrumb and language switcher */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-border">
                <div>
                    <SectionTitle 
                        title="Pengaturan Hero Halaman Utama" 
                        subtitle="Kelola konten hero section pada halaman utama website" 
                    />
                </div>
                <LanguageSwitcher
                    activeLanguage={activeLanguage}
                    languages={languages}
                    onLanguageChange={setActiveLanguage}
                />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form Section */}
                <div className="lg:col-span-2 space-y-8">
                    <HeroCard className="p-6">
                        <FormSection title="Informasi Utama">
                            <MultilingualInput
                                label="Judul"
                                value={title[activeLanguage] || ''}
                                onChange={handleTitleChange}
                                language={activeLanguage}
                            />
                            
                            <MultilingualInput
                                label="Subjudul"
                                value={subtitle[activeLanguage] || ''}
                                onChange={handleSubtitleChange}
                                language={activeLanguage}
                            />
                        </FormSection>
                    </HeroCard>
                    
                    <HeroCard className="p-6">
                        <FormSection title="Deskripsi">
                            <MultilingualTextarea
                                label="Deskripsi Hero"
                                value={description[activeLanguage] || ''}
                                onChange={handleDescriptionChange}
                                language={activeLanguage}
                                rows={6}
                                useRichText={true}
                            />
                        </FormSection>
                    </HeroCard>
                    
                    {/* Save Button Section */}
                    <div className="flex justify-end">
                        <SaveButton 
                            onClick={handleSave} 
                            isLoading={isSaving} 
                        />
                    </div>
                </div>
                
                {/* Preview Section */}
                <div>
                    <HeroCard className="sticky top-24">
                        <div className="p-6 border-b border-border">
                            <h3 className="text-lg font-medium">Gambar Hero</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                                Gambar untuk ditampilkan di hero section halaman utama
                            </p>
                        </div>
                        
                        <div className="p-6 space-y-6">
                            <ImagePreview 
                                src={preview} 
                                alt="Hero Preview" 
                            />
                            
                            <div className="pt-4">
                                <FileUpload
                                    label="Unggah Gambar Hero"
                                    onChange={handleImageChange}
                                    accept="image/*"
                                />
                            </div>
                            
                            <div className="pt-2">
                                <div className="text-xs text-muted-foreground">
                                    <ul className="list-disc pl-4 space-y-1">
                                        <li>Ukuran yang disarankan: 1920×1080 piksel</li>
                                        <li>Format yang didukung: JPG, PNG, WebP</li>
                                        <li>Ukuran maksimum: 2MB</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </HeroCard>
                </div>
            </div>
        </div>
    );
}