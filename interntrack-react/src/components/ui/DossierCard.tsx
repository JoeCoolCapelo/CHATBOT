import { StatusBadge } from './StatusBadge';
import { Calendar, Briefcase, Building2, Clock } from 'lucide-react';
import { Button } from './Button';
import { useInView } from '../../hooks/useAnimation';

interface DossierCardProps {
  internship: any;
  onValidate?: (id: string) => void;
  onReject?: (id: string) => void;
  onView?: (id: string) => void;
  isUrgent?: boolean;
  delay?: number;
}

export function DossierCard({ internship, onValidate, onReject, onView, isUrgent, delay = 0 }: DossierCardProps) {
  const { ref, inView } = useInView();
  return (
    <div 
      ref={ref}
      onClick={() => onView?.(internship.id)}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0) scale(1)' : 'translateY(28px) scale(0.96)',
        transition: `opacity 0.5s ease ${delay}ms, transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) ${delay}ms`
      }}
      className="bg-card border border-border rounded-lg shadow-card p-6 flex flex-col gap-4 hover:border-accent/40 hover:shadow-glow-accent transition-all duration-normal group cursor-pointer"
    >
      <div className="flex justify-between items-start">
        <div className="flex gap-3 items-center">
          <div className="w-10 h-10 rounded-full bg-card-2 flex items-center justify-center text-primary font-bold border border-border">
            {internship.student?.user?.first_name?.[0] || 'A'}
          </div>
          <div>
            <h4 className="font-semibold text-primary">{internship.student?.user?.first_name} {internship.student?.user?.last_name}</h4>
            <p className="text-caption text-secondary">{internship.student?.department || 'Informatique'}</p>
          </div>
        </div>
        {isUrgent && (
          <span className="px-2 py-1 bg-danger/10 text-danger border border-danger/30 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
            <Clock className="w-3 h-3" /> Urgent
          </span>
        )}
      </div>

      <div className="space-y-2 py-3 border-y border-border/50">
        <div className="flex items-center gap-2 text-sm text-secondary">
          <Building2 className="w-4 h-4 text-muted shrink-0" />
          <span className="truncate">{internship.company_name}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-secondary">
          <Briefcase className="w-4 h-4 text-muted shrink-0" />
          <span className="truncate">{internship.job_title}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-secondary">
          <Calendar className="w-4 h-4 text-muted shrink-0" />
          <span>Du {internship.start_date} au {internship.end_date}</span>
        </div>
      </div>

      <div className="flex justify-between items-end mt-auto">
        <div className="flex flex-col gap-1">
          <StatusBadge status={internship.status} />
          <span className="text-caption text-muted">Soumis {internship.created_at ? new Date(internship.created_at).toLocaleDateString() : 'Récemment'}</span>
        </div>
        <div className="flex gap-2 lg:opacity-0 group-hover:opacity-100 transition-opacity duration-fast" onClick={e => e.stopPropagation()}>
          {internship.status === 'submitted' && onValidate && onReject && (
            <>
              <Button variant="danger" size="sm" onClick={(e) => { e.stopPropagation(); onReject(internship.id); }}>Rejeter</Button>
              <Button variant="primary" size="sm" onClick={(e) => { e.stopPropagation(); onValidate(internship.id); }}>Valider</Button>
            </>
          )}
          {onView && (!onValidate || internship.status !== 'submitted') && (
             <Button variant="secondary" size="sm" onClick={(e) => { e.stopPropagation(); onView(internship.id); }}>Détails</Button>
          )}
        </div>
      </div>
    </div>
  );
}
