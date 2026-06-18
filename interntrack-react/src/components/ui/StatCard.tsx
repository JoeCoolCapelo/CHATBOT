import { cn } from '../../lib/utils';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useCountUp, useInView } from '../../hooks/useAnimation';

interface StatCardProps {
  label: string;
  value: string | number;
  trend?: { value: number; label: string; positive: boolean };
  className?: string;
  delay?: number; // stagger delay in ms
}

function AnimatedValue({ value }: { value: string | number }) {
  const isNumber = typeof value === 'number';
  const pctMatch = typeof value === 'string' && value.endsWith('%');
  const numericValue = pctMatch ? parseInt(value) : (isNumber ? (value as number) : NaN);
  const { ref, inView } = useInView();
  const count = useCountUp(isNaN(numericValue) ? 0 : numericValue, 1400, inView);

  if (isNaN(numericValue)) {
    return <span ref={ref}>{value}</span>;
  }

  return (
    <span ref={ref}>
      {count}{pctMatch ? '%' : ''}
    </span>
  );
}

export function StatCard({ label, value, trend, className, delay = 0 }: StatCardProps) {
  const { ref, inView } = useInView();

  return (
    <div
      ref={ref}
      style={{ 
        transitionDelay: `${delay}ms`,
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0) scale(1)' : 'translateY(24px) scale(0.97)',
        transition: `opacity 0.55s ease ${delay}ms, transform 0.55s cubic-bezier(0.34, 1.56, 0.64, 1) ${delay}ms, border-color 0.2s ease, box-shadow 0.2s ease`
      }}
      className={cn(
        "bg-card/40 backdrop-blur-md border border-white/5 rounded-2xl shadow-xl p-6 flex flex-col justify-between group relative overflow-hidden hover:-translate-y-1 hover:border-cyan/30 hover:shadow-[0_0_30px_rgba(0,180,216,0.15)]",
        className
      )}
    >
      {/* Glowing orb on hover */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-cyan/20 rounded-full blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-purple-500/10 rounded-full blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none delay-100" />

      <div className="relative z-10 flex flex-col gap-1">
        <h3 className="text-sm font-semibold text-slate-400 group-hover:text-slate-300 transition-colors uppercase tracking-wider">{label}</h3>
        <p className="text-display-sm font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-400 group-hover:from-cyan group-hover:to-white transition-all duration-300">
          <AnimatedValue value={value} />
        </p>
      </div>
      
      {trend && (
        <div className="relative z-10 flex items-center gap-1.5 mt-4">
          <div className={cn(
            "flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-md",
            trend.positive 
              ? "text-success bg-success/10 border border-success/20" 
              : "text-danger bg-danger/10 border border-danger/20"
          )}>
            {trend.positive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
            {trend.value}%
          </div>
          <span className="text-xs text-slate-500">{trend.label}</span>
        </div>
      )}
    </div>
  );
}
