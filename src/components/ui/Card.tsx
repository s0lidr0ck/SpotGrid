import React, { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  title?: string | ReactNode;
  subtitle?: string | ReactNode;
  footer?: ReactNode;
  className?: string;
  headerClassName?: string;
  bodyClassName?: string;
  footerClassName?: string;
}

const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  footer,
  className = '',
  headerClassName = '',
  bodyClassName = '',
  footerClassName = '',
}) => {
  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      {(title || subtitle) && (
        <div className={`p-4 border-b border-gray-200 ${headerClassName}`}>
          {title && (
            typeof title === 'string' 
              ? <h3 className="text-lg font-medium text-gray-900">{title}</h3>
              : title
          )}
          {subtitle && (
            typeof subtitle === 'string'
              ? <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
              : subtitle
          )}
        </div>
      )}
      <div className={`p-4 ${bodyClassName}`}>
        {children}
      </div>
      {footer && (
        <div className={`p-4 border-t border-gray-200 ${footerClassName}`}>
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;