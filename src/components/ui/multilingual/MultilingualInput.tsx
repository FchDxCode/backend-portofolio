"use client";

import React from 'react';

interface MultilingualInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label: string;
  placeholder?: string;
  className?: string;
  language: string;
}

export function MultilingualInput({
  value,
  onChange,
  label,
  placeholder = "",
  className = "",
  language
}: MultilingualInputProps) {
  const languageName = language === 'en' ? 'English' : 'Indonesian';
  
  return (
    <div className={`mb-4 ${className}`}>
      <label className="block text-sm font-medium mb-2">{label}</label>
      <input
        type="text"
        value={value}
        onChange={onChange}
        className="w-full rounded-md border border-input bg-background p-3 text-sm focus:border-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring transition-all duration-200"
        placeholder={placeholder || `Enter ${label.toLowerCase()} in ${languageName}`}
      />
    </div>
  );
}