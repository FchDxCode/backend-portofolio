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

// tambahkan di bawah saveImage / deleteImage yg sudah ada
export async function saveFile(
  file: File,
  opts: { folder: string; deletePrev?: string | null }
) {
  const targetDir = path.join(UPLOAD_ROOT, opts.folder);
  await mkdir(targetDir, { recursive: true });

  if (opts.deletePrev)
    await unlink(path.join(PUBLIC_DIR, opts.deletePrev)).catch(() => {});

  const ext = file.name.split('.').pop();
  const name = crypto.randomBytes(6).toString('hex') + '.' + ext;
  const bytes = Buffer.from(await file.arrayBuffer());

  await writeFile(path.join(targetDir, name), bytes);
  return `/uploads/${opts.folder}/${name}`;
}

export const deleteFile = deleteImage; // alias agar nama generik
