"use client";

import React, { useEffect, useRef, useState } from "react";

interface DropdownOption {
  value: string | number;
  label: string;
}

interface DropdownMultipageProps {
  options: DropdownOption[];
  value: string | number | Array<string | number> | undefined | null; // Allow undefined/null for value
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

  // Logic untuk selectedValues tetap, karena sudah cukup baik menangani array untuk multiple
  // dan single value untuk non-multiple.
  // Untuk kasus !isMultiple, value yang dipakai di <select> akan dihandle khusus.
  const selectedValues = isMultiple
    ? Array.isArray(value)
      ? value
      : value != null // Check for non-null/undefined before wrapping in array
      ? [value]
      : []
    : Array.isArray(value) // Jika !isMultiple dan value adalah array
    ? value[0] // Ambil elemen pertama (meskipun idealnya value bukan array jika !isMultiple)
    : value; // Ambil value apa adanya

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
      // Adjust based on how your layout behaves, this is a simple top adjustment
      menuRef.current.style.transform = `translateY(-${overflowBottom + 8}px)`;
    } else {
      menuRef.current.style.transform = 'translateY(0px)';
    }
  }, [isOpen, options]); // Re-check on options change too, as height might change

  const handleSingle = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    // Parsing ini penting: jika val adalah representasi string dari angka, ubah jadi number.
    // Jika tidak, biarkan sebagai string. Ini memungkinkan value number untuk tahun.
    const parsed = val === "" ? "" : !isNaN(Number(val)) ? Number(val) : val;
    onChange(parsed);
  };

  const toggleMulti = (optValue: string | number) => {
    // Parsing juga penting di sini jika optValue dari options adalah number
    const parsedOptValue = typeof optValue === 'string' && !isNaN(Number(optValue)) 
        ? Number(optValue) 
        : optValue;

    if (!Array.isArray(selectedValues)) {
        // Jika sebelumnya bukan array (misal, null atau undefined), mulai array baru
        onChange([parsedOptValue]);
        return;
    }

    if (selectedValues.includes(parsedOptValue)) {
      onChange(selectedValues.filter((v) => v !== parsedOptValue));
    } else {
      onChange([...selectedValues, parsedOptValue]);
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
    // Penyesuaian untuk value <select> agar selalu string
    const currentSingleSelectValue = selectedValues === undefined || selectedValues === null ? "" : selectedValues.toString();
    return (
      <div className={`mb-4 ${className}`}>
        <label className="block text-sm font-medium mb-2">
          {label}
          {required && <span className="text-destructive">*</span>}
        </label>

        <select
          value={currentSingleSelectValue} // Menggunakan value yang sudah pasti string
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

  // Bagian isMultiple tetap sama, sudah cukup robust.
  return (
    <div className={`mb-4 ${className} relative`} ref={wrapperRef}>
      <label className="block text-sm font-medium mb-2">
        {label}
        {required && <span className="text-destructive">*</span>}
      </label>

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

      {required && Array.isArray(selectedValues) && ( // Hidden input for validation only if multiple and required
        <input
          type="hidden"
          required={selectedValues.length === 0}
          value={selectedValues.join(",")}
          style={{ display: 'none' }} // ensure it's not visible
        />
      )}
    </div>
  );
}