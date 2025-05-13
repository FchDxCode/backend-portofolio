"use client";

import React, { useState } from "react";
import { Search, X, Filter as FilterIcon, ChevronDown } from "lucide-react";

interface FilterOption {
  label: string;
  value: string;
  group?: string;
}

interface FilterProps {
  onFilterChange: (filters: Record<string, string | string[] | boolean | null>) => void;
  filters?: Record<string, string | string[] | boolean | null>;
  searchPlaceholder?: string;
  filterOptions?: {
    [key: string]: {
      label: string;
      options: FilterOption[];
      multiple?: boolean;
    };
  };
  className?: string;
}

export function Filter({
  onFilterChange,
  filters = {},
  searchPlaceholder = "Cari...",
  filterOptions = {},
  className = ""
}: FilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<Record<string, string | string[] | boolean | null>>(filters);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onFilterChange({ ...activeFilters, search: query || null });
  };

  const handleFilterChange = (key: string, value: string | string[] | boolean | null) => {
    const newFilters = { ...activeFilters, [key]: value };
    setActiveFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleSelectFilter = (key: string, value: string, multiple = false) => {
    if (multiple) {
      const currentValues = (activeFilters[key] as string[]) || [];
      if (currentValues.includes(value)) {
        handleFilterChange(key, currentValues.filter(v => v !== value));
      } else {
        handleFilterChange(key, [...currentValues, value]);
      }
    } else {
      handleFilterChange(key, value);
    }
  };

  const handleClearFilter = (key: string) => {
    const newFilters = { ...activeFilters };
    delete newFilters[key];
    setActiveFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleClearAll = () => {
    const newFilters = { search: activeFilters.search };
    setActiveFilters(newFilters);
    onFilterChange(newFilters);
  };

  const hasActiveFilters = Object.keys(activeFilters).some(key => 
    key !== 'search' && activeFilters[key] !== null && 
    (Array.isArray(activeFilters[key]) ? (activeFilters[key] as string[]).length > 0 : true)
  );

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex flex-col sm:flex-row gap-2">
        {/* Search input */}
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full pl-9 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
        </div>

        {/* Filter toggle */}
        {Object.keys(filterOptions).length > 0 && (
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`flex items-center gap-2 px-3 py-2 rounded-md border ${
              isOpen || hasActiveFilters
                ? "border-primary text-primary"
                : "border-input text-foreground"
            }`}
          >
            <FilterIcon className="h-4 w-4" />
            <span>Filter</span>
            <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
          </button>
        )}
      </div>

      {/* Active filters */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs text-muted-foreground">Filter aktif:</span>
          {Object.keys(activeFilters).map(key => {
            if (key === 'search' || activeFilters[key] === null) return null;
            
            const filterGroup = filterOptions[key];
            if (!filterGroup) return null;
            
            const value = activeFilters[key];
            
            if (Array.isArray(value)) {
              return value.map((v, i) => {
                const option = filterGroup.options.find(opt => opt.value === v);
                return (
                  <div key={`${key}-${i}`} className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                    <span>{filterGroup.label}: {option?.label || v}</span>
                    <button onClick={() => handleSelectFilter(key, v, true)} className="hover:text-destructive">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                );
              });
            }
            
            const option = filterGroup.options.find(opt => opt.value === value);
            return (
              <div key={key} className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                <span>{filterGroup.label}: {option?.label || value}</span>
                <button onClick={() => handleClearFilter(key)} className="hover:text-destructive">
                  <X className="h-3 w-3" />
                </button>
              </div>
            );
          })}
          
          <button 
            onClick={handleClearAll}
            className="text-xs text-muted-foreground hover:text-destructive underline"
          >
            Hapus semua
          </button>
        </div>
      )}

      {/* Filter dropdown */}
      {isOpen && Object.keys(filterOptions).length > 0 && (
        <div className="p-4 border rounded-md bg-card shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(filterOptions).map(([key, filterGroup]) => (
              <div key={key} className="space-y-2">
                <h3 className="text-sm font-medium">{filterGroup.label}</h3>
                <div className="space-y-1">
                  {filterGroup.options.map(option => {
                    const isSelected = filterGroup.multiple 
                      ? Array.isArray(activeFilters[key]) && (activeFilters[key] as string[])?.includes(option.value)
                      : activeFilters[key] === option.value;
                      
                    return (
                      <div key={option.value} className="flex items-center">
                        <label className="flex items-center gap-2 text-sm cursor-pointer">
                          <input
                            type={filterGroup.multiple ? "checkbox" : "radio"}
                            checked={isSelected}
                            onChange={() => handleSelectFilter(key, option.value, filterGroup.multiple)}
                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                          />
                          {option.label}
                        </label>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}