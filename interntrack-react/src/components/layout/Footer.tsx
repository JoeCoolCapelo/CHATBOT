import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto py-6 border-t border-border/50 bg-transparent text-muted mt-12">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="font-bold text-sm tracking-tight text-primary">
            InternTrack <span className="text-cyan">AI</span>
          </span>
          <span className="text-xs">&copy; {currentYear}. Tous droits réservés.</span>
        </div>

        <div className="flex items-center gap-6 text-xs font-medium">
          <Link to="#" className="hover:text-cyan transition-colors">Mentions légales</Link>
          <Link to="#" className="hover:text-cyan transition-colors">Confidentialité</Link>
          <Link to="#" className="hover:text-cyan transition-colors">Support</Link>
        </div>

        <div className="flex items-center gap-1 text-xs">
          <span>Fait avec</span>
          <Heart className="w-3 h-3 text-danger fill-danger/20" />
          <span>en France</span>
        </div>
      </div>
    </footer>
  );
}
