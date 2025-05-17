"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/src/components/multipage/PageHeader";
import { Button } from "@/src/components/multipage/Button";
import { FormSection } from "@/src/components/multipage/FormSection";
import { DetailView } from "@/src/components/multipage/DetailView";
import { ImageUpload } from "@/src/components/multipage/ImageUpload";
import { RichTextEditor } from "@/src/components/richtext/RichEditor";
import { useArticles } from "@/src/hook/article/useArticle";
import { useArticleCategories } from "@/src/hook/article/useArticleCategory";
import { useArticleTags } from "@/src/hook/article/useArticleTag";
import { InputMultipage } from "@/src/components/multipage/InputMultipage";
import { DropdownMultipage } from "@/src/components/multipage/DropdownMultipage";
import { RadioButtonMultipage } from "@/src/components/multipage/RadioButtonMultipage";
import { saveFile } from "@/src/utils/server/FileStorage";

// Define a type for the form data
type FormData = {
  title: { id: string; en: string };
  preview_description: { id: string; en: string };
  description: { id: string; en: string };
  article_category_id: number;
  article_tag_ids: number[];
  minute_read: number;
  is_active: boolean;
  post_schedule: string;
  // New SEO fields
  slug: string;
  meta_title: string;
  meta_description: string;
  canonical_url: string;
  og_title: string;
  og_description: string;
  og_image: string;
};

// Define a type for fields that have language support
type MultilingualFields = 'title' | 'preview_description' | 'description';

