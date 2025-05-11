import React, { useRef } from "react";

interface FileUploadProps {
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label?: string;
  accept?: string;
  className?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onChange,
  label = "Unggah File",
  accept = "image/*",
  className = "",
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      <div className="flex items-center">
        <input
          type="file"
          ref={fileInputRef}
          onChange={onChange}
          accept={accept}
          className="hidden"
        />
        <button
          type="button"
          onClick={handleClick}
          className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary/50 transition-colors duration-200"
        >
          Pilih Gambar
        </button>
        <span className="ml-3 text-sm text-gray-500 dark:text-gray-400">
          {fileInputRef.current?.files?.[0]?.name || "Tidak ada file dipilih"}
        </span>
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400">
        Format yang didukung: JPG, PNG, GIF (Maks. 5MB)
      </p>
    </div>
  );
};

export default FileUpload;