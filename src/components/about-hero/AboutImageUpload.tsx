"use client";

import { useState, useRef } from "react";
import { Upload, X } from "lucide-react";

interface ImageUploadProps {
  currentImage?: string;
  onImageChange: (file: File | null) => void;
  className?: string;
}

export function ImageUpload({
  currentImage,
  onImageChange,
  className = "",
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImage ?? null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) handleFile(e.target.files[0]);
  };

  const handleFile = (file: File) => {
    if (!file.type.match("image.*")) {
      alert("Please select an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("File is too large. Please select an image under 5 MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);

    onImageChange(file);
  };

  const clearImage = () => {
    setPreview(null);
    fileInputRef.current && (fileInputRef.current.value = "");
    onImageChange(null);
  };

  const triggerFileInput = () => fileInputRef.current?.click();

  return (
    <div
      className={`border rounded-md overflow-hidden relative group ${
        isDragging
          ? "border-primary border-dashed bg-primary/5"
          : "border-input"
      } ${className}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {preview ? (
        <div className="relative w-full h-full">
          <img src={preview} alt="Preview" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button
              type="button"
              onClick={clearImage}
              className="bg-destructive/90 hover:bg-destructive text-white p-1 rounded-full"
              title="Remove image"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      ) : (
        <div
          className="flex flex-col items-center justify-center p-8 cursor-pointer w-full h-full min-h-[150px] text-center"
          onClick={triggerFileInput}
        >
          <Upload className="h-8 w-8 text-muted-foreground mb-2" />
          <p className="text-sm font-medium">
            Drag and drop an image, or click to browse
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            PNG, JPG or WebP up to 5 MB
          </p>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png, image/jpeg, image/webp"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
