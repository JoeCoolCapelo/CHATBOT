import { useEffect, useState } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import api from '../services/api';
import { useToast } from '../hooks/useToast';
import { Users, Shield, BookOpen, Search, UserCheck, MoreVertical } from 'lucide-react';
import { Skeleton } from '../components/ui/Skeleton';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

interface UserData {
  id: string;
  email: string;
  role: 'student' | 'teacher' | 'admin';
  is_active: boolean;
  created_at: string;
}

export default function UsersPage() {
  const currentUser = useAuthStore(state => state.user);
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { toast } = useToast();

  if (currentUser?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users/');
      setUsers(res.data);
    } catch {
      toast({ type: 'error', title: 'Erreur', description: 'Impossible de charger les utilisateurs.' });
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(u => u.email.toLowerCase().includes(search.toLowerCase()));

  const stats = {
    total: users.length,
    students: users.filter(u => u.role === 'student').length,
    teachers: users.filter(u => u.role === 'teacher').length,
    admins: users.filter(u => u.role === 'admin').length,
  };

  const RoleIcon = ({ role }: { role: string }) => {
    if (role === 'admin') return <Shield className="w-4 h-4 text-purple-400" />;
    if (role === 'teacher') return <BookOpen className="w-4 h-4 text-orange-400" />;
    return <UserCheck className="w-4 h-4 text-cyan-400" />;
  };

  const roleColors: Record<string, string> = {
    admin: 'bg-purple-400/10 text-purple-400 border-purple-400/20',
    teacher: 'bg-orange-400/10 text-orange-400 border-orange-400/20',
    student: 'bg-cyan-400/10 text-cyan-400 border-cyan-400/20',
  };

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary tracking-tight mb-2">Gestion des Utilisateurs</h1>
          <p className="text-secondary">Visualisez et gérez les comptes de la plateforme InternTrack AI.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-card border border-border rounded-xl p-5 shadow-card">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-lg bg-base flex items-center justify-center">
                <Users className="w-4 h-4 text-primary" />
              </div>
              <p className="text-xs uppercase tracking-wider text-muted font-semibold">Total inscrits</p>
            </div>
            <p className="text-2xl font-bold text-primary">{stats.total}</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-5 shadow-card">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-lg bg-cyan-400/10 flex items-center justify-center">
                <UserCheck className="w-4 h-4 text-cyan-400" />
              </div>
              <p className="text-xs uppercase tracking-wider text-muted font-semibold">Étudiants</p>
            </div>
            <p className="text-2xl font-bold text-primary">{stats.students}</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-5 shadow-card">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-lg bg-orange-400/10 flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-orange-400" />
              </div>
              <p className="text-xs uppercase tracking-wider text-muted font-semibold">Enseignants</p>
            </div>
            <p className="text-2xl font-bold text-primary">{stats.teachers}</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-5 shadow-card">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-lg bg-purple-400/10 flex items-center justify-center">
                <Shield className="w-4 h-4 text-purple-400" />
              </div>
              <p className="text-xs uppercase tracking-wider text-muted font-semibold">Administrateurs</p>
            </div>
            <p className="text-2xl font-bold text-primary">{stats.admins}</p>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              type="text"
              placeholder="Rechercher par adresse email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-card border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-primary focus:outline-none focus:border-cyan focus:ring-1 focus:ring-cyan/20 transition-colors"
            />
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-card border border-border rounded-xl shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left bg-card-2/50">
                  <th className="px-6 py-4 text-xs font-semibold text-muted uppercase tracking-wider">Email</th>
                  <th className="px-6 py-4 text-xs font-semibold text-muted uppercase tracking-wider">Rôle</th>
                  <th className="px-6 py-4 text-xs font-semibold text-muted uppercase tracking-wider">Statut</th>
                  <th className="px-6 py-4 text-xs font-semibold text-muted uppercase tracking-wider">Inscription</th>
                  <th className="px-6 py-4 text-xs font-semibold text-muted uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 5 }).map((_, j) => (
                        <td key={j} className="px-6 py-4"><Skeleton className="h-4 w-full" /></td>
                      ))}
                    </tr>
                  ))
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-muted">
                      Aucun utilisateur trouvé.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-card-2/30 transition-colors">
                      <td className="px-6 py-4 font-medium text-primary">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-base flex items-center justify-center font-bold text-xs uppercase border border-border">
                            {u.email.charAt(0)}
                          </div>
                          {u.email}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold border ${roleColors[u.role]}`}>
                          <RoleIcon role={u.role} />
                          {u.role.charAt(0).toUpperCase() + u.role.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {u.is_active ? (
                          <span className="flex items-center gap-1.5 text-xs text-success">
                            <span className="w-1.5 h-1.5 rounded-full bg-success"></span> Actif
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 text-xs text-muted">
                            <span className="w-1.5 h-1.5 rounded-full bg-muted"></span> Inactif
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-secondary">
                        {new Date(u.created_at).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="p-1.5 rounded-md hover:bg-card-2 text-muted hover:text-primary transition-colors">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
