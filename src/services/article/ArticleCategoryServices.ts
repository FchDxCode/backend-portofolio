import { createClient } from '@/src/utils/supabase/client';
import { ArticleCategory } from '@/src/models/ArticleModels';
import {
  saveFile,
  deleteFile,
} from '@/src/utils/server/FileStorage'; 

const supabase = createClient();

export class ArticleCategoryService {
  private static TABLE = 'article_categories';
  private static FOLDER = 'article-categories'; 

  static async getAll(params?: {
    isActive?: boolean;
    sort?: 'created_at' | 'title';
    order?: 'asc' | 'desc';
  }): Promise<ArticleCategory[]> {
    try {
      let q = supabase.from(this.TABLE).select('*');

      if (params?.isActive !== undefined) q = q.eq('is_active', params.isActive);
      if (params?.sort)
        q = q.order(params.sort, { ascending: params.order === 'asc' });

      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    } catch (err) {
      console.error('Error fetching article categories:', err);
      throw err;
    }
  }

  static async getById(id: number): Promise<ArticleCategory | null> {
    const { data, error } = await supabase
      .from(this.TABLE)
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  }

  static async create(
    cat: Omit<ArticleCategory, 'id' | 'created_at' | 'updated_at'>
  ): Promise<ArticleCategory> {
    const { data, error } = await supabase
      .from(this.TABLE)
      .insert({
        ...cat,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  static async update(
    id: number,
    cat: Partial<ArticleCategory>
  ): Promise<ArticleCategory> {
    const { data, error } = await supabase
      .from(this.TABLE)
      .update({ ...cat, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  static async delete(id: number) {
    const cat = await this.getById(id);
    if (cat?.icon) await deleteFile(cat.icon);

    const { error } = await supabase.from(this.TABLE).delete().eq('id', id);
    if (error) throw error;
  }

  static async updateIcon(id: number, file: File): Promise<ArticleCategory> {
    try {
      // Tambahkan validasi file
      if (!file || file.size === 0) {
        throw new Error('File invalid atau kosong');
      }
      
      console.debug("Uploading icon file:", file.name, file.type, file.size);
      const current = await this.getById(id);
      if (!current) throw new Error('Category not found');
  
      // Tambahkan try-catch spesifik untuk saveFile
      let iconPath;
      try {
        iconPath = await saveFile(file, {
          folder: `${this.FOLDER}/${id}`,
          deletePrev: current.icon ?? null, 
        });
        console.debug("Icon uploaded successfully. Path:", iconPath);
      } catch (saveErr) {
        console.error("Error saving file:", saveErr);
        throw new Error(`Gagal menyimpan file: ${saveErr instanceof Error ? saveErr.message : 'Unknown error'}`);
      }
  
      // Tambahkan try-catch spesifik untuk update data
      try {
        const updated = await this.update(id, { icon: iconPath });
        console.debug("Category updated with new icon:", updated);
        return updated;
      } catch (updateErr) {
        console.error("Error updating category with icon:", updateErr);
        // Hapus file yang sudah terupload jika update gagal
        try {
          await deleteFile(iconPath);
        } catch {}
        throw new Error(`Gagal mengupdate kategori: ${updateErr instanceof Error ? updateErr.message : 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Error updating category icon:', err);
      throw err;
    }
  }
}
