import React from "react";

interface SectionTitleProps {
  title: string;
  subtitle?: string;
  className?: string;
}

const SectionTitle: React.FC<SectionTitleProps> = ({
  title,
  subtitle,
  className = "",
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        {title}
      </h1>
      {subtitle && (
        <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
      )}
    </div>
  );
};

export default SectionTitle;