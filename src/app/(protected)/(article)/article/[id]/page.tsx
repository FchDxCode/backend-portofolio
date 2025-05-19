"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { PageHeader } from "@/src/components/multipage/PageHeader";
import { Button } from "@/src/components/multipage/Button";
import { DetailView, DetailItem } from "@/src/components/multipage/DetailView";
import { Edit, ArrowLeft, Eye, Clock, ThumbsUp } from "lucide-react";
import { ArticleService } from "@/src/services/article/ArticleServices";
import { createClient } from '@/src/utils/supabase/client';
import { Article } from "@/src/models/ArticleModels";

const supabase = createClient();

type Lang = 'id' | 'en';

// Extended Article type to include tags
interface ArticleWithTags extends Article {
  tags?: Array<{
    id: number;
    title?: Record<string, string>;
    [key: string]: any;
  }>;
}

export default function ArticleDetailPage() {
  const router = useRouter();
  const params = useParams();
  const articleId = Number(params.id);
  
  // State with proper typing
  const [article, setArticle] = useState<ArticleWithTags | null>(null);
  const [category, setCategory] = useState<any>(null);
  const [tags, setTags] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Lang>('id');

  // Fetch article data
  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setIsLoading(true);
        const articleData = await ArticleService.getById(articleId) as ArticleWithTags;
        
        if (articleData) {
          setArticle(articleData);
          
          // Get category if available
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
          
          // Set tags from article data
          if (articleData.tags) {
            setTags(articleData.tags);
          } else {
            // Fetch tags separately if not included in article
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
      const updatedArticle = await ArticleService.toggleLike(articleId) as ArticleWithTags;
      if (updatedArticle) {
        setArticle(updatedArticle);
      }
    } catch (err) {
      console.error("Error liking article:", err);
    }
  };

  const formatDate = (d?: string | null) => {
    if (!d) return '-';
    try {
      return new Date(d).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return d;
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
        title={article.title?.[activeTab] || "Detail Artikel"}
        backUrl="/article"
        actions={
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => router.push('/article')}
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

      {/* Language Tabs */}
      <div className="flex border-b border-gray-200">
        {(['id', 'en'] as Lang[]).map(lang => (
          <button
            key={lang}
            type="button"
            onClick={() => setActiveTab(lang)}
            className={`py-2 px-4 ${
              activeTab === lang ? 'border-b-2 border-primary font-medium' : 'text-muted-foreground'
            }`}
          >
            {lang === 'id' ? 'Bahasa Indonesia' : 'English'}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main content - 2/3 width */}
        <div className="md:col-span-2 space-y-6">
          <DetailView title="Konten Artikel">
            <div className="space-y-6">
              {/* Image */}
              {article.image && (
                <div className="rounded-lg overflow-hidden">
                  <img 
                    src={article.image} 
                    alt={article.title?.[activeTab] || "Article image"} 
                    className="w-full object-cover h-64"
                  />
                </div>
              )}
              
              {/* Preview Description */}
              <DetailItem label="Preview">
                <div className="prose max-w-none" dangerouslySetInnerHTML={{ 
                  __html: article.preview_description?.[activeTab] || 
                    "<i className='text-muted-foreground'>Tidak tersedia</i>" 
                }} />
              </DetailItem>
              
              {/* Content */}
              <DetailItem label="Konten">
                <div className="prose max-w-none" dangerouslySetInnerHTML={{ 
                  __html: article.description?.[activeTab] || 
                    "<i className='text-muted-foreground'>Tidak tersedia</i>" 
                }} />
              </DetailItem>
            </div>
          </DetailView>
          
          {/* SEO Info */}
          <DetailView title="SEO & Metadata">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DetailItem label="Slug URL">
                {article.slug || <i className="text-muted-foreground">Tidak tersedia</i>}
              </DetailItem>
              
              <DetailItem label="Meta Title">
                {article.meta_title || <i className="text-muted-foreground">Tidak tersedia</i>}
              </DetailItem>
              
              <DetailItem label="Meta Description" className="md:col-span-2">
                {article.meta_description || <i className="text-muted-foreground">Tidak tersedia</i>}
              </DetailItem>
              
              <DetailItem label="Canonical URL" className="md:col-span-2">
                {article.canonical_url || <i className="text-muted-foreground">Tidak tersedia</i>}
              </DetailItem>
              
              <DetailItem label="OG Title">
                {article.og_title || <i className="text-muted-foreground">Tidak tersedia</i>}
              </DetailItem>
              
              <DetailItem label="OG Description" className="md:col-span-2">
                {article.og_description || <i className="text-muted-foreground">Tidak tersedia</i>}
              </DetailItem>
              
              <DetailItem label="OG Image URL" className="md:col-span-2">
                {article.og_image ? (
                  <a href={article.og_image} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                    {article.og_image}
                  </a>
                ) : (
                  <i className="text-muted-foreground">Tidak tersedia</i>
                )}
              </DetailItem>
            </div>
          </DetailView>
        </div>
        
        {/* Sidebar - 1/3 width */}
        <div className="space-y-6">
          {/* Article metadata */}
          <DetailView title="Informasi Artikel">
            <DetailItem label="Status" icon={article.is_active ? 
              <span className="w-2 h-2 bg-green-500 rounded-full"></span> : 
              <span className="w-2 h-2 bg-red-500 rounded-full"></span>
            }>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  article.is_active
                    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                    : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                }`}
              >
                {article.is_active ? "Aktif" : "Tidak Aktif"}
              </span>
            </DetailItem>
            
            <DetailItem label="Jadwal Publikasi" icon={<Clock size={16} />}>
              {formatDate(article.post_schedule)}
            </DetailItem>
            
            <DetailItem label="Kategori">
              {category 
                ? (category.title?.[activeTab] || category.title?.id || `Kategori ${category.id}`)
                : (article.article_category_id ? `Kategori ${article.article_category_id}` : "-")
              }
            </DetailItem>
            
            <DetailItem label="Tags">
              <div className="flex flex-wrap gap-1">
                {tags && tags.length > 0 
                  ? tags.map((tag: any) => (
                      <span 
                        key={tag.id} 
                        className="px-2 py-1 bg-muted text-xs rounded-full"
                      >
                        {tag.title?.[activeTab] || tag.title?.id || `Tag ${tag.id}`}
                      </span>
                    ))
                  : <i className="text-muted-foreground">Tidak ada tag</i>
                }
              </div>
            </DetailItem>
          </DetailView>
          
          {/* Statistics */}
          <DetailView title="Statistik">
            <div className="space-y-4">
              <DetailItem label="Total Views" icon={<Eye size={16} />}>
                {article.total_views || 0}
              </DetailItem>
              
              <DetailItem label="Waktu Baca" icon={<Clock size={16} />}>
                {article.minute_read || 0} menit
              </DetailItem>
              
              <DetailItem label="Likes" icon={<ThumbsUp size={16} />}>
                {article.like || 0}
              </DetailItem>
              
              <Button
                variant="outline"
                onClick={handleLike}
                icon={<ThumbsUp size={16} />}
                className="w-full"
              >
                Tambah Like
              </Button>
            </div>
          </DetailView>
          
          {/* Metadata */}
          <DetailView title="Metadata">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">ID</span>
                <span>{article.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Dibuat</span>
                <span>{formatDate(article.created_at)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Diperbarui</span>
                <span>{formatDate(article.updated_at)}</span>
              </div>
            </div>
          </DetailView>
        </div>
      </div>
    </div>
  );
}