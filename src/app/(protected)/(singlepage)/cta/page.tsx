// src/app/(protected)/cta/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useCallToAction } from '@/src/hook/banner/useCallToAction';
import { useMultilingualForm } from '@/src/utils/client/Multilingual';
import { MinLoadingTime } from '@/src/utils/client/MinLoadingTime';
import { LanguageSwitcher } from '@/src/components/ui/multilingual/LanguageSwitcher';
import { MultilingualInput } from '@/src/components/ui/multilingual/MultilingualInput';
import { MultilingualTextarea } from '@/src/components/ui/multilingual/MultilingualTextArea';
import { useAlert } from '@/src/components/ui/alert/AlertProvider';
import { PageLoader } from '@/src/components/ui/Loader';

// Import komponen singleton
import HeroCard from '@/src/components/singleton/HeroCard';
import SectionTitle from '@/src/components/singleton/SectionTitle';
import FormSection from '@/src/components/singleton/FormSection';
import SaveButton from '@/src/components/singleton/SaveButton';

export default function CtaPage() {
    const { cta, loading, saveCta } = useCallToAction();
    const [title, setTitle] = useState<Record<string, any>>({});
    const [subtitle, setSubtitle] = useState<Record<string, any>>({});
    const [description, setDescription] = useState<Record<string, any>>({});
    const [isSaving, setIsSaving] = useState(false);
    
    // Gunakan MinLoadingTime untuk durasi loading minimal 2 detik
    const isLoading = MinLoadingTime(loading, 2000);
    
    // Untuk multilingual
    const { 
        activeLanguage, 
        setActiveLanguage, 
        languages,
        createFieldHandler 
    } = useMultilingualForm();

    // Alert untuk notifikasi
    const alert = useAlert();

    // Handler untuk field multilingual
    const handleTitleChange = createFieldHandler(setTitle);
    const handleSubtitleChange = createFieldHandler(setSubtitle);
    
    // Handler untuk description (text area rich editor)
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

    // Load data saat komponen mount
    useEffect(() => {
        if (cta) {
            setTitle(cta.title || {});
            setSubtitle(cta.subtitle || {});
            setDescription(cta.description || {});
        }
    }, [cta]);

    // Handler untuk menyimpan data
    const handleSave = async () => {
        if (!cta || !cta?.id) {
            alert.error('Data CTA tidak ditemukan');
            return;
        }
        
        try {
            setIsSaving(true);
            
            // Simpan data
            await saveCta({
                id: cta.id,
                title: title,
                subtitle: subtitle,
                description: description
            });
            
            alert.success('Data berhasil disimpan!');
        } catch (error) {
            console.error('Error saving data:', error);
            alert.error('Gagal menyimpan data: ' + (error instanceof Error ? error.message : 'Unknown error'));
        } finally {
            setIsSaving(false);
        }
    };

    // Menampilkan loader saat memuat data
    if (isLoading) {
        return <PageLoader text="Memuat data Call To Action..." />;
    }

    return (
        <div className="space-y-8">
            {/* Header dengan judul dan language switcher */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-border">
                <div>
                    <SectionTitle 
                        title="Pengaturan Call To Action" 
                        subtitle="Kelola bagian ajakan pada halaman portofolio" 
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
                        <FormSection title="Informasi CTA">
                            {/* Title - Multilingual */}
                            <MultilingualInput
                                label="Judul CTA"
                                value={title[activeLanguage] || ''}
                                onChange={handleTitleChange}
                                language={activeLanguage}
                                placeholder={`Masukkan judul dalam bahasa ${activeLanguage === 'en' ? 'Inggris' : 'Indonesia'}`}
                            />
                            
                            {/* Subtitle - Multilingual */}
                            <MultilingualInput
                                label="Subjudul CTA"
                                value={subtitle[activeLanguage] || ''}
                                onChange={handleSubtitleChange}
                                language={activeLanguage}
                                placeholder={`Masukkan subjudul dalam bahasa ${activeLanguage === 'en' ? 'Inggris' : 'Indonesia'}`}
                            />
                            
                            {/* Description - Multilingual with Rich Text */}
                            <MultilingualTextarea
                                label="Deskripsi CTA"
                                value={description[activeLanguage] || ''}
                                onChange={handleDescriptionChange}
                                language={activeLanguage}
                                rows={5}
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
                            <h3 className="text-lg font-medium">Preview CTA</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                                Tampilan bagian Call To Action
                            </p>
                        </div>
                        
                        <div className="p-6">
                            {/* Preview CTA */}
                            <div className="rounded-lg border bg-primary/5 p-6 shadow-sm">
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-primary">
                                        {title[activeLanguage] || 'Judul Call To Action'}
                                    </h3>
                                    
                                    <h4 className="text-base font-medium">
                                        {subtitle[activeLanguage] || 'Subjudul Call To Action'}
                                    </h4>
                                    
                                    <div className="text-sm text-muted-foreground prose-sm prose">
                                        {description[activeLanguage] ? (
                                            <div dangerouslySetInnerHTML={{ __html: description[activeLanguage] }} />
                                        ) : (
                                            <p>Deskripsi call to action akan ditampilkan di sini...</p>
                                        )}
                                    </div>
                                    
                                    <div className="pt-2">
                                        <button className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors">
                                            Hubungi Sekarang
                                        </button>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="mt-4 text-xs text-muted-foreground">
                                <p>Bagian CTA ini akan ditampilkan di bagian bawah halaman portofolio Anda.</p>
                            </div>
                        </div>
                    </HeroCard>
                </div>
            </div>
        </div>
    );
}