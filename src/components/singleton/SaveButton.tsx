import React from "react";

interface SaveButtonProps {
  onClick: () => void;
  isLoading?: boolean;
  className?: string;
  variant?: "primary" | "secondary" | "success" | "danger";
  size?: "small" | "medium" | "large";
  children?: React.ReactNode;
}

const SaveButton: React.FC<SaveButtonProps> = ({
  onClick,
  isLoading = false,
  className = "",
  variant = "primary",
  size = "medium",
  children = "Simpan Perubahan"
}) => {
  // Mapping untuk ukuran button
  const sizeClasses = {
    small: "px-4 py-2 text-sm",
    medium: "px-6 py-2.5 text-base",
    large: "px-8 py-3 text-lg"
  };

  // Mapping untuk variant button dengan style outline dan hover
  const variantClasses = {
    primary: `
      border-2 border-[#3b82f6] text-[#3b82f6]
      hover:bg-[#3b82f6] hover:text-white
      focus:ring-[#3b82f6]/50
      before:bg-[#3b82f6]
    `,
    secondary: `
      border-2 border-[#6b7280] text-[#6b7280]
      hover:bg-[#6b7280] hover:text-white
      focus:ring-[#6b7280]/50
      before:bg-[#6b7280]
    `,
    success: `
      border-2 border-[#10b981] text-[#10b981]
      hover:bg-[#10b981] hover:text-white
      focus:ring-[#10b981]/50
      before:bg-[#10b981]
    `,
    danger: `
      border-2 border-[#ef4444] text-[#ef4444]
      hover:bg-[#ef4444] hover:text-white
      focus:ring-[#ef4444]/50
      before:bg-[#ef4444]
    `
  };

  // Loading spinner dengan warna yang menyesuaikan variant
  const LoadingSpinner = () => (
    <svg
      className={`animate-spin -ml-1 mr-2 h-4 w-4`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
  );

  const baseClasses = `
    relative
    overflow-hidden
    font-medium 
    rounded-md 
    inline-flex 
    items-center 
    justify-center
    transition-all 
    duration-300
    transform
    shadow-sm
    hover:shadow-md
    active:scale-95
    disabled:opacity-70 
    disabled:cursor-not-allowed
    disabled:hover:shadow-sm
    disabled:active:scale-100
    focus:outline-none 
    focus:ring-2 
    focus:ring-offset-2
    focus:ring-opacity-50
    group
    ${sizeClasses[size]}
    ${variantClasses[variant]}
    ${className}
  `;

  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className={baseClasses}
    >
      <span className="relative inline-flex items-center gap-2 z-10">
        {isLoading ? (
          <>
            <LoadingSpinner />
            <span className="animate-pulse">Menyimpan...</span>
          </>
        ) : (
          <>
            {/* Icon Save dengan animasi */}
            <svg 
              className="w-4 h-4 mr-1 transition-transform duration-300 group-hover:rotate-12" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
              />
            </svg>
            {/* Text dengan animasi */}
            <span className="transition-transform duration-300 group-hover:translate-x-1">
              {children}
            </span>
          </>
        )}
      </span>
    </button>
  );
};

export default SaveButton;