export default function ArticleNewPage() {
  const router = useRouter();
  const { createArticle, updateArticleImage } = useArticles();
  const { categories } = useArticleCategories();
  const { tags } = useArticleTags();
  
  // Language tab state
  const [activeTab, setActiveTab] = useState<"id" | "en">("id");
  
  // Get site URL from environment for canonical URLs
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yourdomain.com';
  
  // Form state with array for tags
  const [formData, setFormData] = useState<FormData>({
    title: { id: "", en: "" },
    preview_description: { id: "", en: "" },
    description: { id: "", en: "" },
    article_category_id: 0,
    article_tag_ids: [],
    minute_read: 0,
    is_active: true,
    post_schedule: new Date().toISOString().split('T')[0],
    slug: "",
    meta_title: "",
    meta_description: "",
    canonical_url: "",
    og_title: "",
    og_description: "",
    og_image: ""
  });
  
  // Image state
  const [image, setImage] = useState<File | null>(null);
  
  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle input change with auto slug and canonical URL generation
  const handleInputChange = (field: keyof FormData, value: any, lang?: "id" | "en") => {
    if (lang) {
      // Check if the field is a multilingual field
      if (field === 'title' || field === 'preview_description' || field === 'description') {
        setFormData(prev => ({
          ...prev,
          [field]: {
            ...prev[field],
            [lang]: value
          }
        }));
        
        // Auto-generate slug and canonical URL from title (ID)
        if (field === 'title' && lang === 'id') {
          const newSlug = generateSlug(value);
          const newCanonicalUrl = `${siteUrl}/article/${newSlug}`;
          
          setFormData(prev => ({
            ...prev,
            slug: newSlug,
            canonical_url: newCanonicalUrl
          }));
        }
      }
    } else {
      // Special handling for slug to also update canonical URL
      if (field === 'slug') {
        const newSlug = generateSlug(value);
        const newCanonicalUrl = `${siteUrl}/article/${newSlug}`;
        
        setFormData(prev => ({
          ...prev,
          slug: newSlug,
          canonical_url: newCanonicalUrl
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          [field]: value
        }));
      }
    }
  };

  // Handle rich editor content change
  const handleEditorChange = (content: string, lang: string) => {
    setFormData(prev => ({
      ...prev,
      description: {
        ...prev.description,
        [lang]: content
      }
    }));
  };

  // Validate form
  const validateForm = () => {
    // Reset error
    setError(null);
    
    // Required fields validation
    if (!formData.title.id) {
      setError("Judul (Indonesia) wajib diisi");
      return false;
    }
    
    if (!formData.preview_description.id) {
      setError("Deskripsi singkat (Indonesia) wajib diisi");
      return false;
    }
    
    if (!formData.description.id) {
      setError("Konten artikel (Indonesia) wajib diisi");
      return false;
    }
    
    if (!formData.article_category_id) {
      setError("Kategori artikel wajib dipilih");
      return false;
    }
    
    if (!formData.article_tag_ids.length) {
      setError("Minimal satu tag artikel wajib dipilih");
      return false;
    }
    
    return true;
  };

  // Handle form submission - fixed version
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Create a copy of form data without article_tag_ids
      const { article_tag_ids, ...articleData } = formData;
      
      // Extract core article data, making sure canonical_url and other fields are properly formatted
      const articleToCreate = {
        title: articleData.title,
        preview_description: articleData.preview_description,
        description: articleData.description,
        article_category_id: articleData.article_category_id,
        is_active: articleData.is_active,
        minute_read: articleData.minute_read || 0,
        post_schedule: articleData.post_schedule,
        
        // SEO fields
        slug: articleData.slug || generateSlug(articleData.title.id),
        meta_title: articleData.meta_title,
        meta_description: articleData.meta_description,
        canonical_url: articleData.canonical_url,
        og_title: articleData.og_title,
        og_description: articleData.og_description,
        og_image: articleData.og_image,
      };
      
      // Create article, passing tag IDs as a separate parameter
      const newArticle = await createArticle(articleToCreate, article_tag_ids);
      
      // Upload image if available
      if (image && newArticle) {
        await updateArticleImage(newArticle.id, image);
      }
      
      // Redirect to article list
      router.push("/article");
    } catch (err) {
      console.error('Error creating article:', err);
      setError(err instanceof Error ? err.message : "Terjadi kesalahan saat menyimpan artikel");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = async (file: File): Promise<string> => {
    try {
      if (!file) throw new Error("File tidak valid");
      
      // Jika artikel belum dibuat, simpan gambar ke folder sementara
      const folder = "articles/temp";
      
      // Upload file dan dapatkan URL
      const imagePath = await saveFile(file, { folder });
      
      // Return URL untuk dimasukkan ke editor
      return imagePath;
    } catch (err) {
      console.error("Error uploading image:", err);
      throw err;
    }
  };

  // Add this function to generate a slug from title
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Buat Artikel Baru"
        backUrl="/article"
        actions={
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => router.push("/article")}
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
                  onClick={() => setActiveTab("id")}
                  className={`py-2 px-4 ${
                    activeTab === "id"
                      ? "border-b-2 border-primary font-medium"
                      : "text-muted-foreground"
                  }`}
                >
                  Bahasa Indonesia
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("en")}
                  className={`py-2 px-4 ${
                    activeTab === "en"
                      ? "border-b-2 border-primary font-medium"
                      : "text-muted-foreground"
                  }`}
                >
                  English
                </button>
              </div>

              {/* Article content */}
              <FormSection title="Konten Artikel">
                <div className="space-y-4">
                  {/* Title */}
                  <div className="space-y-2">
                    <InputMultipage 
                      value={formData.title[activeTab]}
                      onChange={(e) => handleInputChange("title", e.target.value, activeTab)}
                      label={`Judul ${activeTab === "id" ? "(Indonesia)" : "(English)"}`}
                      language={activeTab}
                    />
                    
                  </div>

                  {/* Preview Description */}
                  <div className="space-y-2">
                    <InputMultipage 
                      value={formData.preview_description[activeTab]}
                      onChange={(e) => handleInputChange("preview_description", e.target.value, activeTab)}
                      label={`Deskripsi Singkat ${activeTab === "id" ? "(Indonesia)" : "(English)"}`}
                      language={activeTab}
                    />
                  </div>

                  {/* Article Content with Rich Editor */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium block">
                      Konten Artikel {activeTab === "id" ? "(Indonesia)" : "(English)"}
                      {activeTab === "id" && <span className="text-destructive"> *</span>}
                    </label>
                    <RichTextEditor
                      value={formData.description[activeTab]}
                      onChange={(content) => handleEditorChange(content, activeTab)}
                      placeholder={`Tulis konten artikel ${activeTab === "id" ? "dalam Bahasa Indonesia" : "in English"}`}
                      onImageUpload={handleImageUpload}
                      language={activeTab}
                    />
                  </div>
                </div>
              </FormSection>

              {/* Add new SEO section */}
              <FormSection title="SEO & Metadata">
                <div className="space-y-4">
                  {/* Slug */}
                  <div className="space-y-2">
                    <InputMultipage 
                      value={formData.slug}
                      onChange={(e) => handleInputChange("slug", e.target.value)}
                      label="Slug URL"
                      placeholder="article-slug"
                      language={activeTab}
                      helperText="URL-friendly version of title. Auto-generated but can be customized."
                    />
                  </div>
                  
                  {/* Meta Title */}
                  <div className="space-y-2">
                    <InputMultipage 
                      value={formData.meta_title}
                      onChange={(e) => handleInputChange("meta_title", e.target.value)}
                      label="Meta Title"
                      placeholder="SEO Title (akan menggunakan judul artikel jika kosong)"
                      language={activeTab}
                    />
                  </div>
                  
                  {/* Meta Description */}
                  <div className="space-y-2">
                    <InputMultipage 
                      value={formData.meta_description}
                      onChange={(e) => handleInputChange("meta_description", e.target.value)}
                      label="Meta Description"
                      placeholder="SEO Description (akan menggunakan deskripsi singkat jika kosong)"
                      language={activeTab}
                    />
                  </div>
                  
                  {/* Canonical URL */}
                  <div className="space-y-2">
                    <InputMultipage 
                      value={formData.canonical_url}
                      onChange={(e) => handleInputChange("canonical_url", e.target.value)}
                      label="Canonical URL"
                      placeholder="https://yoursite.com/article/original-url"
                      language={activeTab}
                      helperText="URL resmi untuk menghindari konten duplikat. Biarkan kosong jika artikel ini adalah artikel asli."
                    />
                  </div>
                  
                  {/* Open Graph */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Open Graph (Social Media Sharing)</h4>
                    
                    <InputMultipage 
                      value={formData.og_title}
                      onChange={(e) => handleInputChange("og_title", e.target.value)}
                      label="OG Title"
                      placeholder="Title for social media (akan menggunakan meta title jika kosong)"
                      language={activeTab}
                    />
                    
                    <InputMultipage 
                      value={formData.og_description}
                      onChange={(e) => handleInputChange("og_description", e.target.value)}
                      label="OG Description"
                      placeholder="Description for social media (akan menggunakan meta description jika kosong)"
                      language={activeTab}
                    />
                    
                    <InputMultipage 
                      value={formData.og_image}
                      onChange={(e) => handleInputChange("og_image", e.target.value)}
                      label="OG Image URL"
                      placeholder="https://yoursite.com/images/og-image.jpg"
                      language={activeTab}
                    />
                  </div>
                </div>
              </FormSection>
            </div>

            {/* Sidebar - 1/3 width */}
            <div className="space-y-6">
              {/* Image Upload */}
              <FormSection title="Gambar Artikel">
                <ImageUpload
                  onChange={setImage}
                  value={image}
                  maxSize={2}
                  aspectRatio="wide"
                  label="Unggah Gambar"
                  description="Format: JPG, PNG, WebP. Maks 2MB."
                />
              </FormSection>

              {/* Article Settings */}
              <FormSection title="Pengaturan Artikel">
                <div className="space-y-4">
                  {/* Category */}
                  <div className="space-y-2">
                    
                    <DropdownMultipage
                        label="Kategori"
                        value={formData.article_category_id || ""}
                        onChange={(value) => handleInputChange("article_category_id", value)}
                        options={categories.map(category => ({
                            value: category.id,
                            label: category.title?.id || category.title?.en || `Kategori ${category.id}`
                        }))}
                        placeholder="Pilih Kategori"
                        required={true}
                        isMultiple={true}
                    />
                  </div>

                  {/* Tag - Updated to support multiple selection */}
                  <div className="space-y-2">
                    <DropdownMultipage 
                        label="Tag"
                        value={formData.article_tag_ids}
                        onChange={(value) => handleInputChange("article_tag_ids", value)}
                        options={tags.map(tag => ({
                            value: tag.id,
                            label: tag.title?.id || tag.title?.en || `Tag ${tag.id}`
                        }))}
                        placeholder="Pilih Tag (bisa pilih lebih dari satu)"
                        isMultiple={true}
                        required={true}
                    />
                    <p className="text-xs text-muted-foreground">
                      Pilih satu atau lebih tag yang sesuai dengan artikel ini
                    </p>
                  </div>

                  {/* Post Schedule */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium block">
                      Jadwal Publikasi
                    </label>
                    <input
                      type="date"
                      value={formData.post_schedule}
                      onChange={(e) => handleInputChange("post_schedule", e.target.value)}
                      className="w-full rounded-md border border-input bg-background p-3 text-sm focus:border-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring transition-all duration-200"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Jadwal artikel akan dipublikasikan. Artikel dengan status aktif akan ditampilkan pada tanggal ini.
                    </p>
                  </div>

                  {/* Status */}
                  <div className="space-y-2">
                    <RadioButtonMultipage 
                        label="Status"
                        value={formData.is_active.toString()}
                        onChange={(value) => handleInputChange("is_active", value === "true")}
                        options={[
                            { value: "true", label: "Aktif" },
                            { value: "false", label: "Draft" }
                        ]}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Artikel yang aktif akan ditampilkan di situs blog sesuai jadwal publikasi
                    </p>
                  </div>
                </div>
              </FormSection>
            </div>
          </div>
        </DetailView>
      </form>
    </div>
  );
}