import React from "react";

interface DetailViewProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}

export function DetailView({
  children,
  title,
  description,
  actions,
  className = ""
}: DetailViewProps) {
  return (
    <div className={`bg-card rounded-lg border border-border shadow-sm overflow-hidden ${className}`}>
      {(title || actions) && (
        <div className="px-6 py-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            {title && (
              <h3 className="text-lg font-medium leading-6 text-card-foreground">
                {title}
              </h3>
            )}
            {description && (
              <p className="mt-1 text-sm text-muted-foreground">
                {description}
              </p>
            )}
          </div>
          
          {actions && (
            <div className="flex items-center gap-2 shrink-0">
              {actions}
            </div>
          )}
        </div>
      )}
      
      <div className="p-6">
        {children}
      </div>
    </div>
  );
}

interface DetailItemProps {
  label: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

export function DetailItem({
  label,
  children,
  icon,
  className = ""
}: DetailItemProps) {
  return (
    <div className={`mb-4 ${className}`}>
      <div className="flex items-center gap-2 mb-1">
        {icon && (
          <span className="text-muted-foreground">{icon}</span>
        )}
        <dt className="text-sm font-medium text-muted-foreground">
          {label}
        </dt>
      </div>
      <dd className="mt-1 text-sm text-foreground ml-0 pl-0">
        {children || <span className="text-muted-foreground italic">Tidak ada data</span>}
      </dd>
    </div>
  );
}