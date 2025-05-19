"use client";

import React from 'react';

interface InputMultipageProps {
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  label: string;
  placeholder?: string;
  language?: string;
  required?: boolean;
  helperText?: string;
  // Properti penting untuk beragam tipe input
  type?: 'text' | 'number' | 'email' | 'url' | 'tel' | 'date' | 'password';
  multiline?: boolean;
  rows?: number;
  min?: number;
  max?: number;
}

export function InputMultipage({
    value,
    onChange,
    label,
    placeholder = "",
    language = "",
    required = false,
    helperText = "",
    type = "text",
    multiline = false,
    rows = 3,
    min,
    max,
}: InputMultipageProps) {
  
  const inputClasses = "w-full rounded-md border border-input bg-background p-3 text-sm focus:border-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring transition-all duration-200";
  
  // Menampilkan badge bahasa jika ada
  const LanguageBadge = language ? (
    <span className={`absolute top-0 right-0 px-2 py-0.5 text-xs rounded-bl-md rounded-tr-md ${
      language === 'id' ? 'bg-red-500/10 text-red-600' : 'bg-blue-500/10 text-blue-600'
    }`}>
      {language.toUpperCase()}
    </span>
  ) : null;

  return (
    <div className="mb-4 relative">
      <label className="block text-sm font-medium mb-2">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </label>
      
      {multiline ? (
        <textarea
          value={value}
          onChange={onChange}
          className={inputClasses}
          placeholder={placeholder}
          required={required}
          rows={rows}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={onChange}
          className={inputClasses}
          placeholder={placeholder}
          required={required}
          min={type === 'number' ? min : undefined}
          max={type === 'number' ? max : undefined}
        />
      )}
      
      {LanguageBadge}
      
      {helperText && (
        <span className="text-xs text-muted-foreground mt-1 block">{helperText}</span>
      )}
    </div>
  );
}