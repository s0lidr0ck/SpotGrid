import React from 'react';
import { EstimateStatus, getStatusColor, getStatusLabel, getStatusBgColor } from '../../utils/statusUtils';

interface StatusBadgeProps {
  status: EstimateStatus;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  status, 
  className = '',
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-0.5',
    lg: 'text-base px-3 py-1',
  };
  
  const bgColorClass = getStatusBgColor(status);
  const color = getStatusColor(status);
  
  return (
    <span 
      className={`
        inline-flex items-center justify-center font-medium rounded-full
        ${bgColorClass} 
        ${sizeClasses[size]}
        ${className}
      `}
      style={{ color }}
    >
      {getStatusLabel(status)}
    </span>
  );
};