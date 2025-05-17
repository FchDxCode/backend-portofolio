"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { PageHeader } from "@/src/components/multipage/PageHeader";
import { Button } from "@/src/components/multipage/Button";
import { DetailView } from "@/src/components/multipage/DetailView";
import { ArticleService } from "@/src/services/article/ArticleServices";
import { FormSection } from "@/src/components/multipage/FormSection";
import { Edit, ArrowLeft, Eye, Clock, ThumbsUp } from "lucide-react";
import { createClient } from '@/src/utils/supabase/client';

const supabase = createClient();

export default function ArticleDetailPage() {
  const router = useRouter();
  const params = useParams();
  const articleId = Number(params.id);
  
  // Data state
  const [article, setArticle] = useState<any>(null);
  const [category, setCategory] = useState<any>(null);
  const [tags, setTags] = useState<any[]>([]);
  
  // UI state
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch article data
  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setIsLoading(true);
        const articleData = await ArticleService.getById(articleId);
        
        if (articleData) {
          setArticle(articleData);
          
          // Fetch category if needed
          if (articleData.article_category_id) {
            try {
              const { data: categoryData } = await supabase
                .from('article_categories')
                .select('*')
                .eq('id', articleData.article_category_id)
                .single();
                
              setCategory(categoryData);
            } catch (err) {
              console.error("Error fetching category:", err);
            }
          }
          
          // Use tags from article if available
          if ((articleData as any).tags) {
            setTags((articleData as any).tags);
          } else {
            // Fetch tags manually if not included in article
            try {
              const tagData = await ArticleService.getArticleTags(articleId);
              setTags(tagData);
            } catch (err) {
              console.error("Error fetching tags:", err);
            }
          }
        } else {
          setError("Artikel tidak ditemukan");
        }
      } catch (err) {
        console.error("Error fetching article:", err);
        setError("Gagal memuat artikel");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchArticle();
  }, [articleId]);

  const handleLike = async () => {
    try {
      await ArticleService.toggleLike(articleId);
      // Update the article with new like count
      const updatedArticle = await ArticleService.getById(articleId);
      if (updatedArticle) {
        setArticle(updatedArticle);
      }
    } catch (err) {
      console.error("Error liking article:", err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="p-4">
        <PageHeader
          title="Error"
          backUrl="/article"
        />
        <div className="bg-destructive/10 text-destructive p-3 rounded-md mt-4">
          {error || "Artikel tidak ditemukan"}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Detail Artikel"
        backUrl="/article"
        actions={
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => router.back()}
              icon={<ArrowLeft size={16} />}
            >
              Kembali
            </Button>
            <Button
              variant="primary"
              onClick={() => router.push(`/article/${articleId}/edit`)}
              icon={<Edit size={16} />}
            >
              Edit
            </Button>
          </div>
        }
      />

      <DetailView>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main content - 2/3 width */}
          <div className="md:col-span-2 space-y-6">
            {/* Article title and content */}
            <FormSection title="Konten Artikel">
              <div className="space-y-6">
                {/* Title */}
                <div>
                  <h2 className="text-2xl font-bold mb-2">{article.title?.id || "-"}</h2>
                  {article.title?.en && article.title.id !== article.title.en && (
                    <h3 className="text-xl text-muted-foreground">{article.title.en}</h3>
                  )}
                </div>
                
                {/* Image */}
                {article.image && (
                  <div className="rounded-lg overflow-hidden">
                    <img 
                      src={article.image} 
                      alt={article.title?.id || "Article image"} 
                      className="w-full object-cover h-64"
                    />
                  </div>
                )}
                
                {/* Preview Description */}
                <div className="border-l-4 border-primary pl-4 italic">
                  <div dangerouslySetInnerHTML={{ __html: article.preview_description?.id || "-" }} />
                  {article.preview_description?.en && article.preview_description.id !== article.preview_description.en && (
                    <div className="text-muted-foreground mt-2" dangerouslySetInnerHTML={{ __html: article.preview_description.en }} />
                  )}
                </div>
                
                {/* Content tabs - ID and EN */}
                <div className="space-y-4">
                  <div className="flex border-b border-gray-200">
                    <button
                      className="py-2 px-4 border-b-2 border-primary font-medium"
                    >
                      Bahasa Indonesia
                    </button>
                  </div>
                  
                  <div className="prose dark:prose-invert max-w-none">
                    <div dangerouslySetInnerHTML={{ __html: article.description?.id || "-" }} />
                  </div>
                  
                  {article.description?.en && article.description.id !== article.description.en && (
                    <>
                      <div className="flex border-b border-gray-200 mt-8">
                        <button
                          className="py-2 px-4 border-b-2 border-primary font-medium"
                        >
                          English
                        </button>
                      </div>
                      
                      <div className="prose dark:prose-invert max-w-none">
                        <div dangerouslySetInnerHTML={{ __html: article.description.en || "-" }} />
                      </div>
                    </>
                  )}
                </div>
              </div>
            </FormSection>
            
            {/* SEO Info */}
            <FormSection title="SEO & Metadata">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium mb-1">Slug URL</h4>
                  <p className="text-sm text-muted-foreground">{article.slug || "-"}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-1">Meta Title</h4>
                  <p className="text-sm text-muted-foreground">{article.meta_title || "-"}</p>
                </div>
                
                <div className="md:col-span-2">
                  <h4 className="text-sm font-medium mb-1">Meta Description</h4>
                  <p className="text-sm text-muted-foreground">{article.meta_description || "-"}</p>
                </div>
                
                <div className="md:col-span-2">
                  <h4 className="text-sm font-medium mb-1">Canonical URL</h4>
                  <p className="text-sm text-muted-foreground">{article.canonical_url || "-"}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-1">OG Title</h4>
                  <p className="text-sm text-muted-foreground">{article.og_title || "-"}</p>
                </div>
                
                <div className="md:col-span-2">
                  <h4 className="text-sm font-medium mb-1">OG Description</h4>
                  <p className="text-sm text-muted-foreground">{article.og_description || "-"}</p>
                </div>
                
                <div className="md:col-span-2">
                  <h4 className="text-sm font-medium mb-1">OG Image URL</h4>
                  <p className="text-sm text-muted-foreground">{article.og_image || "-"}</p>
                </div>
              </div>
            </FormSection>
          </div>
          
          {/* Sidebar - 1/3 width */}
          <div className="space-y-6">
            {/* Article metadata */}
            <FormSection title="Metadata">
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-1">Status</h4>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      article.is_active
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                    }`}
                  >
                    {article.is_active ? "Aktif" : "Tidak Aktif"}
                  </span>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-1">Jadwal Publikasi</h4>
                  <p className="text-sm">
                    {article.post_schedule 
                      ? new Date(article.post_schedule).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })
                      : "-"
                    }
                  </p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-1">Kategori</h4>
                  <p className="text-sm">
                    {category 
                      ? (category.title?.id || category.title?.en || `Kategori ${category.id}`)
                      : (article.article_category_id || "-")
                    }
                  </p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-1">Tags</h4>
                  <div className="flex flex-wrap gap-1">
                    {tags && tags.length > 0 
                      ? tags.map((tag: any) => (
                          <span 
                            key={tag.id} 
                            className="px-2 py-1 bg-gray-100 text-xs rounded-full dark:bg-gray-800"
                          >
                            {tag.title?.id || tag.title?.en || `Tag ${tag.id}`}
                          </span>
                        ))
                      : "-"
                    }
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-1">Tanggal Dibuat</h4>
                  <p className="text-sm">
                    {article.created_at 
                      ? new Date(article.created_at).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })
                      : "-"
                    }
                  </p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-1">Terakhir Diperbarui</h4>
                  <p className="text-sm">
                    {article.updated_at 
                      ? new Date(article.updated_at).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })
                      : "-"
                    }
                  </p>
                </div>
              </div>
            </FormSection>
            
            {/* Statistics */}
            <FormSection title="Statistik">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Eye size={18} />
                  <div>
                    <h4 className="text-sm font-medium">Total Views</h4>
                    <p className="text-sm">{article.total_views || 0}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Clock size={18} />
                  <div>
                    <h4 className="text-sm font-medium">Waktu Baca Rata-Rata</h4>
                    <p className="text-sm">{article.minute_read || 0} menit</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <ThumbsUp size={18} />
                  <div>
                    <h4 className="text-sm font-medium">Likes</h4>
                    <p className="text-sm">{article.like || 0}</p>
                  </div>
                </div>
                
                <Button
                  variant="outline"
                  onClick={handleLike}
                  icon={<ThumbsUp size={16} />}
                  className="w-full"
                >
                  Tambah Like
                </Button>
              </div>
            </FormSection>
          </div>
        </div>
      </DetailView>
    </div>
  );
}