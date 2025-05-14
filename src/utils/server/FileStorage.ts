'use server';

import { mkdir, writeFile, unlink } from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';

const PUBLIC_DIR = path.join(process.cwd(), 'public');
const UPLOAD_ROOT = path.join(PUBLIC_DIR, 'uploads');
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB per file
const ALLOWED_MIME = ['image/png', 'image/jpeg', 'image/webp'];

export type SaveOptions = {
  /** subfolder di bawah /uploads, mis. 'about', 'product' */
  folder: string;
  /** jika true, hapus file lama sebelum menulis (jika ada) */
  deletePrev?: string | null;
};

export async function saveImage(file: File, opts: SaveOptions) {
  // —— Validasi dasar ————————————————————————————————
  if (!ALLOWED_MIME.includes(file.type))
    throw new Error('File type not allowed');
  if (file.size > MAX_SIZE)
    throw new Error(`File too large (> ${MAX_SIZE / 1024} KB)`);

  // —— Siapkan direktori target ————————————————————————
  const targetDir = path.join(UPLOAD_ROOT, opts.folder);
  await mkdir(targetDir, { recursive: true });

  // —— Hapus file lama jika diminta ————————————————————
  if (opts.deletePrev) {
    const oldPath = path.join(PUBLIC_DIR, opts.deletePrev);
    await unlink(oldPath).catch(() => {});
  }

  // —— Tentukan nama baru + tulis ke disk ————————————
  const ext = file.name.split('.').pop();
  const name = crypto.randomBytes(6).toString('hex') + '.' + ext;
  const bytes = Buffer.from(await file.arrayBuffer());

  await writeFile(path.join(targetDir, name), bytes);

  // Path publik yang bisa dipasang di <img src="...">
  return `/uploads/${opts.folder}/${name}`;
}

/** Utility untuk menghapus satu path relatif (mis. hasil saveImage) */
export async function deleteImage(publicPath: string) {
  const full = path.join(PUBLIC_DIR, publicPath);
  await unlink(full).catch(() => {});
}

export async function saveFile(
  file: File,
  opts: { folder: string; deletePrev?: string | null }
) {
  try {
    // Validasi file
    if (!file || file.size === 0) {
      throw new Error('File invalid atau kosong');
    }
    
    // Log untuk debugging
    console.debug(`Saving file: ${file.name} (${file.size} bytes, ${file.type})`);
    
    const targetDir = path.join(UPLOAD_ROOT, opts.folder);
    console.debug(`Target directory: ${targetDir}`);
    
    // Cek dan buat directory dengan error handling
    try {
      await mkdir(targetDir, { recursive: true });
    } catch (mkdirErr) {
      console.error(`Failed to create directory: ${mkdirErr instanceof Error ? mkdirErr.message : 'Unknown error'}`);
      throw new Error(`Gagal membuat direktori: ${mkdirErr instanceof Error ? mkdirErr.message : 'Unknown error'}`);
    }

    // Hapus file lama jika ada
    if (opts.deletePrev) {
      const oldPath = path.join(PUBLIC_DIR, opts.deletePrev);
      console.debug(`Attempting to delete previous file: ${oldPath}`);
      await unlink(oldPath).catch((err) => {
        console.warn(`Could not delete previous file: ${err.message}`);
      });
    }

    // Generate filename
    const ext = file.name.split('.').pop();
    const name = crypto.randomBytes(6).toString('hex') + '.' + ext;
    const fullPath = path.join(targetDir, name);
    const publicPath = `/uploads/${opts.folder}/${name}`;
    
    console.debug(`Writing file to: ${fullPath}`);
    
    // Convert file to buffer with error handling
    let bytes;
    try {
      bytes = Buffer.from(await file.arrayBuffer());
    } catch (bufferErr) {
      console.error(`Failed to read file content: ${bufferErr instanceof Error ? bufferErr.message : 'Unknown error'}`);
      throw new Error(`Gagal membaca konten file: ${bufferErr instanceof Error ? bufferErr.message : 'Unknown error'}`);
    }

    // Write file with error handling
    try {
      await writeFile(fullPath, bytes);
      console.debug(`File written successfully: ${publicPath}`);
    } catch (writeErr) {
      console.error(`Failed to write file: ${writeErr instanceof Error ? writeErr.message : 'Unknown error'}`);
      throw new Error(`Gagal menulis file: ${writeErr instanceof Error ? writeErr.message : 'Unknown error'}`);
    }
    
    return publicPath;
  } catch (err) {
    console.error('Error in saveFile:', err);
    throw err;
  }
}

export const deleteFile = deleteImage; // alias agar nama generik
