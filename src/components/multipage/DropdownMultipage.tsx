"use client";

import React, { useEffect, useRef, useState } from 'react';

interface DropdownOption {
  value: string | number;
  label: string;
}

interface DropdownMultipageProps {
  options: DropdownOption[];
  value: string | number | Array<string | number>; // Can be single value or array for multiple selections
  onChange: (value: string | number | Array<string | number>) => void;
  label: string;
  placeholder?: string;
  className?: string;
  required?: boolean;
  isMultiple?: boolean; // New prop to enable multiple selections
}

export function DropdownMultipage({
  options,
  value,
  onChange,
  label,
  placeholder = "Select an option",
  className = "",
  required = false,
  isMultiple = false, // Default to single selection
}: DropdownMultipageProps) {
  
  // For multiple selection dropdown display management
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Convert value to array for consistent handling in multiple mode
  const selectedValues = isMultiple 
    ? Array.isArray(value) ? value : value ? [value] : []
    : Array.isArray(value) ? (value.length > 0 ? value[0] : "") : value;

  // Handle single selection change
  const handleSingleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    const parsedVal = !isNaN(Number(val)) && val !== "" ? Number(val) : val;
    onChange(parsedVal);
  };

  // Handle multiple selection toggle
  const handleMultipleToggle = (optionValue: string | number) => {
    // Convert to number if the value is numeric
    const parsedVal = !isNaN(Number(optionValue.toString())) ? Number(optionValue) : optionValue;
    
    if (!Array.isArray(selectedValues)) {
      // Initialize array with the new value if current value isn't an array
      onChange([parsedVal]);
      return;
    }

    if (selectedValues.includes(parsedVal)) {
      // Remove value if already selected
      onChange(selectedValues.filter(val => val !== parsedVal));
    } else {
      // Add value if not already selected
      onChange([...selectedValues, parsedVal]);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Display selected options as comma-separated text for multiple selection
  const getSelectedLabels = () => {
    if (!Array.isArray(selectedValues) || selectedValues.length === 0) {
      return placeholder;
    }
    
    return selectedValues
      .map(val => options.find(opt => opt.value === val)?.label || "")
      .filter(label => label)
      .join(", ");
  };


  // Render appropriate dropdown based on isMultiple
  if (!isMultiple) {
    // Single selection dropdown (original behavior)
    return (
      <div className={`mb-4 ${className}`}>
        <label className="block text-sm font-medium mb-2">
          {label} {required && <span className="text-destructive">*</span>}
        </label>
        <select
          value={selectedValues.toString()}
          onChange={handleSingleChange}
          className="w-full rounded-md border border-input bg-background p-3 text-sm focus:border-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring transition-all duration-200"
          required={required}
        >
          {placeholder && (
            <option value="">{placeholder}</option>
          )}
          {options.map((option) => (
            <option key={option.value.toString()} value={option.value.toString()}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    );
  } else {
    // Multiple selection custom dropdown
    return (
      <div className={`mb-4 ${className} relative`} ref={dropdownRef}>
        <label className="block text-sm font-medium mb-2">
          {label} {required && <span className="text-destructive">*</span>}
        </label>
        
        {/* Custom dropdown trigger */}
        <div 
          className={`w-full rounded-md border border-input bg-background p-3 text-sm 
          ${isOpen ? 'ring-2 ring-ring border-primary' : ''} 
          focus-within:border-primary cursor-pointer flex justify-between items-center transition-colors duration-200`}
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className={`${Array.isArray(selectedValues) && selectedValues.length > 0 ? 'text-foreground' : 'text-muted-foreground'} truncate`}>
            {Array.isArray(selectedValues) && selectedValues.length > 0 
              ? getSelectedLabels() 
              : placeholder}
          </div>
          <div className="text-muted-foreground">
            <svg 
              className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        
        {/* Dropdown menu */}
        {isOpen && (
          <div className="absolute left-0 right-0 mt-1 bg-popover border border-border rounded-md shadow-lg z-10 max-h-60 overflow-y-auto">
            {options.length === 0 ? (
              <div className="p-2 text-sm text-muted-foreground text-center">No options available</div>
            ) : (
              options.map((option) => {
                const isSelected = Array.isArray(selectedValues) && selectedValues.includes(option.value);
                return (
                  <div 
                    key={option.value.toString()}
                    className={`p-2.5 cursor-pointer text-sm hover:bg-muted flex items-center gap-2 transition-colors
                      ${isSelected ? 'bg-secondary/50' : ''}`}
                    onClick={() => handleMultipleToggle(option.value)}
                  >
                    <div className={`w-4 h-4 rounded border flex items-center justify-center
                      ${isSelected 
                        ? 'bg-primary border-primary' 
                        : 'border-input bg-background'}`}
                    >
                      {isSelected && (
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M8.5 2.5L3.5 7.5L1.5 5.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </div>
                    <span className={isSelected ? 'text-foreground font-medium' : 'text-foreground'}>
                      {option.label}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        )}
        
        {/* Hidden input for form validity if required */}
        {required && (
          <input 
            type="hidden" 
            value={Array.isArray(selectedValues) ? selectedValues.join(',') : ''} 
            required={required && Array.isArray(selectedValues) && selectedValues.length === 0}
          />
        )}
      </div>
    );
  }
}