import React from "react";

interface FormSectionProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  className?: string;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  actions?: React.ReactNode;
}

export function FormSection({
  children,
  title,
  description,
  className = "",
  collapsible = false,
  defaultCollapsed = false,
  actions
}: FormSectionProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed);

  return (
    <div className={`space-y-4 ${className}`}>
      {(title || description || actions) && (
        <div className={`flex justify-between items-start ${collapsible ? 'cursor-pointer' : ''}`}>
          <div 
            onClick={collapsible ? () => setIsCollapsed(!isCollapsed) : undefined}
            className={collapsible ? 'cursor-pointer flex-grow' : ''}
          >
            {title && (
              <h3 className="text-base font-medium text-foreground flex items-center gap-2">
                {title}
                {collapsible && (
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="16" 
                    height="16" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                    className={`transition-transform ${isCollapsed ? '' : 'rotate-180'}`}
                  >
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                )}
              </h3>
            )}
            {description && (
              <p className="text-sm text-muted-foreground mt-1">{description}</p>
            )}
          </div>
          
          {actions && (
            <div className="flex items-center gap-2">
              {actions}
            </div>
          )}
        </div>
      )}
      
      {(!collapsible || !isCollapsed) && (
        <div className="space-y-4">
          {children}
        </div>
      )}
    </div>
  );
}