"use client";

import { useState, useEffect } from 'react';
import { useAbout } from '@/src/hook/useAbout';

// Import komponen kustom
import HeroCard from '@/src/components/about/HeroCard';
import SectionTitle from '@/src/components/about/SectionTitle';
import FormSection from '@/src/components/about/FormSection';
import ImagePreview from '@/src/components/about/ImagePreview';
import SaveButton from '@/src/components/about/SaveButton';
import FileUpload from '@/src/components/about/FileUpload';
import { useMultilingualForm } from '@/src/utils/client/Multilingual';
import { LanguageSwitcher } from '@/src/components/ui/multilingual/LanguageSwitcher';
import { MultilingualInput } from '@/src/components/ui/multilingual/MultilingualInput';
import { MultilingualTextarea } from '@/src/components/ui/multilingual/MultilingualTextArea';
import { useAlert } from '@/src/components/ui/alert/AlertProvider';

export default function AboutHero() {
    const { about, loading, saveAbout, updateImage } = useAbout();
    const [title, setTitle] = useState<Record<string, any>>({});
    const [subtitle, setSubtitle] = useState<Record<string, any>>({});
    const [description, setDescription] = useState<Record<string, any>>({});
    const [titleImage, setTitleImage] = useState<Record<string, any>>({});
    const [subtitleImage, setSubtitleImage] = useState<Record<string, any>>({});
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

    const handleTitleChange = createFieldHandler(setTitle);
    const handleSubtitleChange = createFieldHandler(setSubtitle);
    const handleTitleImageChange = createFieldHandler(setTitleImage);
    const handleSubtitleImageChange = createFieldHandler(setSubtitleImage);
    
    const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement> | string) => {
        if (typeof e === 'string') {
          setDescription(prev => ({
            ...prev,
            [activeLanguage]: e
          }));
        } else {
          const value = e.target.value;
          setDescription(prev => ({
            ...prev,
            [activeLanguage]: value
          }));
        }
      };

    useEffect(() => {
        if (about) {
            setTitle(about.title || {});
            setSubtitle(about.subtitle || {});
            setDescription(about.description || {});
            setTitleImage(about.title_image || {});
            setSubtitleImage(about.subtitle_image || {});
            setPreview(about.image || '');
        }
    }, [about]);

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
        if (!about) return;
        
        try {
            setIsSaving(true);
            
            await saveAbout({
                id: about.id,
                title: title,
                subtitle: subtitle,
                description: description,
                title_image: titleImage,
                subtitle_image: subtitleImage
            });
            
            if (selectedImage) {
                await updateImage(about.id, selectedImage);
                setSelectedImage(null);
            }
            
            alert.success('Data berhasil disimpan!');
        } catch (error) {
            console.error('Error saving data:', error);
            alert.error('Gagal menyimpan data: ' + (error instanceof Error ? error.message : 'Unknown error'));
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center">
                    <div className="h-12 w-12 border-4 border-t-primary rounded-full animate-spin mb-4"></div>
                    <p className="text-muted-foreground">Memuat data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-border">
                <div>
                    <SectionTitle 
                        title="Pengaturan Hero Halaman About" 
                        subtitle="Kelola konten hero section pada halaman About" 
                    />
                </div>
                <LanguageSwitcher
                    activeLanguage={activeLanguage}
                    languages={languages}
                    onLanguageChange={setActiveLanguage}
                />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
                                label="Teks Gambar Judul"
                                value={titleImage[activeLanguage] || ''}
                                onChange={handleTitleImageChange}
                                language={activeLanguage}
                            />
                            
                            <MultilingualInput
                                label="Subjudul"
                                value={subtitle[activeLanguage] || ''}
                                onChange={handleSubtitleChange}
                                language={activeLanguage}
                            />
                            
                            <MultilingualInput
                                label="Teks Gambar Subjudul"
                                value={subtitleImage[activeLanguage] || ''}
                                onChange={handleSubtitleImageChange}
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
                    
                    <div className="flex justify-end">
                        <SaveButton 
                            onClick={handleSave} 
                            isLoading={isSaving} 
                        />
                    </div>
                </div>
                
                <div>
                    <HeroCard className="sticky top-24">
                        <div className="p-6 border-b border-border">
                            <h3 className="text-lg font-medium">Gambar Hero</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                                Gambar untuk ditampilkan di hero section
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
                                        <li>Ukuran yang disarankan: 1920×768 piksel</li>
                                        <li>Format yang didukung: JPG, PNG, WebP</li>
                                        <li>Ukuran maksimum: 5MB</li>
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