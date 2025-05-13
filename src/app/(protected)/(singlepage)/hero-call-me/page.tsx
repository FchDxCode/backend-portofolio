// src/app/(protected)/banner/hero-call-me/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useCallmeBanner } from '@/src/hook/banner/useCallmeBanner';
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

export default function HeroCallMePage() {
    const { banner, loading, saveBanner } = useCallmeBanner();
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
    
    // Handler untuk description (rich text editor)
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
        if (banner) {
            setTitle(banner.title || {});
            setSubtitle(banner.subtitle || {});
            setDescription(banner.description || {});
        }
    }, [banner]);

    // Handler untuk menyimpan data
    const handleSave = async () => {
        if (!banner || !banner?.id) {
            alert.error('Data banner tidak ditemukan');
            return;
        }
        
        try {
            setIsSaving(true);
            
            // Simpan data
            await saveBanner({
                id: banner.id,
                title: title,
                subtitle: subtitle,
                description: description
            });
            
            alert.success('Banner berhasil disimpan!');
        } catch (error) {
            console.error('Error saving data:', error);
            alert.error('Gagal menyimpan banner: ' + (error instanceof Error ? error.message : 'Unknown error'));
        } finally {
            setIsSaving(false);
        }
    };

    // Menampilkan loader saat memuat data
    if (isLoading) {
        return <PageLoader text="Memuat data Hero Call Me Banner..." />;
    }

    return (
        <div className="space-y-8">
            {/* Header dengan judul dan language switcher */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-border">
                <div>
                    <SectionTitle 
                        title="Hero Call Me Banner" 
                        subtitle="Kelola konten utama banner Call Me" 
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
                        <FormSection title="Informasi Banner">
                            {/* Title - Multilingual */}
                            <MultilingualInput
                                label="Judul Banner"
                                value={title[activeLanguage] || ''}
                                onChange={handleTitleChange}
                                language={activeLanguage}
                                placeholder={`Masukkan judul dalam bahasa ${activeLanguage === 'en' ? 'Inggris' : 'Indonesia'}`}
                            />
                            
                            {/* Subtitle - Multilingual */}
                            <MultilingualInput
                                label="Subjudul Banner"
                                value={subtitle[activeLanguage] || ''}
                                onChange={handleSubtitleChange}
                                language={activeLanguage}
                                placeholder={`Masukkan subjudul dalam bahasa ${activeLanguage === 'en' ? 'Inggris' : 'Indonesia'}`}
                            />
                            
                            {/* Description - Multilingual with Rich Text */}
                            <MultilingualTextarea
                                label="Deskripsi Banner"
                                value={description[activeLanguage] || ''}
                                onChange={handleDescriptionChange}
                                language={activeLanguage}
                                rows={5}
                                useRichText={true}
                            />
                        </FormSection>
                    </HeroCard>
                    
                    {/* Note about Items */}
                    <div className="bg-muted/30 border rounded-lg p-4">
                        <h3 className="text-sm font-medium mb-2">Catatan</h3>
                        <p className="text-xs text-muted-foreground">
                            Bagian ini hanya untuk pengaturan banner utama. Untuk mengelola item-item kontak yang ditampilkan di banner, silahkan gunakan halaman "Item Call Me".
                        </p>
                    </div>
                    
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
                            <h3 className="text-lg font-medium">Preview Banner</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                                Tampilan Hero Call Me Banner
                            </p>
                        </div>
                        
                        <div className="p-6">
                            {/* Preview Banner */}
                            <div className="rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 p-6 border border-primary/20 shadow-sm">
                                <div className="space-y-4">
                                    <h3 className="text-xl font-bold text-primary">
                                        {title[activeLanguage] || 'Judul Call Me Banner'}
                                    </h3>
                                    
                                    <h4 className="text-base font-medium">
                                        {subtitle[activeLanguage] || 'Subjudul Call Me Banner'}
                                    </h4>
                                    
                                    <div className="text-sm text-muted-foreground prose-sm prose max-w-none">
                                        {description[activeLanguage] ? (
                                            <div dangerouslySetInnerHTML={{ __html: description[activeLanguage] }} />
                                        ) : (
                                            <p>Deskripsi banner akan ditampilkan di sini...</p>
                                        )}
                                    </div>
                                    
                                    <div className="pt-2 mb-2 border-b border-dashed border-muted pb-4">
                                        <p className="text-xs text-muted-foreground">Item kontak akan ditampilkan di sini (dikelola di halaman terpisah)</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="mt-4 text-xs text-muted-foreground">
                                <p>Banner ini akan ditampilkan di halaman kontak. Item-item kontak dapat ditambahkan melalui halaman pengelolaan item.</p>
                            </div>
                        </div>
                    </HeroCard>
                </div>
            </div>
        </div>
    );
}