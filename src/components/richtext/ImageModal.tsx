import React, { useState, useEffect } from "react";
import { X, Check } from "lucide-react";

interface ImageModalProps {
  src: string;
  alt: string;
  width?: string;
  height?: string;
  onSave: (data: { src: string; alt: string; width?: string; height?: string }) => void;
  onCancel: () => void;
}

export function ImageModal({ src, alt, width, height, onSave, onCancel }: ImageModalProps) {
  const [imageData, setImageData] = useState({
    src,
    alt: alt || '',
    width: width || '',
    height: height || '',
  });

  const [keepAspectRatio, setKeepAspectRatio] = useState(true);
  const [aspectRatio, setAspectRatio] = useState(1);

  useEffect(() => {
    if (src) {
      const img = new Image();
      img.onload = () => {
        setAspectRatio(img.width / img.height);
      };
      img.src = src;
    }
  }, [src]);

  const handleWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newWidth = e.target.value;
    setImageData({
      ...imageData,
      width: newWidth,
      height: keepAspectRatio && newWidth ? `${Math.round(parseInt(newWidth) / aspectRatio)}` : imageData.height
    });
  };

  const handleHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newHeight = e.target.value;
    setImageData({
      ...imageData,
      height: newHeight,
      width: keepAspectRatio && newHeight ? `${Math.round(parseInt(newHeight) * aspectRatio)}` : imageData.width
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
      <div className="bg-background rounded-lg p-4 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Edit Gambar</h3>
          <button onClick={onCancel} className="p-1 rounded-full hover:bg-muted">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="space-y-4">
          <div className="flex justify-center mb-4">
            <img 
              src={src} 
              alt={imageData.alt} 
              className="max-h-40 max-w-full object-contain" 
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium">Nama/Alt Gambar</label>
            <input
              type="text"
              value={imageData.alt}
              onChange={(e) => setImageData({ ...imageData, alt: e.target.value })}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="Deskripsi gambar"
            />
          </div>
          
          <div className="flex space-x-4">
            <div className="space-y-2 flex-1">
              <label className="block text-sm font-medium">Lebar (px)</label>
              <input
                type="number"
                value={imageData.width}
                onChange={handleWidthChange}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="Auto"
              />
            </div>
            <div className="space-y-2 flex-1">
              <label className="block text-sm font-medium">Tinggi (px)</label>
              <input
                type="number"
                value={imageData.height}
                onChange={handleHeightChange}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="Auto"
              />
            </div>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="keepAspectRatio"
              checked={keepAspectRatio}
              onChange={() => setKeepAspectRatio(!keepAspectRatio)}
              className="mr-2"
            />
            <label htmlFor="keepAspectRatio" className="text-sm">Pertahankan proporsi</label>
          </div>
        </div>
        
        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 border rounded-md hover:bg-muted"
            type="button"
          >
            Batal
          </button>
          <button
            onClick={() => onSave(imageData)}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            type="button"
          >
            Simpan
            <Check className="h-4 w-4 ml-1 inline" />
          </button>
        </div>
      </div>
    </div>
  );
}