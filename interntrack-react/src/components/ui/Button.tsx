import React from 'react';
import { cn } from '../../lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, icon, children, disabled, ...props }, ref) => {
    
    const baseStyles = "inline-flex items-center justify-center font-semibold transition-all duration-250 ease-[var(--transition-timing-function-standard)] rounded-md focus:outline-none focus:ring-2 focus:ring-cyan focus:ring-offset-2 focus:ring-offset-base active:scale-95";
    
    const variants = {
      primary: "bg-accent text-white hover:bg-accent/90 hover:shadow-glow-accent border border-transparent",
      secondary: "bg-card border border-border text-primary hover:bg-card-2",
      ghost: "bg-transparent text-secondary hover:bg-card hover:text-primary",
      danger: "bg-danger/10 text-danger border border-danger/30 hover:bg-danger hover:text-white"
    };

    const sizes = {
      sm: "h-8 px-3 text-xs gap-2",
      md: "h-10 px-4 text-sm gap-2",
      lg: "h-12 px-6 text-base gap-2"
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          (disabled || isLoading) && "opacity-40 cursor-not-allowed active:scale-100",
          className
        )}
        {...props}
      >
        {isLoading && (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        )}
        {!isLoading && icon && <span className="flex items-center">{icon}</span>}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
