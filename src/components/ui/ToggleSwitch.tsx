import React from 'react';

export interface ToggleSwitchProps {
  id?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: 'blue' | 'green' | 'red' | 'gray';
  label?: string;
  loading?: boolean;
  className?: string;
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  id,
  checked,
  onChange,
  disabled = false,
  size = 'md',
  color = 'blue',
  label,
  loading = false,
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-8 h-4',
    md: 'w-10 h-5', 
    lg: 'w-12 h-6'
  };

  const thumbSizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  const colorClasses = {
    blue: checked ? 'bg-blue-600' : 'bg-gray-200',
    green: checked ? 'bg-green-600' : 'bg-gray-200', 
    red: checked ? 'bg-red-600' : 'bg-gray-200',
    gray: checked ? 'bg-gray-600' : 'bg-gray-200'
  };

  const handleClick = () => {
    if (!disabled && !loading) {
      onChange(!checked);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div
        id={id}
        role="switch"
        aria-checked={checked}
        aria-disabled={disabled}
        tabIndex={disabled ? -1 : 0}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        className={`
          relative inline-flex items-center rounded-full transition-colors duration-200 ease-in-out cursor-pointer
          ${sizeClasses[size]}
          ${colorClasses[color]}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-80'}
          ${loading ? 'cursor-wait' : ''}
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        `}
      >
        {/* Círculo deslizante */}
        <div
          className={`
            inline-block bg-white rounded-full shadow-lg transform transition-transform duration-200 ease-in-out
            ${thumbSizeClasses[size]}
            ${checked ? 'translate-x-full' : 'translate-x-0.5'}
          `}
        >
          {loading && (
            <div className="flex items-center justify-center w-full h-full">
              <div className="w-2 h-2 border border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
            </div>
          )}
        </div>
      </div>

      {label && (
        <label
          htmlFor={id}
          className={`
            text-sm font-medium cursor-pointer select-none
            ${disabled ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700'}
          `}
          onClick={!disabled ? handleClick : undefined}
        >
          {label}
        </label>
      )}
    </div>
  );
};
