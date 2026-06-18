import { Link } from 'react-router-dom';
import { Home, AlertTriangle } from 'lucide-react';
import { AppLayout } from '../components/layout/AppLayout';

export default function NotFound() {
  return (
    <AppLayout>
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
        <div className="w-20 h-20 bg-card border border-border rounded-2xl flex items-center justify-center mb-6 shadow-glow-cyan relative overflow-hidden">
          <div className="absolute inset-0 bg-cyan/10" />
          <AlertTriangle className="w-10 h-10 text-cyan relative z-10" />
        </div>
        
        <h1 className="text-display-lg text-primary mb-2">404</h1>
        <h2 className="text-h2 text-secondary mb-6">Page introuvable</h2>
        
        <p className="text-muted max-w-md mb-10">
          Oups ! Le lien que vous avez suivi est peut-être rompu, ou la page a été supprimée. 
          Vérifiez l'URL ou retournez à l'accueil.
        </p>
        
        <Link 
          to="/dashboard"
          className="inline-flex items-center gap-2 bg-cyan text-white px-6 py-3 rounded-xl font-semibold hover:bg-cyan/90 transition-all shadow-glow-cyan"
        >
          <Home className="w-5 h-5" />
          Retour au tableau de bord
        </Link>
      </div>
    </AppLayout>
  );
}
