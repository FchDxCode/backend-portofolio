"use client";

import React, { useState, useRef, useEffect } from "react";
import { Image, Upload, X } from "lucide-react";

interface ImageUploadProps {
  label?: string;
  description?: string;
  accept?: string;
  images?: File[] | null;
  value?: File | null;
  onChange: ((files: File[]) => void) | ((file: File | null) => void);
  onRemove?: (index: number) => Promise<void>;
  error?: string;
  className?: string;
  maxSize?: number;
  maxFiles?: number;
  aspectRatio?: "square" | "wide" | "tall" | "free";
  previewSize?: "small" | "medium" | "large";
}

export function ImageUpload({
  label = "Upload Gambar",
  description = "JPG, PNG, atau GIF hingga 2MB",
  accept = "image/jpeg,image/png,image/gif",
  images = [],
  value = null,
  onChange,
  onRemove,
  error,
  className = "",
  maxSize = 2,
  maxFiles = 1,
  aspectRatio = "free",
  previewSize = "medium"
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Hapus state previewUrls dan hitung saat render
  const isMultipleMode = maxFiles > 1;
  
  // Tentukan files untuk ditampilkan
  const filesToDisplay = isMultipleMode 
    ? (images as File[] || []) 
    : (value ? [value as File] : []);
  
  // Generate preview URLs inline saat render (tidak perlu state)
  const previewUrls = filesToDisplay.map(file => {
    if (file instanceof File) {
      // Catatan: ini akan membuat URL baru setiap render
      // tapi kita akan membersihkannya di useEffect
      return URL.createObjectURL(file);
    }
    return '';
  }).filter(Boolean);
  
  // Bersihkan URL saat komponen unmount
  useEffect(() => {
    return () => {
      previewUrls.forEach(url => {
        if (url && url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, []); // Dependency kosong, hanya berjalan saat unmount

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
      const newFiles = Array.from(e.dataTransfer.files);
      validateAndAddFiles(newFiles);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      validateAndAddFiles(newFiles);
    }
  };

  // Fungsi untuk menangani perubahan file
  const handleFileUpdate = (newFiles: File[]) => {
    if (isMultipleMode) {
      // Mode multiple files
      (onChange as (files: File[]) => void)(newFiles);
    } else {
      // Mode single file
      (onChange as (file: File | null) => void)(newFiles[0] || null);
    }
  };

  const validateAndAddFiles = (newFiles: File[]) => {
    setFileError(null);
    
    // Tentukan files yang sudah ada
    const existingFiles = isMultipleMode 
      ? (images as File[] || []) 
      : (value ? [value as File] : []);
    
    // Check if adding these files would exceed maxFiles
    if (existingFiles.length + newFiles.length > maxFiles) {
      setFileError(`Maksimal ${maxFiles} gambar`);
      return;
    }
    
    const validFiles: File[] = [];
    
    for (const file of newFiles) {
      // Check file type
      if (!file.type.startsWith('image/')) {
        setFileError("File harus berupa gambar");
        continue;
      }
      
      // Check file size
      if (file.size > maxSize * 1024 * 1024) {
        setFileError(`Ukuran gambar terlalu besar. Maksimal ${maxSize}MB`);
        continue;
      }
      
      validFiles.push(file);
    }
    
    if (validFiles.length > 0) {
      // Jika single mode, ganti file yang ada
      if (!isMultipleMode) {
        handleFileUpdate(validFiles.slice(0, 1));
      } else {
        // Jika multiple mode, tambahkan ke array yang ada
        handleFileUpdate([...existingFiles, ...validFiles]);
      }
    }
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemove = async (index: number) => {
    if (onRemove) {
      await onRemove(index);
    }
    
    // Tentukan files yang sudah ada
    const existingFiles = isMultipleMode 
      ? (images as File[] || []) 
      : (value ? [value as File] : []);
    
    if (isMultipleMode) {
      const newFiles = [...existingFiles];
      newFiles.splice(index, 1);
      handleFileUpdate(newFiles);
    } else {
      handleFileUpdate([]);
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <div className="text-sm font-medium text-foreground">{label}</div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Preview images */}
        {previewUrls.map((url, index) => (
          <div key={`img-${index}`} className="relative rounded-lg overflow-hidden border bg-muted/30">
            <div className={`${previewSizeClass[previewSize]} ${aspectRatioClass[aspectRatio]} relative`}>
              <img 
                src={url}
                alt={`Preview ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="absolute top-2 right-2 p-1 rounded-full bg-foreground/10 backdrop-blur-sm hover:bg-destructive text-white"
                title="Hapus gambar"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
        
        {/* Upload area (only show if under maxFiles) */}
        {filesToDisplay.length < maxFiles && (
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
              multiple={maxFiles > 1}
            />
          </div>
        )}
      </div>
      
      {(error || fileError) && (
        <p className="text-sm text-destructive mt-1">
          {error || fileError}
        </p>
      )}
    </div>
  );
}