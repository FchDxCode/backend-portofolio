"use client";

import React, { useEffect, useRef, useState } from "react";

interface DropdownOption {
  value: string | number;
  label: string;
}

interface DropdownMultipageProps {
  options: DropdownOption[];
  value: string | number | Array<string | number>;
  onChange: (value: string | number | Array<string | number>) => void;
  label: string;
  placeholder?: string;
  className?: string;
  required?: boolean;
  isMultiple?: boolean;
}

export function DropdownMultipage({
  options,
  value,
  onChange,
  label,
  placeholder = "Select…",
  className = "",
  required = false,
  isMultiple = false,
}: DropdownMultipageProps) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const selectedValues = isMultiple
    ? Array.isArray(value)
      ? value
      : value
      ? [value]
      : []
    : Array.isArray(value)
    ? value[0] ?? ""
    : value;

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  useEffect(() => {
    if (!isOpen || !menuRef.current) return;
    const rect = menuRef.current.getBoundingClientRect();
    const overflowBottom = rect.bottom - window.innerHeight;
    if (overflowBottom > 0) {
      menuRef.current.style.top = `-${overflowBottom + 8}px`;
    }
  }, [isOpen]);

  const handleSingle = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    const parsed = !isNaN(Number(val)) && val !== "" ? Number(val) : val;
    onChange(parsed);
  };

  const toggleMulti = (optValue: string | number) => {
    const parsed =
      !isNaN(Number(optValue.toString())) ? Number(optValue) : optValue;

    if (!Array.isArray(selectedValues)) {
      onChange([parsed]);
      return;
    }

    if (selectedValues.includes(parsed)) {
      onChange(selectedValues.filter((v) => v !== parsed));
    } else {
      onChange([...selectedValues, parsed]);
    }
  };

  const selectedLabel = () => {
    if (!Array.isArray(selectedValues) || selectedValues.length === 0)
      return placeholder;

    return selectedValues
      .map((v) => options.find((o) => o.value === v)?.label)
      .filter(Boolean)
      .join(", ");
  };

  if (!isMultiple) {
    return (
      <div className={`mb-4 ${className}`}>
        <label className="block text-sm font-medium mb-2">
          {label}
          {required && <span className="text-destructive">*</span>}
        </label>

        <select
          value={selectedValues.toString()}
          onChange={handleSingle}
          required={required}
          className="w-full rounded-md border border-input bg-background p-3 text-sm focus:border-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring transition-all"
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((o) => (
            <option key={o.value.toString()} value={o.value.toString()}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <div className={`mb-4 ${className} relative`} ref={wrapperRef}>
      <label className="block text-sm font-medium mb-2">
        {label}
        {required && <span className="text-destructive">*</span>}
      </label>

      {/* trigger */}
      <button
        type="button"
        onClick={() => setIsOpen((p) => !p)}
        className={`w-full rounded-md border border-input bg-background p-3 text-sm text-left 
          ${isOpen ? "ring-2 ring-ring border-primary" : ""}
          flex justify-between items-center gap-2 transition-colors`}
      >
        <span
          className={`truncate ${
            Array.isArray(selectedValues) && selectedValues.length
              ? "text-foreground"
              : "text-muted-foreground"
          }`}
        >
          {Array.isArray(selectedValues) && selectedValues.length
            ? selectedLabel()
            : placeholder}
        </span>

        <svg
          className={`w-4 h-4 text-muted-foreground transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div
          ref={menuRef}
          className="absolute left-0 right-0 mt-1 z-50 rounded-md border border-border bg-popover shadow-lg
                     max-h-[50vh] overflow-y-auto sm:max-h-60"
        >
          {options.length === 0 ? (
            <div className="p-3 text-sm text-muted-foreground text-center">
              No options
            </div>
          ) : (
            options.map((o) => {
              const active =
                Array.isArray(selectedValues) &&
                selectedValues.includes(o.value);
              return (
                <button
                  key={o.value.toString()}
                  type="button"
                  onClick={() => toggleMulti(o.value)}
                  className={`w-full flex items-center gap-2 p-2.5 text-sm text-left 
                    hover:bg-muted transition-colors ${
                      active ? "bg-secondary/60" : ""
                    }`}
                >
                  {/* checkbox */}
                  <span
                    className={`shrink-0 w-4 h-4 rounded border flex items-center justify-center 
                      ${active ? "bg-primary border-primary" : "border-input"}`}
                  >
                    {active && (
                      <svg
                        width="10"
                        height="10"
                        viewBox="0 0 10 10"
                        fill="none"
                      >
                        <path
                          d="M8.5 2.5L3.5 7.5L1.5 5.5"
                          stroke="white"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </span>

                  <span
                    className={`flex-1 truncate ${
                      active ? "font-medium text-foreground" : "text-foreground"
                    }`}
                  >
                    {o.label}
                  </span>
                </button>
              );
            })
          )}
        </div>
      )}

      {required && (
        <input
          type="hidden"
          required={Array.isArray(selectedValues) && selectedValues.length === 0}
          value={
            Array.isArray(selectedValues) ? selectedValues.join(",") : ""
          }
        />
      )}
    </div>
  );
}
