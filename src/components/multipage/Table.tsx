"use client";

import React, { useState } from "react";
import { ArrowUpDown, ArrowUp, ArrowDown, ChevronLeft, ChevronRight } from "lucide-react";

export interface Column<T> {
  header: string;
  accessor: keyof T | ((item: T) => React.ReactNode);
  className?: string;
  sortable?: boolean;
}

export interface ActionButton<T> {
  label: string;
  icon?: React.ReactNode;
  onClick: (item: T) => void;
  variant?: "primary" | "secondary" | "success" | "danger";
  disabled?: boolean | ((item: T) => boolean);
  hidden?: boolean | ((item: T) => boolean);
}

interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  actions?: ActionButton<T>[];
  keyField: keyof T;
  isLoading?: boolean;
  emptyMessage?: string;
  className?: string;
  onRowClick?: (item: T) => void;
  pagination?: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  };
}

export function Table<T>({
  data,
  columns,
  actions = [],
  keyField,
  isLoading = false,
  emptyMessage = "Tidak ada data",
  className = "",
  onRowClick,
  pagination
}: TableProps<T>) {
  const [sortField, setSortField] = useState<keyof T | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const handleSort = (field: keyof T, sortable?: boolean) => {
    if (!sortable) return;
    
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedData = React.useMemo(() => {
    if (!sortField) return data;

    return [...data].sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];

      if (aValue === bValue) return 0;
      
      // Handle null or undefined values
      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      // Compare based on type
      const result = 
        typeof aValue === 'string' && typeof bValue === 'string'
          ? aValue.localeCompare(bValue)
          : (aValue < bValue ? -1 : 1);
      
      return sortDirection === "asc" ? result : -result;
    });
  }, [data, sortField, sortDirection]);

  // Action button component
  const ActionButton = ({ action, item }: { action: ActionButton<T>, item: T }) => {
    const isDisabled = typeof action.disabled === 'function' ? action.disabled(item) : action.disabled;
    const isHidden = typeof action.hidden === 'function' ? action.hidden(item) : action.hidden;
    
    if (isHidden) return null;
    
    // Styling based on variant
    const variantClasses = {
      primary: `bg-primary text-primary-foreground hover:bg-primary/90`,
      secondary: `bg-secondary text-secondary-foreground hover:bg-secondary/80`,
      success: `bg-emerald-500 text-white hover:bg-emerald-600`,
      danger: `bg-destructive text-destructive-foreground hover:bg-destructive/90`
    };

    return (
      <button
        onClick={() => action.onClick(item)}
        disabled={isDisabled}
        className={`
          px-2.5 py-1.5 text-xs font-medium rounded-md
          transition-colors
          flex items-center gap-1.5
          disabled:opacity-50 disabled:cursor-not-allowed
          ${variantClasses[action.variant || 'primary']}
        `}
      >
        {action.icon}
        {action.label}
      </button>
    );
  };

  if (isLoading) {
    return (
      <div className="w-full overflow-hidden rounded-lg border border-border bg-card shadow-sm">
        <div className="h-64 flex items-center justify-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="w-full overflow-hidden rounded-lg border border-border bg-card shadow-sm">
        <div className="h-64 flex flex-col items-center justify-center text-center p-4">
          <div className="w-16 h-16 mb-4 text-muted-foreground">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <p className="text-muted-foreground font-medium">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full overflow-hidden rounded-lg border border-border bg-card shadow-sm ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full divide-y divide-border">
          <thead className="bg-muted/50">
            <tr>
              {columns.map((column, index) => {
                const isSortable = typeof column.accessor === 'string' && column.sortable !== false;
                const isSorted = sortField === column.accessor;
                
                return (
                  <th
                    key={index}
                    className={`px-4 py-3.5 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider ${
                      isSortable ? 'cursor-pointer select-none' : ''
                    } ${column.className || ''}`}
                    onClick={() => isSortable && handleSort(column.accessor as keyof T, isSortable)}
                  >
                    <div className="flex items-center gap-2">
                      <span>{column.header}</span>
                      {isSortable && (
                        <span className="inline-flex">
                          {isSorted ? (
                            sortDirection === 'asc' ? (
                              <ArrowUp className="h-4 w-4" />
                            ) : (
                              <ArrowDown className="h-4 w-4" />
                            )
                          ) : (
                            <ArrowUpDown className="h-4 w-4 opacity-50" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
              {actions.length > 0 && (
                <th className="px-4 py-3.5 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Aksi
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {sortedData.map((item) => (
              <tr 
                key={String(item[keyField])}
                className={`bg-card hover:bg-muted/30 ${onRowClick ? 'cursor-pointer' : ''}`}
                onClick={() => onRowClick && onRowClick(item)}
              >
                {columns.map((column, colIndex) => {
                  const value = typeof column.accessor === 'function' 
                    ? column.accessor(item) 
                    : item[column.accessor as keyof T];
                  
                  return (
                    <td 
                      key={colIndex} 
                      className={`px-4 py-3 whitespace-nowrap ${column.className || ''}`}
                    >
                      {value as React.ReactNode}
                    </td>
                  );
                })}
                {actions.length > 0 && (
                  <td className="px-4 py-3 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-2">
                      {actions.map((action, actionIndex) => (
                        <ActionButton 
                          key={actionIndex} 
                          action={action} 
                          item={item} 
                        />
                      ))}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 bg-card border-t border-border">
          <div className="text-sm text-muted-foreground">
            Halaman {pagination.currentPage} dari {pagination.totalPages}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage <= 1}
              className="p-2 rounded-md border border-border bg-card text-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage >= pagination.totalPages}
              className="p-2 rounded-md border border-border bg-card text-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}