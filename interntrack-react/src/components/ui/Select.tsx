import React from 'react';
import { cn } from '../../lib/utils';
import { ChevronDown } from 'lucide-react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, helperText, id, children, ...props }, ref) => {
    const selectId = id || Math.random().toString(36).substring(7);
    const hasError = !!error;

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label htmlFor={selectId} className="text-overline uppercase text-muted tracking-wider">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            id={selectId}
            ref={ref}
            className={cn(
              "appearance-none w-full h-10 px-3 bg-input border border-border rounded-md text-sm text-primary placeholder:text-muted transition-colors duration-fast",
              "focus:outline-none focus:border-cyan focus:ring-2 focus:ring-cyan/20",
              hasError && "border-danger focus:border-danger focus:ring-danger/20",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              className
            )}
            {...props}
          >
            {children}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted pointer-events-none" />
        </div>
        {error && <span className="text-caption text-danger">{error}</span>}
        {!error && helperText && <span className="text-caption text-muted">{helperText}</span>}
      </div>
    );
  }
);
Select.displayName = "Select";
