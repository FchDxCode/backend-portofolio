"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  X,
  Filter as FilterIcon,
  ChevronDown,
  Check,
  RotateCw
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/src/components/ui/tabs";
import { Button } from "./Button";

interface FilterOption {
  label: string;
  value: string;
}

interface FilterGroup {
  label: string;
  options: FilterOption[];
  multiple?: boolean;
}

interface FilterProps {
  onApply: (filters: Record<string, string | string[] | boolean | null>) => void;
  defaultFilters?: Record<string, string | string[] | boolean | null>;
  searchPlaceholder?: string;
  filterOptions?: Record<string, FilterGroup>;
  className?: string;
}

export function Filter({
  onApply,
  defaultFilters = {},
  searchPlaceholder = "Cari...",
  filterOptions = {},
  className = ""
}: FilterProps) {
  const [draft, setDraft] = useState<
    Record<string, string | string[] | boolean | null>
  >(defaultFilters);

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const setDraftValue = (
    key: string,
    value: string | string[] | boolean | null
  ) => {
    setDraft((d) => ({ ...d, [key]: value }));
  };

  const toggleMulti = (key: string, value: string) => {
    setDraft((d) => {
      const arr = (d[key] as string[]) || [];
      const newArr = arr.includes(value)
        ? arr.filter((v) => v !== value)
        : [...arr, value];
      return { ...d, [key]: newArr.length ? newArr : null };
    });
  };

  const apply = () => {
    onApply(draft);
    setIsOpen(false);
  };

  const resetAll = () => {
    setDraft({});
    onApply({});
  };

  const activeBadge = Object.entries(draft).filter(
    ([k, v]) => k !== "search" && v !== null && (!Array.isArray(v) || v.length)
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      apply();
    }, 100);
    
    return () => clearTimeout(timer);
  }, [draft]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className={`space-y-4 w-full ${className}`}>
      {/* Search bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          apply();
        }}
        className="flex flex-col sm:flex-row gap-2 w-full"
      >
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={(draft.search as string) ?? ""}
            onChange={(e) => setDraftValue("search", e.target.value || null)}
            className="w-full pl-9 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <Button type="submit" variant="secondary" className="w-full sm:w-auto">
          Cari
        </Button>
      </form>

      {/* Filter dropdown button */}
      {Object.entries(filterOptions).length > 0 && (
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center justify-between w-full sm:w-auto px-4 py-2 border rounded-md bg-background"
          >
            <div className="flex items-center gap-2">
              <FilterIcon className="h-4 w-4" />
              <span>Filter</span>
              {activeBadge.length > 0 && (
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs">
                  {activeBadge.length}
                </span>
              )}
            </div>
            <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
          </button>

          {/* Dropdown menu */}
          {isOpen && (
            <div 
              ref={dropdownRef}
              className="absolute z-50 left-0 mt-2 w-full sm:w-72 md:w-96 bg-background rounded-md shadow-lg border overflow-hidden"
            >
              <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
                {Object.entries(filterOptions).map(([key, { label, options, multiple }]) => (
                  <div key={key} className="space-y-2">
                    <div className="font-medium text-sm">{label}</div>
                    {multiple ? (
                      <div className="grid grid-cols-2 gap-2">
                        {options.map((option) => {
                          const selected = Array.isArray(draft[key]) && 
                            (draft[key] as string[])?.includes(option.value);
                          return (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() => toggleMulti(key, option.value)}
                              className={`flex items-center justify-between px-3 py-2 text-sm rounded-md ${
                                selected
                                  ? "bg-primary/10 text-primary"
                                  : "hover:bg-muted"
                              }`}
                            >
                              <span>{option.label}</span>
                              {selected && <Check className="h-4 w-4" />}
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="w-full">
                        <Tabs
                          value={(draft[key] as string) || ""}
                          onValueChange={(value) => 
                            setDraftValue(key, value === "" ? null : value)
                          }
                          className="w-full"
                        >
                          <TabsList className="w-full flex flex-wrap h-auto">
                            <TabsTrigger value="" className="flex-grow">Semua</TabsTrigger>
                            {options.map((option) => (
                              <TabsTrigger key={option.value} value={option.value} className="flex-grow">
                                {option.label}
                              </TabsTrigger>
                            ))}
                          </TabsList>
                        </Tabs>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center p-4 border-t">
                <button
                  type="button"
                  onClick={resetAll}
                  className="text-sm text-muted-foreground hover:text-destructive flex items-center gap-1"
                >
                  <RotateCw className="h-3 w-3" />
                  Reset
                </button>
                <Button onClick={apply} size="sm">
                  Terapkan Filter
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Active filter badges */}
      {activeBadge.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {activeBadge.map(([key, value]) => {
            const group = Object.entries(filterOptions).find(
              ([k]) => k === key
            )?.[1];
            
            if (!group) return null;
            
            if (Array.isArray(value)) {
              return value.map((v) => {
                const option = group.options.find((o) => o.value === v);
                return option ? (
                  <Badge
                    key={`${key}-${v}`}
                    label={`${group.label}: ${option.label}`}
                    onClear={() => toggleMulti(key, v)}
                  />
                ) : null;
              });
            }
            
            const option = group.options.find((o) => o.value === value);
            return option ? (
              <Badge
                key={key}
                label={`${group.label}: ${option.label}`}
                onClear={() => setDraftValue(key, null)}
              />
            ) : null;
          })}
          {activeBadge.length > 1 && (
            <button
              onClick={resetAll}
              className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1"
            >
              <RotateCw className="h-3 w-3" />
              Reset Semua
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function Badge({
  label,
  onClear
}: {
  label: string;
  onClear: () => void;
}) {
  return (
    <div className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
      <span>{label}</span>
      <button onClick={onClear} className="hover:text-destructive">
        <X className="h-3 w-3" />
      </button>
    </div>
  );
}