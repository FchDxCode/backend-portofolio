import React from "react";

interface ImagePreviewProps {
  src: string;
  alt?: string;
  className?: string;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({
  src,
  alt = "Preview",
  className = "",
}) => {
  if (!src) return null;

  return (
    <div className={`relative group ${className}`}>
      <div className="overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-700 transition-all duration-300">
        <img
          src={src}
          alt={alt}
          className="w-full h-auto object-contain max-h-[240px] transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
        <span className="text-white text-sm font-medium">{alt}</span>
      </div>
    </div>
  );
};

export default ImagePreview;