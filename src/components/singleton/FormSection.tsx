import React from "react";

interface FormSectionProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
}

const FormSection: React.FC<FormSectionProps> = ({
  children,
  title,
  className = "",
}) => {
  return (
    <div className={`space-y-4 ${className}`}>
      {title && (
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          {title}
        </h3>
      )}
      <div className="space-y-4">{children}</div>
    </div>
  );
};

export default FormSection;