"use client";

import React, { useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import { Bold, Italic, List, ListOrdered, Link, Underline as UnderlineIcon } from 'lucide-react';

interface MultilingualTextareaProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement> | string) => void;
  label: string;
  placeholder?: string;
  className?: string;
  language: string;
  rows?: number;
  useRichText?: boolean;
}

export function MultilingualTextarea({
  value,
  onChange,
  label,
  placeholder = "",
  className = "",
  language,
  rows = 4,
  useRichText = false
}: MultilingualTextareaProps) {
  const languageName = language === 'en' ? 'English' : 'Indonesian';
  const placeholderText = placeholder || `Enter ${label.toLowerCase()} in ${languageName}`;
  
  console.log(`MultilingualTextarea - value untuk ${label} (${language}):`, value);
  
  const editor = useRichText ? useEditor({
    extensions: [
      StarterKit,
      Underline,
      Placeholder.configure({
        placeholder: placeholderText,
      }),
    ],
    content: value || '',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  }) : null;

  useEffect(() => {
    if (editor && value !== undefined && editor.getHTML() !== value) {
      console.log('Updating editor content:', value);
      editor.commands.setContent(value || '');
    }
  }, [editor, value]);

  if (useRichText && !editor) {
    return <div>Loading editor...</div>;
  }

  return (
    <div className={`mb-4 ${className}`}>
      <label className="block text-sm font-medium mb-2">{label}</label>
      
      {useRichText ? (
        <div className="border border-input rounded-md overflow-hidden bg-background">
          {/* Editor toolbar */}
          <div className="flex items-center gap-1 p-1 border-b border-input bg-muted/20">
            <button
              onClick={() => editor?.chain().focus().toggleBold().run()}
              className={`p-1 rounded hover:bg-muted ${editor?.isActive('bold') ? 'bg-muted' : ''}`}
              type="button"
              title="Bold"
            >
              <Bold className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor?.chain().focus().toggleItalic().run()}
              className={`p-1 rounded hover:bg-muted ${editor?.isActive('italic') ? 'bg-muted' : ''}`}
              type="button"
              title="Italic"
            >
              <Italic className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor && editor.chain().focus().toggleUnderline().run()}
              className={`p-1 rounded hover:bg-muted ${editor?.isActive('underline') ? 'bg-muted' : ''}`}
              type="button"
              title="Underline"
            >
              <UnderlineIcon className="w-4 h-4" />
            </button>
            <div className="w-px h-5 bg-muted mx-1"></div>
            <button
              onClick={() => editor?.chain().focus().toggleBulletList().run()}
              className={`p-1 rounded hover:bg-muted ${editor?.isActive('bulletList') ? 'bg-muted' : ''}`}
              type="button"
              title="Bullet List"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor?.chain().focus().toggleOrderedList().run()}
              className={`p-1 rounded hover:bg-muted ${editor?.isActive('orderedList') ? 'bg-muted' : ''}`}
              type="button"
              title="Ordered List"
            >
              <ListOrdered className="w-4 h-4" />
            </button>
          </div>
          
          <EditorContent 
            editor={editor} 
            className="p-3 min-h-[150px] prose prose-sm max-w-none focus:outline-none"
          />
        </div>
      ) : (
        <textarea
          value={value || ''}
          onChange={(e) => onChange(e)}
          rows={rows}
          className="w-full rounded-md border border-input bg-background p-3 text-sm focus:border-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring transition-all duration-200"
          placeholder={placeholderText}
        />
      )}
    </div>
  );
}