"use client";

import React, { useState, useRef, useEffect } from "react";
import { Image, Upload, X } from "lucide-react";

interface ImageUploadProps {
  label?: string;
  description?: string;
  accept?: string;
  value?: string | File | null; // Ubah tipe value untuk mendukung File
  onChange: (file: File | null) => void;
  onRemove?: () => Promise<void>;
  error?: string;
  className?: string;
  maxSize?: number;
  aspectRatio?: "square" | "wide" | "tall" | "free";
  previewSize?: "small" | "medium" | "large";
}

export function ImageUpload({
  label = "Upload Gambar",
  description = "JPG, PNG, atau GIF hingga 2MB",
  accept = "image/jpeg,image/png,image/gif",
  value = null,
  onChange,
  onRemove,
  error,
  className = "",
  maxSize = 2,
  aspectRatio = "free",
  previewSize = "medium"
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fungsi untuk menghasilkan preview URL
  const generatePreviewUrl = (val: string | File | null) => {
    if (!val) return null;
    if (val instanceof File) {
      return URL.createObjectURL(val);
    }
    return val;
  };

  // Effect untuk membersihkan URL objek saat komponen unmount
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // Effect untuk mengupdate preview URL saat value berubah
  useEffect(() => {
    const newPreviewUrl = generatePreviewUrl(value);
    setPreviewUrl(newPreviewUrl);
  }, [value]);

  const previewSizeClass = {
    small: "h-32",
    medium: "h-48",
    large: "h-64"
  };
  
  const aspectRatioClass = {
    square: "aspect-square",
    wide: "aspect-video",
    tall: "aspect-[3/4]",
    free: ""
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (file: File) => {
    setFileError(null);
    
    // Check file type
    if (!file.type.startsWith('image/')) {
      setFileError("File harus berupa gambar");
      return;
    }
    
    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      setFileError(`Ukuran gambar terlalu besar. Maksimal ${maxSize}MB`);
      return;
    }
    
    onChange(file);
  };

  const handleRemove = async () => {
    if (onRemove) {
      await onRemove();
    }
    onChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    // Bersihkan preview URL jika ada
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <div className="text-sm font-medium text-foreground">{label}</div>
      )}
      
      {previewUrl ? (
        <div className="relative rounded-lg overflow-hidden border bg-muted/30">
          <div className={`${previewSizeClass[previewSize]} ${aspectRatioClass[aspectRatio]} relative`}>
            <img 
              src={previewUrl}
              alt="Preview"
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={handleRemove}
              className="absolute top-2 right-2 p-1 rounded-full bg-foreground/10 backdrop-blur-sm hover:bg-destructive text-white"
              title="Hapus gambar"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            isDragging 
              ? 'border-primary bg-primary/5' 
              : 'border-muted-foreground/25 hover:border-muted-foreground/50'
          } ${previewSizeClass[previewSize]}`}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="flex flex-col items-center justify-center h-full gap-2">
            <div className="p-2 rounded-full bg-primary/10 text-primary">
              <Image className="h-5 w-5" />
            </div>
            <div className="text-sm font-medium">
              <span className="text-primary">Klik untuk upload</span> atau drag and drop
            </div>
            <p className="text-xs text-muted-foreground">
              {description}
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      )}
      
      {(error || fileError) && (
        <p className="text-sm text-destructive mt-1">
          {error || fileError}
        </p>
      )}
    </div>
  );
}