import React, { useRef, useState, useEffect } from "react";
import { FileIcon, Folder } from "lucide-react";
import { useAlert } from "@/src/components/ui/alert/AlertProvider";

interface DocumentUploadProps {
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label?: string;
  accept?: string;
  className?: string;
  currentUrl?: string | null;
  maxSize?: number; // in MB
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({
  onChange,
  label = "Unggah Dokumen",
  accept = "application/pdf",
  className = "",
  currentUrl,
  maxSize = 5,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const { error } = useAlert();

  useEffect(() => {
    if (currentUrl) {
      // Extract filename from URL if available
      const urlParts = currentUrl.split('/');
      setFileName(urlParts[urlParts.length - 1]);
    }
  }, [currentUrl]);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      // Check file size
      if (e.target.files[0].size > maxSize * 1024 * 1024) {
        error(`File terlalu besar. Maksimal ${maxSize}MB.`);
        e.target.value = '';
        return;
      }
      setFileName(e.target.files[0].name);
    }
    onChange(e);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      <div className="flex flex-col gap-3">
        <div className="flex items-center">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleChange}
            accept={accept}
            className="hidden"
          />
          <button
            type="button"
            onClick={handleClick}
            className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary/50 transition-colors duration-200"
          >
            Pilih Dokumen
          </button>
          <span className="ml-3 text-sm text-gray-500 dark:text-gray-400">
            {fileName || "Tidak ada dokumen dipilih"}
          </span>
        </div>
        
        {currentUrl && (
          <a
            href={currentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-sm text-primary hover:underline"
          >
            <Folder className="h-4 w-4 mr-1" /> Lihat dokumen saat ini
          </a>
        )}
        
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Format yang didukung: PDF (Maks. {maxSize}MB)
        </p>
      </div>
    </div>
  );
};

export default DocumentUpload;