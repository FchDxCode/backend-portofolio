"use client";

import React from 'react';

interface InputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label: string;
  placeholder?: string;
  className?: string;
  language: string;
  required?: boolean;
  helperText?: string;
}

export function InputMultipage({
    value,
    onChange,
    label,
    placeholder = "",
    className = "",
    language,
    required = false,
    helperText = "",
}: InputProps) {

  
  return (
    <div className={`mb-4 ${className}`}>
      <label className="block text-sm font-medium mb-2">{label}</label>
      <input
        type="text"
        value={value}
        onChange={onChange}
        className="w-full rounded-md border border-input bg-background p-3 text-sm focus:border-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring transition-all duration-200"
        placeholder={placeholder}
        required={required}
      />
      <span className="text-xs text-muted-foreground">{helperText}</span>
    </div>
  );
}