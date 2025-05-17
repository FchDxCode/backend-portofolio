"use client";

import React, { useRef, useState } from "react";
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Quote, 
  Undo, 
  Redo, 
  Link as LinkIcon,
  Image as ImageIcon,
  Heading1,
  Heading2,
  Upload,
  FileEdit
} from 'lucide-react';
import { ImageModal } from './ImageModal';

// Membuat ekstensi gambar kustom dengan dukungan untuk pengeditan
const CustomImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
        renderHTML: attributes => {
          if (!attributes.width) {
            return {};
          }
          
          return {
            width: attributes.width,
            style: `width: ${attributes.width}px`,
          };
        },
      },
      height: {
        default: null,
        renderHTML: attributes => {
          if (!attributes.height) {
            return {};
          }
          
          return {
            height: attributes.height,
            style: `height: ${attributes.height}px`,
          };
        },
      },
    };
  },
});

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  className?: string;
  onImageUpload?: (file: File) => Promise<string>;
  language?: string;
}

interface ImageData {
  src: string;
  alt: string;
  width?: string;
  height?: string;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = 'Tulis konten di sini...',
  label,
  error,
  className = '',
  onImageUpload,
  language
}: RichTextEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedImage, setSelectedImage] = useState<ImageData | null>(null);
  
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline',
        },
      }),
      CustomImage.configure({
        HTMLAttributes: {
          class: 'rounded-md max-w-full cursor-pointer',
        },
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose dark:prose-invert focus:outline-none min-h-[150px] max-w-none p-4',
        placeholder,
      },
      handleClick: (view, pos, event) => {
        const node = view.state.doc.nodeAt(pos);
        if (node?.type.name === 'image') {
          const { src, alt, width, height } = node.attrs;
          
          setSelectedImage({
            src,
            alt: alt || '',
            width: width?.toString() || '',
            height: height?.toString() || ''
          });
          
          return true;
        }
        return false;
      },
    },
  });

  const setLink = () => {
    if (!editor) return;
    
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);

    if (url === null) {
      return;
    }

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  const addImageFromUrl = () => {
    if (!editor) return;
    
    const url = window.prompt('URL gambar');
    
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editor || !onImageUpload || !e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    
    // Validasi file
    if (!file.type.startsWith('image/')) {
      alert('File harus berupa gambar');
      return;
    }
    
    try {
      // Tampilkan loading state jika diperlukan
      
      // Upload file dan dapatkan URL
      const imageUrl = await onImageUpload(file);
      
      // Sisipkan gambar ke editor
      editor.chain().focus().setImage({ 
        src: imageUrl, 
        alt: file.name.replace(/\.[^/.]+$/, "") // Menggunakan nama file sebagai alt default
      }).run();
      
      // Reset input file
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Gagal mengunggah gambar');
    }
  };
  
  const triggerFileUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleImageSave = (data: ImageData) => {
    if (!editor || !selectedImage) return;
    
    // Mencari posisi gambar dalam dokumen
    const { doc } = editor.state;
    let imagePos: number | null = null;
    
    doc.descendants((node, pos) => {
      if (node.type.name === 'image' && node.attrs.src === selectedImage.src) {
        imagePos = pos;
        return false;
      }
      return true;
    });
    
    if (imagePos !== null) {
      // Update gambar dengan data baru
      editor.chain().focus().setNodeSelection(imagePos).updateAttributes('image', {
        src: data.src,
        alt: data.alt,
        width: data.width ? parseInt(data.width) : undefined,
        height: data.height ? parseInt(data.height) : undefined,
      }).run();
    }
    
    setSelectedImage(null);
  };

  if (!editor) {
    return null;
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <div className="text-sm font-medium text-foreground">{label}</div>
      )}
      
      <div className="border rounded-md overflow-hidden bg-background">
        <div className="flex flex-wrap items-center gap-1 p-2 border-b bg-muted/30">
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-1.5 rounded hover:bg-muted ${editor.isActive('bold') ? 'bg-muted text-primary' : ''}`}
            title="Bold"
            type="button"
          >
            <Bold className="h-4 w-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-1.5 rounded hover:bg-muted ${editor.isActive('italic') ? 'bg-muted text-primary' : ''}`}
            title="Italic"
            type="button"
          >
            <Italic className="h-4 w-4" />
          </button>
          <div className="w-px h-6 bg-border mx-1" />
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`p-1.5 rounded hover:bg-muted ${editor.isActive('heading', { level: 1 }) ? 'bg-muted text-primary' : ''}`}
            title="Heading 1"
            type="button"
          >
            <Heading1 className="h-4 w-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`p-1.5 rounded hover:bg-muted ${editor.isActive('heading', { level: 2 }) ? 'bg-muted text-primary' : ''}`}
            title="Heading 2"
            type="button"
          >
            <Heading2 className="h-4 w-4" />
          </button>
          <div className="w-px h-6 bg-border mx-1" />
          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-1.5 rounded hover:bg-muted ${editor.isActive('bulletList') ? 'bg-muted text-primary' : ''}`}
            title="Bullet List"
            type="button"
          >
            <List className="h-4 w-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-1.5 rounded hover:bg-muted ${editor.isActive('orderedList') ? 'bg-muted text-primary' : ''}`}
            title="Ordered List"
            type="button"
          >
            <ListOrdered className="h-4 w-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`p-1.5 rounded hover:bg-muted ${editor.isActive('blockquote') ? 'bg-muted text-primary' : ''}`}
            title="Quote"
            type="button"
          >
            <Quote className="h-4 w-4" />
          </button>
          <div className="w-px h-6 bg-border mx-1" />
          <button
            onClick={setLink}
            className={`p-1.5 rounded hover:bg-muted ${editor.isActive('link') ? 'bg-muted text-primary' : ''}`}
            title="Link"
            type="button"
          >
            <LinkIcon className="h-4 w-4" />
          </button>
          {onImageUpload ? (
            <>
              <button
                onClick={triggerFileUpload}
                className={`p-1.5 rounded hover:bg-muted flex items-center gap-1`}
                title="Upload Gambar"
                type="button"
              >
                <Upload className="h-4 w-4" />
                <span className="text-xs">Upload</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </>
          ) : (
            <button
              onClick={addImageFromUrl}
              className={`p-1.5 rounded hover:bg-muted`}
              title="Image URL"
              type="button"
            >
              <ImageIcon className="h-4 w-4" />
            </button>
          )}
          <div className="flex-grow" />
          <button
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="p-1.5 rounded hover:bg-muted disabled:opacity-30"
            title="Undo"
            type="button"
          >
            <Undo className="h-4 w-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="p-1.5 rounded hover:bg-muted disabled:opacity-30"
            title="Redo"
            type="button"
          >
            <Redo className="h-4 w-4" />
          </button>
        </div>
        
        <EditorContent editor={editor} className="min-h-[150px]" />
      </div>
      
      {error && (
        <p className="text-sm text-destructive mt-1">{error}</p>
      )}

      {selectedImage && (
        <ImageModal
          src={selectedImage.src}
          alt={selectedImage.alt}
          width={selectedImage.width}
          height={selectedImage.height}
          onSave={handleImageSave}
          onCancel={() => setSelectedImage(null)}
        />
      )}

      <div className="text-xs text-muted-foreground mt-2">
        <strong>Tip:</strong> Klik pada gambar untuk mengedit ukuran dan properti gambar.
      </div>
    </div>
  );
}