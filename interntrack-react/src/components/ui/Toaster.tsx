import { useToastStore } from '../../hooks/useToast';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';
import { cn } from '../../lib/utils';

export function Toaster() {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed top-6 right-6 z-50 flex flex-col gap-3 w-full max-w-sm pointer-events-none">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';
        const isInfo = toast.type === 'info';

        return (
          <div
            key={toast.id}
            role="status"
            aria-live="polite"
            className={cn(
              "flex items-start gap-3 p-4 bg-card border border-border shadow-modal rounded-lg animate-in slide-in-from-right-8 fade-in duration-normal ease-[var(--transition-timing-function-enter)] pointer-events-auto",
              isSuccess && "border-l-4 border-l-success",
              isError && "border-l-4 border-l-danger",
              isInfo && "border-l-4 border-l-cyan"
            )}
          >
            {isSuccess && <CheckCircle className="h-5 w-5 text-success shrink-0" />}
            {isError && <XCircle className="h-5 w-5 text-danger shrink-0" />}
            {isInfo && <Info className="h-5 w-5 text-cyan shrink-0" />}
            
            <div className="flex-1 flex flex-col gap-1">
              <h4 className="text-sm font-semibold text-primary">{toast.title}</h4>
              {toast.description && <p className="text-caption text-secondary">{toast.description}</p>}
            </div>
            
            <button 
              onClick={() => removeToast(toast.id)}
              className="text-muted hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-cyan rounded"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
