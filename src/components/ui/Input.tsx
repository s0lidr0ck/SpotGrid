import React, { forwardRef, InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helper?: string;
  containerClassName?: string;
  labelClassName?: string;
  inputClassName?: string;
  errorClassName?: string;
  helperClassName?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ 
    label, 
    error, 
    helper, 
    containerClassName = '', 
    labelClassName = '', 
    inputClassName = '', 
    errorClassName = '', 
    helperClassName = '',
    className = '',
    ...props 
  }, ref) => {
    const inputClasses = `
      block w-full px-3 py-2 bg-white border rounded-md shadow-sm
      ${error 
        ? 'border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500' 
        : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
      }
      ${inputClassName}
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
        <input
          ref={ref}
          className={inputClasses}
          {...props}
        />
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

Input.displayName = 'Input';

export default Input;