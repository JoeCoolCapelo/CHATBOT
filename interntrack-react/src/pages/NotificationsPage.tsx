import { useEffect, useState } from 'react';
import { Bell, Check, Trash2, Info, ExternalLink } from 'lucide-react';
import api from '../services/api';
import { AppLayout } from '../components/layout/AppLayout';
import { useToast } from '../hooks/useToast';
import { Button } from '../components/ui/Button';
import { useNavigate } from 'react-router-dom';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.get('/notifications/');
      setNotifications(res.data);
    } catch (err) {
      toast({ type: 'error', title: 'Erreur', description: 'Impossible de charger les notifications.' });
    } finally {
      setLoading(false);
    }
  };

  const markAllRead = async () => {
    try {
      await api.post('/notifications/mark_all_read/');
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
      toast({ type: 'success', title: 'Notifications mises à jour' });
    } catch (err) {
      toast({ type: 'error', title: 'Erreur', description: 'Impossible de mettre à jour.' });
    }
  };

  const deleteNotification = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      await api.delete(`/notifications/${id}/`);
      setNotifications(notifications.filter(n => n.id !== id));
      toast({ type: 'success', title: 'Notification supprimée' });
    } catch (err) {
      toast({ type: 'error', title: 'Erreur', description: 'Impossible de supprimer la notification.' });
    }
  };

  const handleNotificationClick = (notif: any) => {
    if (!notif.is_read) {
      // Optimistically mark as read locally, actual update could be done via another endpoint, 
      // but marking all as read is what we have right now.
    }
    if (notif.link) {
      navigate(notif.link);
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-display-sm text-primary font-bold tracking-tight flex items-center gap-3">
              <Bell className="w-8 h-8 text-cyan" />
              Notifications
            </h1>
            <p className="text-secondary mt-1">Historique de vos alertes et messages système.</p>
          </div>
          {unreadCount > 0 && (
            <Button variant="secondary" icon={<Check />} onClick={markAllRead}>
              Tout marquer comme lu
            </Button>
          )}
        </div>

        <div className="bg-card/40 backdrop-blur-md border border-white/5 rounded-2xl shadow-xl overflow-hidden">
          {loading ? (
            <div className="p-8 flex justify-center">
              <div className="animate-spin w-8 h-8 border-4 border-cyan border-t-transparent rounded-full"></div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-16 text-center">
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                <Bell className="w-10 h-10 text-slate-400" />
              </div>
              <h2 className="text-h3 font-bold text-white mb-2">Aucune notification</h2>
              <p className="text-slate-400">Vous êtes à jour ! Vous n'avez pas de nouvelles alertes.</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {notifications.map((notif) => (
                <div 
                  key={notif.id} 
                  onClick={() => handleNotificationClick(notif)}
                  className={`p-6 flex flex-col sm:flex-row gap-4 sm:items-center justify-between transition-colors ${notif.link ? 'cursor-pointer hover:bg-white/10' : 'hover:bg-white/5'} ${!notif.is_read ? 'bg-cyan/5' : ''}`}
                >
                  <div className="flex gap-4 items-start sm:items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                      !notif.is_read ? 'bg-cyan/20 text-cyan' : 'bg-white/10 text-slate-400'
                    }`}>
                      <Info className="w-5 h-5" />
                    </div>
                    <div>
                      <p className={`text-base ${!notif.is_read ? 'text-white font-semibold' : 'text-slate-300'}`}>
                        {notif.message}
                      </p>
                      <p className="text-sm text-slate-500 mt-1 flex items-center gap-2">
                        {new Date(notif.created_at).toLocaleString('fr-FR', {
                          day: '2-digit', month: 'long', year: 'numeric',
                          hour: '2-digit', minute: '2-digit'
                        })}
                        {notif.link && (
                          <span className="flex items-center gap-1 text-cyan text-xs font-medium ml-2">
                            <ExternalLink className="w-3 h-3" /> Voir les détails
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-2 shrink-0">
                    <button 
                      onClick={(e) => deleteNotification(notif.id, e)}
                      className="p-2 text-slate-500 hover:text-danger hover:bg-danger/10 rounded-lg transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
