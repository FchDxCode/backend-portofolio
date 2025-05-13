import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
  showPageNumbers?: boolean;
  disabled?: boolean;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className = "",
  showPageNumbers = true,
  disabled = false
}: PaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className={`flex items-center justify-between ${className}`}>
      <div className="text-sm text-muted-foreground">
        Halaman {currentPage} dari {totalPages}
      </div>
      
      <div className="flex items-center space-x-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1 || disabled}
          className="p-2 rounded-md border border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Halaman sebelumnya"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        
        {showPageNumbers && totalPages <= 5 && (
          <div className="flex items-center space-x-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                disabled={disabled}
                className={`min-w-[2rem] h-8 px-2.5 rounded-md text-sm font-medium ${
                  currentPage === page
                    ? "bg-primary text-primary-foreground"
                    : "border border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {page}
              </button>
            ))}
          </div>
        )}
        
        {showPageNumbers && totalPages > 5 && (
          <div className="flex items-center space-x-1">
            {currentPage > 2 && (
              <button
                onClick={() => onPageChange(1)}
                disabled={disabled}
                className="min-w-[2rem] h-8 px-2.5 rounded-md text-sm font-medium border border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:cursor-not-allowed"
              >
                1
              </button>
            )}
            
            {currentPage > 3 && (
              <span className="px-1 text-muted-foreground">...</span>
            )}
            
            {currentPage > 1 && (
              <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={disabled}
                className="min-w-[2rem] h-8 px-2.5 rounded-md text-sm font-medium border border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {currentPage - 1}
              </button>
            )}
            
            <button
              disabled={true}
              className="min-w-[2rem] h-8 px-2.5 rounded-md text-sm font-medium bg-primary text-primary-foreground"
            >
              {currentPage}
            </button>
            
            {currentPage < totalPages && (
              <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={disabled}
                className="min-w-[2rem] h-8 px-2.5 rounded-md text-sm font-medium border border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {currentPage + 1}
              </button>
            )}
            
            {currentPage < totalPages - 2 && (
              <span className="px-1 text-muted-foreground">...</span>
            )}
            
            {currentPage < totalPages - 1 && (
              <button
                onClick={() => onPageChange(totalPages)}
                disabled={disabled}
                className="min-w-[2rem] h-8 px-2.5 rounded-md text-sm font-medium border border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {totalPages}
              </button>
            )}
          </div>
        )}
        
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages || disabled}
          className="p-2 rounded-md border border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Halaman berikutnya"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}