// src/components/ui/CustomLoader.tsx
"use client";

import React from 'react';
import { cn } from '@/src/lib/utils';

interface CustomLoaderProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  text?: string;
  fullscreen?: boolean;
}

export function CustomLoader({
  className,
  size = 'md',
  color = 'border-primary',
  text,
  fullscreen = false,
}: CustomLoaderProps) {
  // Size mapping in pixels - based on the original design
  const sizeMap = {
    sm: {
      container: 'w-14 h-14', // 56px
      box: 'border-2',
      baseSize: 56,
      borderWidth: 2,
    },
    md: {
      container: 'w-28 h-28', // 112px
      box: 'border-4',
      baseSize: 112,
      borderWidth: 4,
    },
    lg: {
      container: 'w-36 h-36', // 144px
      box: 'border-[6px]',
      baseSize: 144,
      borderWidth: 6,
    },
  };

  const { container, box, baseSize, borderWidth } = sizeMap[size];
  
  // Original proportions from the CSS
  // Original box is 112px wide, with inner boxes at 48px (roughly 3/7 of total)
  const boxUnit = Math.floor(baseSize / 7); // 1 unit size
  const boxDimension = boxUnit * 3;         // 3 units for square boxes
  
  const loaderContent = (
    <div className="flex flex-col items-center justify-center">
      <div className={cn("relative", container, className)}>
        {/* Box 1 - Bottom horizontal box */}
        <div
          className={cn(
            "absolute block box-border", 
            box, 
            color
          )}
          style={{
            width: `${baseSize}px`,            // Full width (7 units)
            height: `${boxDimension}px`,       // 3 units high
            marginTop: `${boxDimension}px`,    // 3 units from top
            marginLeft: '0px',
            animation: 'customBox1 4s 1s forwards ease-in-out infinite'
          }}
        />
        
        {/* Box 2 - Top left box */}
        <div
          className={cn(
            "absolute block box-border", 
            box, 
            color
          )}
          style={{
            width: `${boxDimension}px`,        // 3 units wide
            height: `${boxDimension}px`,       // 3 units high
            marginTop: '0px',
            marginLeft: '0px',
            animation: 'customBox2 4s 1s forwards ease-in-out infinite'
          }}
        />
        
        {/* Box 3 - Top right box */}
        <div
          className={cn(
            "absolute block box-border", 
            box, 
            color
          )}
          style={{
            width: `${boxDimension}px`,        // 3 units wide
            height: `${boxDimension}px`,       // 3 units high
            marginTop: '0px',
            marginLeft: `${boxDimension + borderWidth}px`, // 3 units + border from left
            animation: 'customBox3 4s 1s forwards ease-in-out infinite'
          }}
        />
      </div>
      {text && (
        <p className="mt-4 text-sm text-muted-foreground">{text}</p>
      )}
    </div>
  );

  if (fullscreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        {loaderContent}
      </div>
    );
  }

  return loaderContent;
}

// Page loader version
export function PageLoader({ text = "Memuat data..." }: { text?: string }) {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <CustomLoader size="lg" text={text} />
    </div>
  );
}

// Button Loader - untuk tombol
export function ButtonLoader({ 
  className,
  color = "border-current"
}: {
  className?: string;
  color?: string;
}) {
  return (
    <CustomLoader 
      size="sm" 
      color={color}
      className={cn("w-4 h-4", className)}
    />
  );
}

// Card Loader - untuk loading di dalam card
export function CardLoader({ 
  text,
  className
}: { 
  text?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center p-6", className)}>
      <CustomLoader size="md" />
      {text && <p className="mt-3 text-sm text-muted-foreground">{text}</p>}
    </div>
  );
}

// Skeleton Loader - untuk placeholder content
export function SkeletonLoader({
  height = "h-8",
  width = "w-full",
  className
}: {
  height?: string;
  width?: string;
  className?: string;
}) {
  return (
    <div 
      className={cn(
        "animate-pulse bg-muted rounded-md", 
        height, 
        width, 
        className
      )} 
    />
  );
}

// Inline Loader - untuk text rows
export function InlineLoader({
  className,
  color = "border-primary"
}: {
  className?: string;
  color?: string;
}) {
  return (
    <div className={cn("inline-flex items-center", className)}>
      <div className="relative w-4 h-4 mr-2">
        <div className="absolute w-4 h-4 rounded-full animate-ping bg-primary/30" />
        <div className={cn("absolute w-3 h-3 rounded-full", color)} />
      </div>
      <span>Loading...</span>
    </div>
  );
}