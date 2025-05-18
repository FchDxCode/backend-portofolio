"use client";

import React, { useState, useRef, useEffect } from "react";
import { FileText, Upload, X, Eye, Download } from "lucide-react";

interface DocumentUploadProps {
  label?: string;
  description?: string;
  accept?: string;
  value?: File | string | null;
  onChange: (file: File | null) => void;
  onRemove?: () => Promise<void>;
  error?: string;
  className?: string;
  maxSize?: number; // in MB
}

export function DocumentUpload({
  label = "Upload Dokumen",
  description = "PDF, DOC, DOCX, atau TXT hingga 5MB",
  accept = ".pdf,.doc,.docx,.txt,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain",
  value = null,
  onChange,
  onRemove,
  error,
  className = "",
  maxSize = 5
}: DocumentUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update previewUrl whenever `value` berubah
  useEffect(() => {
    // revoke URL lama
    return () => {
      if (previewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  useEffect(() => {
    if (value instanceof File) {
      const url = URL.createObjectURL(value);
      setPreviewUrl(url);
    } else if (typeof value === "string") {
      setPreviewUrl(value);
    } else {
      setPreviewUrl(null);
    }
  }, [value]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (file: File) => {
    setFileError(null);
    const ext = file.name.split('.').pop()?.toLowerCase() || "";
    const accepted = accept.split(',').map(t => t.trim().replace('.', '').toLowerCase());
    if (!accepted.includes(ext)) {
      setFileError(`Format file tidak didukung. Gunakan: ${accept}`);
      return;
    }
    if (file.size > maxSize * 1024 * 1024) {
      setFileError(`Ukuran file terlalu besar. Maksimal ${maxSize}MB`);
      return;
    }
    onChange(file);
  };

  const handleRemove = async () => {
    if (onRemove) await onRemove();
    onChange(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const getFileName = () => {
    if (value instanceof File) return value.name;
    if (typeof value === "string") {
      // ambil nama dari URL
      return value.split('/').pop() || value;
    }
    return "";
  };

  const isPdf = (url: string) =>
    url.toLowerCase().endsWith(".pdf");

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <div className="text-sm font-medium text-foreground">{label}</div>
      )}

      {previewUrl ? (
        <div className="flex flex-col border rounded-lg overflow-hidden">
          <div className="flex items-center justify-between p-3 bg-muted/30 border-b">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium truncate">{getFileName()}</span>
            </div>
            <div className="flex items-center gap-1">
              {previewUrl.startsWith("http") && (
                <>
                  <a
                    href={previewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground"
                    title="Lihat dokumen"
                  >
                    <Eye className="h-4 w-4" />
                  </a>
                  <a
                    href={previewUrl}
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
          {/* Preview hanya untuk PDF */}
          {isPdf(previewUrl) && (
            <embed
              src={previewUrl}
              type="application/pdf"
              width="100%"
              height="200px"
            />
          )}
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            isDragging
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25 hover:border-muted-foreground/50"
          }`}
        >
          <div className="flex flex-col items-center gap-2">
            <div className="p-2 rounded-full bg-primary/10 text-primary">
              <Upload className="h-5 w-5" />
            </div>
            <div className="text-sm font-medium">
              <span className="text-primary">Klik untuk upload</span> atau drag and drop
            </div>
            <p className="text-xs text-muted-foreground">{description}</p>
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
