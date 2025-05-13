"use client";

import React, { useState, useRef } from "react";
import { FileText, Upload, X, Eye, Download } from "lucide-react";

interface DocumentUploadProps {
  label?: string;
  description?: string;
  accept?: string;
  value?: string | null;
  onChange: (file: File | null) => void;
  onRemove?: () => Promise<void>;
  error?: string;
  className?: string;
  maxSize?: number; // in MB
}

export function DocumentUpload({
  label = "Upload Dokumen",
  description = "PDF, DOC, DOCX, atau TXT hingga 5MB",
  accept = ".pdf,.doc,.docx,.txt",
  value = null,
  onChange,
  onRemove,
  error,
  className = "",
  maxSize = 5 // Default 5MB
}: DocumentUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    const fileType = file.name.split('.').pop()?.toLowerCase();
    const acceptedTypes = accept.split(',').map(type => 
      type.trim().replace('.', '').toLowerCase()
    );
    
    if (!acceptedTypes.includes(fileType || '')) {
      setFileError(`Format file tidak didukung. Gunakan ${accept}`);
      return;
    }
    
    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      setFileError(`Ukuran file terlalu besar. Maksimal ${maxSize}MB`);
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
  };

  const getFileName = () => {
    if (value) {
      // If value is a URL, extract the filename from it
      if (value.startsWith('http')) {
        const urlParts = value.split('/');
        return urlParts[urlParts.length - 1];
      }
      return value;
    }
    return null;
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <div className="text-sm font-medium text-foreground">{label}</div>
      )}
      
      {value ? (
        <div className="flex flex-col border rounded-lg overflow-hidden">
          <div className="flex items-center justify-between p-3 bg-muted/30 border-b">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium truncate">
                {getFileName()}
              </span>
            </div>
            <div className="flex items-center gap-1">
              {value.startsWith('http') && (
                <>
                  <a 
                    href={value} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground"
                    title="Lihat dokumen"
                  >
                    <Eye className="h-4 w-4" />
                  </a>
                  <a 
                    href={value} 
                    download
                    className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground"
                    title="Unduh dokumen"
                  >
                    <Download className="h-4 w-4" />
                  </a>
                </>
              )}
              <button 
                type="button"
                onClick={handleRemove}
                className="p-1.5 rounded-md hover:bg-destructive/10 text-destructive hover:text-destructive"
                title="Hapus dokumen"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
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
          }`}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="flex flex-col items-center gap-2">
            <div className="p-2 rounded-full bg-primary/10 text-primary">
              <Upload className="h-5 w-5" />
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