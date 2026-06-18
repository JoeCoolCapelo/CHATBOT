import React from 'react';
import { cn } from '../../lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, id, ...props }, ref) => {
    const inputId = id || Math.random().toString(36).substring(7);
    const hasError = !!error;

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-overline uppercase text-muted tracking-wider">
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={cn(
            "h-10 px-3 bg-input border border-border rounded-md text-sm text-primary placeholder:text-muted transition-colors duration-fast",
            "focus:outline-none focus:border-cyan focus:ring-2 focus:ring-cyan/20",
            hasError && "border-danger focus:border-danger focus:ring-danger/20",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            className
          )}
          {...props}
        />
        {error && <span className="text-caption text-danger">{error}</span>}
        {!error && helperText && <span className="text-caption text-muted">{helperText}</span>}
      </div>
    );
  }
);
Input.displayName = "Input";
