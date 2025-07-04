
import React from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

const Textarea: React.FC<TextareaProps> = ({ label, id, error, className, ...props }) => {
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <textarea
        id={id}
        rows={4}
        className={`block w-full px-3 py-2 border ${error ? 'border-danger' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none ${error ? 'focus:ring-danger focus:border-danger' : 'focus:ring-primary focus:border-primary'} sm:text-sm ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  );
};

export default Textarea;
