import React from 'react';
import { cn } from '../../lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'brouillon' | 'soumis' | 'en_cours' | 'valide' | 'rejete' | 'default';
  pulse?: boolean;
}

export const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = 'default', pulse, children, ...props }, ref) => {
    
    const variants = {
      default: "bg-card-2 text-secondary border-border",
      brouillon: "bg-slate-800 text-slate-300 border-slate-700",
      soumis: "bg-blue-900 text-blue-300 border-blue-800",
      en_cours: "bg-amber-900 text-amber-300 border-amber-800",
      valide: "bg-green-900 text-green-300 border-green-800",
      rejete: "bg-red-900 text-red-300 border-red-800",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold border",
          variants[variant],
          className
        )}
        {...props}
      >
        {pulse && (
          <span className="relative flex h-2 w-2">
            <span className={cn("animate-pulse absolute inline-flex h-full w-full rounded-full opacity-75", 
              variant === 'en_cours' ? 'bg-amber-400' : 'bg-current'
            )}></span>
            <span className={cn("relative inline-flex rounded-full h-2 w-2", 
              variant === 'en_cours' ? 'bg-amber-500' : 'bg-current'
            )}></span>
          </span>
        )}
        {children}
      </div>
    );
  }
);
Badge.displayName = "Badge";
