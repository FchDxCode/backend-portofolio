"use client";

import { useState, useEffect } from "react";
import { useContact } from "@/src/hook/contact/useContact";
import { useMultilingualForm } from "@/src/utils/client/Multilingual";
import { MinLoadingTime } from "@/src/utils/client/MinLoadingTime";
import { LanguageSwitcher } from "@/src/components/ui/multilingual/LanguageSwitcher";
import { MultilingualInput } from "@/src/components/ui/multilingual/MultilingualInput";
import { MultilingualTextarea } from "@/src/components/ui/multilingual/MultilingualTextArea";
import { useAlert } from "@/src/components/ui/alert/AlertProvider";
import { PageLoader } from "@/src/components/ui/Loader";

// singleton
import HeroCard from "@/src/components/singleton/HeroCard";
import SectionTitle from "@/src/components/singleton/SectionTitle";
import FormSection from "@/src/components/singleton/FormSection";
import SaveButton from "@/src/components/singleton/SaveButton";

export default function ContactPage() {
  /* ------------------------------------------------------------------ */
  /* state & hooks                                                      */
  /* ------------------------------------------------------------------ */
  const { contact, loading, saveContact } = useContact();

  // objek multibahasa → konsisten dg CTA page
  const [email, setEmail] = useState<Record<string, any>>({});
  const [phone, setPhone] = useState<Record<string, any>>({});
  const [location, setLocation] = useState<Record<string, any>>({});

  const [isSaving, setIsSaving] = useState(false);
  const isLoading = MinLoadingTime(loading, 2000);

  const {
    activeLanguage,
    setActiveLanguage,
    languages,
    createFieldHandler,
  } = useMultilingualForm();

  const alert = useAlert();

  /* ------------------------------------------------------------------ */
  /* handlers                                                           */
  /* ------------------------------------------------------------------ */
  const handleEmailChange = createFieldHandler(setEmail);
  const handlePhoneChange = createFieldHandler(setPhone);

  const handleLocationChange = (
    e: React.ChangeEvent<HTMLTextAreaElement> | string
  ) => {
    const value = typeof e === "string" ? e : e.target.value;
    setLocation((prev) => ({
      ...prev,
      [activeLanguage]: value,
    }));
  };

  /* ------------------------------------------------------------------ */
  /* load data                                                          */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    if (!contact) return;

    // backend string → bungkus objek multibahasa
    setEmail(
      contact.email ? { [activeLanguage]: contact.email } : {}
    );
    setPhone(
      contact.no_phone ? { [activeLanguage]: contact.no_phone } : {}
    );

    // langsung objek
    setLocation(contact.location ?? {});
  }, [contact, activeLanguage]);

  /* ------------------------------------------------------------------ */
  /* save                                                               */
  /* ------------------------------------------------------------------ */
  const handleSave = async () => {
    if (!contact?.id) {
      alert.error("Data Contact tidak ditemukan");
      return;
    }

    try {
      setIsSaving(true);

      await saveContact({
        id: contact.id,
        // email & phone = string (model)
        email: email[activeLanguage] || "",
        no_phone: phone[activeLanguage] || "",
        // location = objek multibahasa (model)
        location: location,
      });

      alert.success("Data berhasil disimpan!");
    } catch (err) {
      console.error(err);
      alert.error(
        "Gagal menyimpan data: " +
          (err instanceof Error ? err.message : "Unknown error")
      );
    } finally {
      setIsSaving(false);
    }
  };

  /* ------------------------------------------------------------------ */
  /* ui                                                                 */
  /* ------------------------------------------------------------------ */
  if (isLoading) return <PageLoader text="Memuat data kontak..." />;

  return (
    <div className="space-y-8">
      {/* header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-border">
        <SectionTitle
          title="Pengaturan Kontak"
          subtitle="Kelola informasi kontak pada website"
        />

        <LanguageSwitcher
          activeLanguage={activeLanguage}
          languages={languages}
          onLanguageChange={setActiveLanguage}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ------------------------ form -------------------------------- */}
        <div className="lg:col-span-2 space-y-8">
          {/* info kontak */}
          <HeroCard className="p-6">
            <FormSection title="Informasi Kontak">
              {/* email */}
              <MultilingualInput
                label="Email"
                value={email[activeLanguage] || ""}
                onChange={handleEmailChange}
                language={activeLanguage}
                placeholder="email@example.com"
              />

              {/* phone */}
              <MultilingualInput
                label="Nomor Telepon"
                value={phone[activeLanguage] || ""}
                onChange={handlePhoneChange}
                language={activeLanguage}
                placeholder="+628123456789"
              />
            </FormSection>
          </HeroCard>

          {/* lokasi */}
          <HeroCard className="p-6">
            <FormSection title="Lokasi">
              <MultilingualTextarea
                label="Alamat"
                value={location[activeLanguage] || ""}
                onChange={handleLocationChange}
                language={activeLanguage}
                rows={5}
                useRichText={true}
              />
            </FormSection>
          </HeroCard>

          {/* save */}
          <div className="flex justify-end">
            <SaveButton onClick={handleSave} isLoading={isSaving} />
          </div>
        </div>

        {/* ------------------------ preview ----------------------------- */}
        <div>
          <HeroCard className="sticky top-24">
            <div className="p-6 border-b border-border">
              <h3 className="text-lg font-medium">Preview Kontak</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Tampilan informasi kontak
              </p>
            </div>

            <div className="p-6">
              <div className="rounded-lg border bg-primary/5 p-6 shadow-sm">
                <div className="space-y-4">
                  {/* email */}
                  <div className="flex items-center gap-2">
                    <MailIcon />
                    <p className="text-sm font-medium">
                      {email[activeLanguage] || "email@example.com"}
                    </p>
                  </div>

                  {/* phone */}
                  <div className="flex items-center gap-2">
                    <PhoneIcon />
                    <p className="text-sm font-medium">
                      {phone[activeLanguage] || "+628123456789"}
                    </p>
                  </div>

                  {/* location */}
                  <div className="flex items-start gap-2">
                    <LocationIcon />
                    <div className="text-sm text-muted-foreground prose-sm prose">
                      {location[activeLanguage] ? (
                        <div
                          dangerouslySetInnerHTML={{
                            __html: location[activeLanguage],
                          }}
                        />
                      ) : (
                        <p>Jl. Contoh No. 123, Kota, Negara</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <p className="mt-4 text-xs text-muted-foreground">
                Informasi kontak ini akan ditampilkan di halaman kontak
                website Anda.
              </p>
            </div>
          </HeroCard>
        </div>
      </div>
    </div>
  );
}

/* ---------------- ikon kecil -------------------------------------- */
function MailIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-primary"
    >
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-primary"
    >
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-primary mt-1"
    >
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}
