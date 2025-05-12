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
export function PageCustomLoader({ text = "Memuat data..." }: { text?: string }) {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <CustomLoader size="lg" text={text} />
    </div>
  );
}