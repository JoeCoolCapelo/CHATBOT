import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { LayoutDashboard, Briefcase, FileText, FolderOpen, Users, BarChart3, Settings, LogOut, ChevronLeft, ChevronRight, UserCircle, Database, Bot, MessageSquare, X } from 'lucide-react';
import { cn } from '../../lib/utils';

export function Sidebar({ mobileOpen = false, setMobileOpen }: { mobileOpen?: boolean, setMobileOpen?: (open: boolean) => void }) {
  const { user, logout } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const isAdminOrTeacher = user?.role === 'admin' || user?.role === 'teacher';

  const navItems = [
    { title: 'Tableau de bord', icon: LayoutDashboard, path: '/dashboard', show: true },
    { title: 'Chatbot AI', icon: Bot, path: '/chat', show: true },
    { title: 'Mes Stages', icon: Briefcase, path: '/internships', show: user?.role === 'student' },
    { title: 'Documents', icon: FileText, path: '/documents', show: user?.role === 'student' },
    { title: 'Messages', icon: MessageSquare, path: '/messages', show: true },
    { title: 'Dossiers', icon: FolderOpen, path: '/admin', show: isAdminOrTeacher },
    { title: 'Base de données', icon: Database, path: 'http://127.0.0.1:8000/admin/', external: true, show: user?.role === 'admin' },
    { title: 'Utilisateurs', icon: Users, path: '/users', show: user?.role === 'admin' },
    { title: 'Statistiques', icon: BarChart3, path: '/admin', show: user?.role === 'admin' },
    { title: 'Configuration', icon: Settings, path: '/settings', show: user?.role === 'admin' },
    { title: 'Mon Profil', icon: UserCircle, path: '/profile', show: true },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-base/80 backdrop-blur-sm z-[60] sm:hidden"
          onClick={() => setMobileOpen?.(false)}
        />
      )}

      {/* Sidebar Container */}
      <div className={cn(
        "h-screen bg-card border-r border-border flex flex-col transition-all duration-normal ease-[var(--transition-timing-function-standard)] shrink-0 z-[70]",
        collapsed ? "w-[60px]" : "w-[240px]",
        // Mobile positioning
        "fixed sm:relative top-0 left-0",
        mobileOpen ? "translate-x-0" : "-translate-x-full sm:translate-x-0"
      )}>
        {/* Header */}
        <div className={cn("h-[56px] flex items-center px-3 border-b border-border/50 shrink-0", collapsed ? "justify-center" : "justify-between")}>
          <div className={cn("flex items-center gap-2 overflow-hidden transition-all duration-normal", collapsed ? "w-0 opacity-0 hidden" : "w-auto opacity-100")}>
            <div className="w-8 h-8 rounded bg-gradient-to-br from-cyan to-accent flex items-center justify-center shrink-0">
              <span className="font-bold text-white text-sm">IT</span>
            </div>
            <span className="font-bold text-lg tracking-tight text-primary whitespace-nowrap">
              InternTrack <span className="text-cyan">AI</span>
            </span>
          </div>
          
          <button onClick={() => setCollapsed(!collapsed)} className="hidden sm:flex p-1.5 rounded-md hover:bg-card-2 text-muted hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-cyan shrink-0">
            {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
          
          <button onClick={() => setMobileOpen?.(false)} className="sm:hidden p-1.5 rounded-md hover:bg-card-2 text-muted hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-cyan shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>

      {/* Nav */}
      <div className="flex-1 overflow-y-auto py-6 px-3 flex flex-col gap-1.5 scrollbar-thin">
        <div className={cn("text-overline text-muted mb-2 px-3 transition-opacity", collapsed && "opacity-0 hidden")}>Principal</div>
        {navItems.filter(i => i.show).map(item => {
          const commonClasses = cn(
            "h-9 flex items-center gap-3 px-3 rounded-md transition-all duration-fast group overflow-hidden whitespace-nowrap",
            collapsed && "justify-center px-0 border-none"
          );
          
          if (item.external) {
            return (
              <a
                key={item.path}
                href={item.path}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(commonClasses, "text-secondary hover:bg-card hover:text-primary")}
                title={collapsed ? item.title : undefined}
              >
                <item.icon className="w-5 h-5 shrink-0" />
                {!collapsed && <span className="text-sm font-medium">{item.title}</span>}
              </a>
            );
          }

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => cn(
                commonClasses,
                isActive ? "bg-accent/15 text-accent border-l-2 border-accent" : "text-secondary hover:bg-card hover:text-primary"
              )}
              title={collapsed ? item.title : undefined}
              onClick={() => setMobileOpen?.(false)}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {!collapsed && <span className="text-sm font-medium">{item.title}</span>}
            </NavLink>
          );
        })}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-border/50 mt-auto shrink-0">
        <button onClick={() => navigate('/profile')} className={cn("flex items-center gap-3 overflow-hidden mb-4 px-1 transition-all w-full text-left rounded-md hover:bg-card-2 py-1.5 group", collapsed && "hidden")}>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan to-accent flex items-center justify-center text-sm font-bold text-white shrink-0 uppercase">
            {user?.email?.[0] || 'U'}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-primary truncate max-w-[130px] group-hover:text-cyan transition-colors">{(user as any)?.first_name || user?.email}</span>
            <span className="text-caption text-muted capitalize">{user?.role}</span>
          </div>
        </button>
        <button 
          onClick={logout}
          className={cn(
            "w-full h-9 flex items-center gap-3 px-3 rounded-md text-secondary hover:bg-danger/10 hover:text-danger transition-colors group focus:outline-none focus:ring-2 focus:ring-danger",
            collapsed && "justify-center px-0"
          )}
          title={collapsed ? "Déconnexion" : undefined}
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!collapsed && <span className="text-sm font-medium">Déconnexion</span>}
        </button>
      </div>
    </div>
    </>
  );
}
