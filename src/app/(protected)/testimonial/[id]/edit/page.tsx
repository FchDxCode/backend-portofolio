"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation"; // Pastikan untuk import useParams
import { PageHeader } from "@/src/components/multipage/PageHeader";
import { Button } from "@/src/components/multipage/Button";
import { FormSection } from "@/src/components/multipage/FormSection";
import { DetailView } from "@/src/components/multipage/DetailView";
import { ImageUpload } from "@/src/components/multipage/ImageUpload";
import { InputMultipage } from "@/src/components/multipage/InputMultipage";
import { DropdownMultipage } from "@/src/components/multipage/DropdownMultipage";
import { useTestimonials } from "@/src/hook/services/useTestimonial";
import { createClient } from "@/src/utils/supabase/client";
import { Testimonial } from "@/src/models/ServiceModels";

export default function TestimonialEditPage() {
  const router = useRouter();
  const { id } = useParams(); // Mengambil id dari URL parameter
  const testimonialId = Number(id); // Pastikan ID diubah ke number jika perlu

  const { getTestimonialById, updateTestimonial } = useTestimonials();
  
  const [testimonial, setTestimonial] = useState<Testimonial | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<"id" | "en">("id");

  // Form state
  const [name, setName] = useState("");
  const [jobId, setJobId] = useState("");
  const [jobEn, setJobEn] = useState("");
  const [star, setStar] = useState<number>(5);
  const [projectNameId, setProjectNameId] = useState("");
  const [projectNameEn, setProjectNameEn] = useState("");
  const [industryId, setIndustryId] = useState("");
  const [industryEn, setIndustryEn] = useState("");
  const [year, setYear] = useState<number | "">("");
  const [messageId, setMessageId] = useState("");
  const [messageEn, setMessageEn] = useState("");
  const [categoryId, setCategoryId] = useState<number | string>("");

  useEffect(() => {
    const fetchCategories = async () => {
      setCategoriesLoading(true);
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("testimonial_categories")
          .select("id,title")
          .order("title");
        if (error) throw error;
        setCategories(data || []);
      } catch (err) {
        console.error("Error fetching categories:", err);
      } finally {
        setCategoriesLoading(false);
      }
    };

    const fetchTestimonial = async () => {
      try {
        const fetchedTestimonial = await getTestimonialById(testimonialId);
        if (fetchedTestimonial) {
          setTestimonial(fetchedTestimonial);
          setName(fetchedTestimonial.name || "");
          setJobId(fetchedTestimonial.job?.id || "");
          setJobEn(fetchedTestimonial.job?.en || "");
          setStar(fetchedTestimonial.star || 5);
          setProjectNameId(fetchedTestimonial.project?.id || "");
          setProjectNameEn(fetchedTestimonial.project?.en || "");
          setIndustryId(fetchedTestimonial.industry?.id || "");
          setIndustryEn(fetchedTestimonial.industry?.en || "");
          setYear(fetchedTestimonial.year || "");
          setMessageId(fetchedTestimonial.message?.id || "");
          setMessageEn(fetchedTestimonial.message?.en || "");
          setCategoryId(fetchedTestimonial.testimonial_category_id || "");
        }
      } catch (err) {
        console.error("Error fetching testimonial:", err);
      }
    };
    fetchCategories();
    fetchTestimonial();
  }, [testimonialId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      const payload: Omit<Testimonial, "id" | "created_at" | "updated_at"> = {
        name,
        job: { id: jobId, en: jobEn },
        star,
        project: { id: projectNameId, en: projectNameEn },
        industry: { id: industryId, en: industryEn },
        year: year === "" ? undefined : Number(year),
        message: { id: messageId, en: messageEn },
        testimonial_category_id:
          categoryId === "" ? undefined : Number(categoryId),
      };
      await updateTestimonial(testimonialId, payload, profileImage || undefined);
      router.push("/testimonial");
    } catch (err) {
      console.error("Error updating testimonial:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat menyimpan testimonial"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const starOptions = [
    { value: 1, label: "⭐" },
    { value: 2, label: "⭐⭐" },
    { value: 3, label: "⭐⭐⭐" },
    { value: 4, label: "⭐⭐⭐⭐" },
    { value: 5, label: "⭐⭐⭐⭐⭐" },
  ];

  const categoryOptions = categories.map((c) => ({
    value: c.id,
    label:
      typeof c.title === "string"
        ? c.title
        : c.title.id ??
          c.title.en ??
          `Kategori ${c.id}`,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Testimonial"
        backUrl="/testimonial"
        actions={
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button
              variant="primary"
              type="submit"
              form="testimonial-form"
              isLoading={isSubmitting}
            >
              Simpan
            </Button>
          </div>
        }
      />

      {error && (
        <div className="p-3 text-sm bg-destructive/10 text-destructive rounded">
          {error}
        </div>
      )}

      {testimonial && (
        <form
          id="testimonial-form"
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          <DetailView>
            <div className="grid md:grid-cols-3 gap-6">
              {/* Main column */}
              <div className="md:col-span-2 space-y-6">
                {/* Language Tabs */}
                <div className="flex border-b">
                  <button
                    type="button"
                    onClick={() => setActiveTab("id")}
                    className={`py-2 px-4 ${
                      activeTab === "id"
                        ? "border-b-2 border-primary font-medium text-primary"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Indonesia
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("en")}
                    className={`py-2 px-4 ${
                      activeTab === "en"
                        ? "border-b-2 border-primary font-medium text-primary"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    English
                  </button>
                </div>

                {/* Basic Info */}
                <FormSection title="Informasi Dasar">
                  <InputMultipage
                    label="Nama"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nama klien"
                    required
                  />

                  {activeTab === "id" ? (
                    <InputMultipage
                      label="Posisi/Jabatan (ID)"
                      value={jobId}
                      onChange={(e) => setJobId(e.target.value)}
                      placeholder="Jabatan dalam Bahasa Indonesia"
                      language="id"
                    />
                  ) : (
                    <InputMultipage
                      label="Position/Title (EN)"
                      value={jobEn}
                      onChange={(e) => setJobEn(e.target.value)}
                      placeholder="Position in English"
                      language="en"
                    />
                  )}

                  {activeTab === "id" ? (
                    <InputMultipage
                      label="Testimonial (ID)"
                      value={messageId}
                      onChange={(e) => setMessageId(e.target.value)}
                      placeholder="Testimonial dalam Bahasa Indonesia"
                      language="id"
                      multiline
                      rows={4}
                      required
                    />
                  ) : (
                    <InputMultipage
                      label="Testimonial (EN)"
                      value={messageEn}
                      onChange={(e) => setMessageEn(e.target.value)}
                      placeholder="Testimonial in English"
                      language="en"
                      multiline
                      rows={4}
                    />
                  )}
                </FormSection>

                {/* Project & Details */}
                <FormSection title="Detail Proyek & Lain-lain">
                  <div className="grid md:grid-cols-2 gap-4">
                    {activeTab === "id" ? (
                      <InputMultipage
                        label="Nama Proyek (ID)"
                        value={projectNameId}
                        onChange={(e) => setProjectNameId(e.target.value)}
                        placeholder="Nama proyek (ID)"
                        language="id"
                      />
                    ) : (
                      <InputMultipage
                        label="Project Name (EN)"
                        value={projectNameEn}
                        onChange={(e) => setProjectNameEn(e.target.value)}
                        placeholder="Project name (EN)"
                        language="en"
                      />
                    )}

                    <DropdownMultipage
                      label="Rating"
                      options={starOptions}
                      value={star}
                      onChange={(v) => setStar(Number(v))}
                      placeholder="Pilih rating"
                    />

                    {activeTab === "id" ? (
                      <InputMultipage
                        label="Industri (ID)"
                        value={industryId}
                        onChange={(e) => setIndustryId(e.target.value)}
                        placeholder="Industri dalam Bahasa Indonesia"
                        language="id"
                      />
                    ) : (
                      <InputMultipage
                        label="Industry (EN)"
                        value={industryEn}
                        onChange={(e) => setIndustryEn(e.target.value)}
                        placeholder="Industry in English"
                        language="en"
                      />
                    )}

                    <InputMultipage
                      label="Tahun"
                      type="number"
                      value={year === "" ? "" : String(year)}
                      onChange={(e) => {
                        const v = e.target.value;
                        if (v === "" || /^\d+$/.test(v)) {
                          setYear(v === "" ? "" : Number(v));
                        }
                      }}
                      placeholder="Masukkan tahun"
                    />

                    <DropdownMultipage
                      label="Kategori"
                      options={categoryOptions}
                      value={categoryId}
                      onChange={(v) => {
                        if (Array.isArray(v)) {
                          setCategoryId(v[0] || "");
                        } else {
                          setCategoryId(v);
                        }
                      }}
                      placeholder={
                        categoriesLoading ? "Memuat kategori..." : "Pilih kategori"
                      }
                    />
                  </div>
                </FormSection>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                <FormSection title="Foto Profil">
                  <ImageUpload
                    label="Foto Profil"
                    description="JPG/PNG, maks 5MB"
                    value={profileImage}
                    onChange={(files: File | File[]) => {
                      const file = Array.isArray(files) ? files[0] : files;
                      setProfileImage(file instanceof File ? file : null);
                    }}
                    maxSize={5}
                    aspectRatio="square"
                    previewSize="medium"
                  />
                </FormSection>

                <FormSection title="Tips">
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>• Gunakan foto profil berkualitas tinggi.</p>
                    <p>• Isi testimonial dalam kedua bahasa untuk jangkauan luas.</p>
                    <p>• Tahun dan industri membantu pengelompokan.</p>
                  </div>
                </FormSection>
              </div>
            </div>
          </DetailView>
        </form>
      )}
    </div>
  );
}
