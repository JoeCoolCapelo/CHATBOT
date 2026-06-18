import { cn } from '../../lib/utils';
import { Check } from 'lucide-react';

interface TimelineStepProps {
  title: string;
  date?: string;
  actor?: string;
  comment?: string;
  status: 'completed' | 'current' | 'pending';
  isLast?: boolean;
}

export function TimelineStep({ title, date, actor, comment, status, isLast }: TimelineStepProps) {
  return (
    <div className="relative flex gap-4">
      {/* Connector line */}
      {!isLast && (
        <div className={cn(
          "absolute left-[11px] top-6 bottom-[-16px] w-[2px]",
          status === 'completed' ? "bg-cyan" : "bg-border"
        )} />
      )}
      
      {/* Circle */}
      <div className={cn(
        "relative z-10 w-6 h-6 rounded-full shrink-0 flex items-center justify-center mt-1 border-2 bg-base",
        status === 'completed' ? "border-cyan bg-cyan text-base" :
        status === 'current' ? "border-cyan" : "border-muted"
      )}>
        {status === 'completed' && <Check className="w-3 h-3 text-base" />}
        {status === 'current' && (
          <span className="w-2 h-2 rounded-full bg-cyan animate-pulse" />
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col pb-6">
        <h4 className={cn(
          "font-semibold text-sm",
          status === 'completed' ? "text-cyan" :
          status === 'current' ? "text-primary" : "text-muted"
        )}>{title}</h4>
        
        {date && (
          <p className="text-caption text-secondary mt-0.5 flex items-center">
            {date} {actor && <span className="px-1.5 py-0.5 ml-2 bg-card-2 border border-border rounded text-[10px] font-bold tracking-wider uppercase text-muted">{actor}</span>}
          </p>
        )}
        
        {comment && (
          <p className="text-sm text-secondary bg-card-2 p-3 rounded-md mt-2 border border-border/50">
            {comment}
          </p>
        )}
      </div>
    </div>
  );
}
