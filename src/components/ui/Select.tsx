import React, { forwardRef, SelectHTMLAttributes } from 'react';

interface SelectOption {
  value: string | number;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  options: SelectOption[];
  label?: string;
  error?: string;
  helper?: string;
  containerClassName?: string;
  labelClassName?: string;
  selectClassName?: string;
  errorClassName?: string;
  helperClassName?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ 
    options, 
    label, 
    error, 
    helper, 
    containerClassName = '', 
    labelClassName = '', 
    selectClassName = '', 
    errorClassName = '', 
    helperClassName = '',
    className = '',
    ...props 
  }, ref) => {
    const selectClasses = `
      block w-full px-3 py-2 bg-white border rounded-md shadow-sm appearance-none
      ${error 
        ? 'border-red-300 text-red-900 focus:outline-none focus:ring-red-500 focus:border-red-500' 
        : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
      }
      ${selectClassName}
      ${className}
    `;

    return (
      <div className={`mb-4 ${containerClassName}`}>
        {label && (
          <label 
            htmlFor={props.id || props.name} 
            className={`block text-sm font-medium text-gray-700 mb-1 ${labelClassName}`}
          >
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            className={selectClasses}
            {...props}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
            <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
              <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 011.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path>
            </svg>
          </div>
        </div>
        {helper && !error && (
          <p className={`mt-1 text-sm text-gray-500 ${helperClassName}`}>
            {helper}
          </p>
        )}
        {error && (
          <p className={`mt-1 text-sm text-red-600 ${errorClassName}`}>
            {error}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;