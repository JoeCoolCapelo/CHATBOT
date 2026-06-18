import { useEffect, useState, useRef } from 'react';
import { Bell, Check, Trash2, Info, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function NotificationsMenu() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hasSeenUnread, setHasSeenUnread] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000); // Polling every 15s
    return () => clearInterval(interval);
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications/');
      setNotifications(prev => {
        const currentUnread = prev.filter(n => !n.is_read).length;
        const newUnreadCount = res.data.filter((n: any) => !n.is_read).length;
        // Reset hasSeenUnread if there are strictly more unread notifications now
        if (newUnreadCount > currentUnread && newUnreadCount > 0) {
          setHasSeenUnread(false);
        }
        return res.data;
      });
    } catch (err) {
      console.error(err);
    }
  };

  const markAllRead = async () => {
    try {
      await api.post('/notifications/mark_all_read/');
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
      setHasSeenUnread(false);
    } catch (err) {
      console.error(err);
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;
  const showUnreadBadges = unreadCount > 0 && !hasSeenUnread;

  return (
    <div className="relative" ref={menuRef}>
      <button 
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) {
            setHasSeenUnread(true);
          }
        }} 
        className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-all ${
          isOpen ? 'bg-cyan/20 text-cyan' : 'text-muted hover:bg-white/5 hover:text-primary'
        }`}
      >
        <Bell className="w-5 h-5" />
        {showUnreadBadges && (
          <span className="absolute top-2 right-2.5 w-2 h-2 bg-danger rounded-full ring-2 ring-base animate-pulse"></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-card/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.5)] overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
          <div className="px-5 py-4 border-b border-white/10 flex justify-between items-center bg-white/5">
            <h3 className="font-bold text-primary flex items-center gap-2">
              Notifications
              {showUnreadBadges && (
                <span className="text-[10px] bg-cyan/20 text-cyan px-2 py-0.5 rounded-full font-bold">
                  {unreadCount} nouvelle{unreadCount > 1 ? 's' : ''}
                </span>
              )}
            </h3>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="text-xs text-muted hover:text-cyan transition-colors flex items-center gap-1 group">
                <Check className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" /> Tout lu
              </button>
            )}
          </div>
          
          <div className="max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10">
            {notifications.length === 0 ? (
              <div className="px-5 py-8 text-center flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3">
                  <Bell className="w-5 h-5 text-muted" />
                </div>
                <p className="text-sm font-medium text-primary">Vous êtes à jour</p>
                <p className="text-xs text-secondary mt-1">Aucune nouvelle notification.</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {notifications.map(notif => (
                  <div 
                    key={notif.id} 
                    onClick={() => {
                      if (notif.link) {
                        setIsOpen(false);
                        navigate(notif.link);
                      }
                    }}
                    className={`p-4 transition-colors ${notif.link ? 'cursor-pointer hover:bg-white/10' : 'hover:bg-white/5'} ${!notif.is_read ? 'bg-cyan/5' : ''}`}
                  >
                    <div className="flex gap-3">
                      <div className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                        !notif.is_read ? 'bg-cyan/20 text-cyan' : 'bg-white/10 text-muted'
                      }`}>
                        <Info className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${!notif.is_read ? 'text-primary font-semibold' : 'text-secondary font-medium'}`}>
                          {notif.title || 'Notification'}
                        </p>
                        <p className={`text-sm mt-0.5 leading-snug ${!notif.is_read ? 'text-secondary' : 'text-muted'}`}>
                          {notif.message}
                        </p>
                        <p className="text-xs text-muted mt-2">
                          {new Date(notif.created_at).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      {!notif.is_read && (
                        <div className="w-2 h-2 rounded-full bg-cyan shrink-0 mt-1.5" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="p-2 border-t border-white/10 bg-black/20">
            <button 
              onClick={() => { setIsOpen(false); navigate('/notifications'); }}
              className="w-full py-2 flex items-center justify-center gap-2 text-sm text-cyan hover:bg-cyan/10 rounded-lg transition-colors"
            >
              Voir toutes les notifications <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
