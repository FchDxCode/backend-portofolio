import React from "react";

interface HeroCardProps {
  children: React.ReactNode;
  className?: string;
}

const HeroCard: React.FC<HeroCardProps> = ({ children, className = "" }) => {
  return (
    <div className={`border rounded-lg shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl ${className}`}>
      {children}
    </div>
  );
};

export default HeroCard;