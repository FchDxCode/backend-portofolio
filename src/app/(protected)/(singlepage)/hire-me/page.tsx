// src/app/(protected)/hire-me/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useHireMeBanner } from '@/src/hook/banner/useHireMeBanner';
import { useMultilingualForm } from '@/src/utils/client/Multilingual';
import { MinLoadingTime } from '@/src/utils/client/MinLoadingTime';
import { LanguageSwitcher } from '@/src/components/ui/multilingual/LanguageSwitcher';
import { MultilingualInput } from '@/src/components/ui/multilingual/MultilingualInput';
import { useAlert } from '@/src/components/ui/alert/AlertProvider';
import { PageLoader, ButtonLoader } from '@/src/components/ui/Loader';

// Import komponen singleton
import HeroCard from '@/src/components/singleton/HeroCard';
import SectionTitle from '@/src/components/singleton/SectionTitle';
import FormSection from '@/src/components/singleton/FormSection';
import SaveButton from '@/src/components/singleton/SaveButton';

export default function HireMePage() {
    const { banner, loading, saveBanner } = useHireMeBanner();
    const [title, setTitle] = useState<Record<string, any>>({});
    const [freeDate, setFreeDate] = useState<string>('');
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

    // Handler untuk title multilingual
    const handleTitleChange = createFieldHandler(setTitle);

    // Load data saat komponen mount
    useEffect(() => {
        if (banner) {
            setTitle(banner.title || {});
            setFreeDate(banner.free_date || '');
        }
    }, [banner]);

    // Handler untuk menyimpan data
    const handleSave = async () => {
        if (!banner || !banner.id) {
            alert.error('Data banner tidak ditemukan');
            return;
        }
        
        try {
            setIsSaving(true);
            
            // Simpan data
            await saveBanner({
                id: banner.id,
                title: title,
                free_date: freeDate
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
        return <PageLoader text="Memuat data Hire Me Banner..." />;
    }

    return (
        <div className="space-y-8">
            {/* Header dengan judul dan language switcher */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-border">
                <div>
                    <SectionTitle 
                        title="Pengaturan Hire Me Banner" 
                        subtitle="Kelola informasi ketersediaan untuk direkrut" 
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
                            
                            {/* Date Picker */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-2">Tanggal Tersedia</label>
                                <input
                                    type="date"
                                    value={freeDate}
                                    onChange={(e) => setFreeDate(e.target.value)}
                                    className="w-full rounded-md border border-input bg-background p-3 text-sm focus:border-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring transition-all duration-200"
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                    Tanggal Anda tersedia untuk direkrut
                                </p>
                            </div>
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
                            <h3 className="text-lg font-medium">Preview Banner</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                                Tampilan banner ketersediaan
                            </p>
                        </div>
                        
                        <div className="p-6">
                            {/* Preview Banner */}
                            <div className="rounded-lg border bg-card p-4 shadow-sm">
                                <div className="space-y-2">
                                    <h4 className="font-semibold">
                                        {title[activeLanguage] || 'Tersedia untuk direkrut'}
                                    </h4>
                                    
                                    <div className="flex items-center text-sm">
                                        <span className="inline-block w-3 h-3 rounded-full bg-green-500 mr-2"></span>
                                        <span>
                                            {freeDate 
                                                ? `Tersedia mulai: ${new Date(freeDate).toLocaleDateString()}`
                                                : 'Tanggal belum ditentukan'}
                                        </span>
                                    </div>
                                    
                                    <div className="pt-2">
                                        <button className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                                            Kontak Saya
                                        </button>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="mt-4 text-xs text-muted-foreground">
                                <p>Banner ini akan ditampilkan di halaman portofolio Anda untuk memberi tahu pengunjung tentang ketersediaan Anda.</p>
                            </div>
                        </div>
                    </HeroCard>
                </div>
            </div>
        </div>
    );
}