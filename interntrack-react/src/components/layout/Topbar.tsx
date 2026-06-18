import NotificationsMenu from '../NotificationsMenu';
import { Search, Sun, Moon, Menu } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useThemeStore } from '../../store/themeStore';

export function Topbar({ onMenuClick }: { onMenuClick?: () => void }) {
  const location = useLocation();
  const { theme, toggleTheme } = useThemeStore();
  
  const getPageTitle = () => {
    if (location.pathname.includes('dashboard')) return 'Tableau de bord';
    if (location.pathname.includes('internships/new')) return 'Nouveau dossier';
    if (location.pathname.includes('internships')) return 'Mes Stages';
    return 'Espace de gestion';
  };

  return (
    <header className="h-[56px] sticky top-0 z-40 bg-base/95 backdrop-blur-sm border-b border-border flex items-center justify-between px-4 sm:px-6 shrink-0 transition-all">
      <div className="flex-1 flex items-center gap-3 sm:gap-4">
        {onMenuClick && (
          <button 
            onClick={onMenuClick}
            className="sm:hidden p-1.5 -ml-1.5 rounded-md text-muted hover:text-primary hover:bg-white/5 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <h2 className="text-sm font-semibold text-secondary uppercase tracking-wider">{getPageTitle()}</h2>
      </div>
      
      <div className="flex-1 flex justify-center">
        <div className="relative w-full max-w-md hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted pointer-events-none" />
          <input 
            type="text"
            placeholder="Rechercher..."
            className="w-full h-9 bg-card border border-border rounded-full pl-9 pr-4 text-sm text-primary focus:outline-none focus:border-cyan focus:ring-1 focus:ring-cyan/50 transition-colors"
          />
        </div>
      </div>
      
      <div className="flex-1 flex items-center justify-end gap-4">
        <button 
          onClick={toggleTheme}
          className="w-9 h-9 rounded-full hover:bg-card-2 flex items-center justify-center text-muted hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-cyan"
          title={`Passer en mode ${theme === 'dark' ? 'clair' : 'sombre'}`}
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
        <NotificationsMenu />
      </div>
    </header>
  );
}
