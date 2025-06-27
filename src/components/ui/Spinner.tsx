import React from 'react';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const Spinner: React.FC<SpinnerProps> = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div className={`inline-block animate-spin rounded-full border-t-transparent border-solid border-blue-600 ${sizeClasses[size]} ${className}`} role="status">
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export default Spinner;