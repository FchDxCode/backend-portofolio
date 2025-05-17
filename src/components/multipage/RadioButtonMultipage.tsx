"use client";

import React from 'react';

interface RadioOption {
  value: string;
  label: string;
}

interface RadioButtonMultipageProps {
  options: RadioOption[];
  value: string;
  onChange: (value: string) => void;
  label: string;
  className?: string;
  language?: string;
}

export function RadioButtonMultipage({
  options,
  value,
  onChange,
  label,
  className = "",
  language,
}: RadioButtonMultipageProps) {
  
  return (
    <div className={`mb-4 ${className}`}>
      <label className="block text-sm font-medium mb-2">{label}</label>
      <div className="flex items-center space-x-4">
        {options.map((option) => (
          <label key={option.value} className="flex items-center space-x-2">
            <input
              type="radio"
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              className="h-4 w-4 text-primary border-gray-300 focus:ring-primary"
            />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}