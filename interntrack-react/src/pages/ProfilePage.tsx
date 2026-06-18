import { useState } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { useAuthStore } from '../store/authStore';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useToast } from '../hooks/useToast';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Shield, LogOut, KeyRound, Bell, Save, Edit2 } from 'lucide-react';
import api from '../services/api';

export default function ProfilePage() {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const { toast } = useToast();

  const [editingName, setEditingName] = useState(false);
  const [firstName, setFirstName] = useState(user?.first_name || '');
  const [lastName, setLastName] = useState(user?.last_name || '');
  const [savingName, setSavingName] = useState(false);

  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [pwdLoading, setPwdLoading] = useState(false);

  const [notifEmail, setNotifEmail] = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSaveName = async () => {
    setSavingName(true);
    try {
      const res = await api.patch('/auth/me/', { first_name: firstName, last_name: lastName });
      setUser({ ...user!, first_name: res.data.first_name, last_name: res.data.last_name });
      toast({ type: 'success', title: 'Profil mis à jour', description: 'Vos informations ont été enregistrées.' });
      setEditingName(false);
    } catch {
      toast({ type: 'error', title: 'Erreur', description: 'Impossible de mettre à jour le profil.' });
    } finally {
      setSavingName(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPwd !== confirmPwd) {
      toast({ type: 'error', title: 'Erreur', description: 'Les mots de passe ne correspondent pas.' });
      return;
    }
    if (newPwd.length < 8) {
      toast({ type: 'error', title: 'Erreur', description: 'Le mot de passe doit faire au moins 8 caractères.' });
      return;
    }
    setPwdLoading(true);
    try {
      await api.post('/auth/change-password/', { current_password: currentPwd, new_password: newPwd });
      toast({ type: 'success', title: 'Mot de passe mis à jour', description: 'Votre mot de passe a été changé avec succès.' });
      setCurrentPwd(''); setNewPwd(''); setConfirmPwd('');
    } catch (err: any) {
      const msg = err?.response?.data?.current_password?.[0] || 'Impossible de changer le mot de passe.';
      toast({ type: 'error', title: 'Erreur', description: msg });
    } finally {
      setPwdLoading(false);
    }
  };

  const roleLabel: Record<string, string> = {
    student: 'Étudiant',
    teacher: 'Enseignant',
    admin: 'Administrateur',
  };
  const roleColor: Record<string, string> = {
    student: 'bg-cyan-400/10 text-cyan-400 border-cyan-400/20',
    teacher: 'bg-purple-400/10 text-purple-400 border-purple-400/20',
    admin: 'bg-orange-400/10 text-orange-400 border-orange-400/20',
  };

  const displayName = (user?.first_name || user?.last_name)
    ? `${user?.first_name} ${user?.last_name}`.trim()
    : user?.email?.split('@')[0];

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-primary tracking-tight mb-8">Mon profil</h1>

        {/* Profile Header */}
        <div className="bg-gradient-to-r from-card to-card-2 border border-white/10 rounded-2xl p-8 mb-6 shadow-xl relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_#00B4D8_0%,_transparent_60%)] opacity-10 pointer-events-none" />
          <div className="relative z-10 flex items-center gap-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 shrink-0">
              <span className="text-3xl font-bold text-white">
                {(user?.first_name?.[0] || user?.email?.[0] || 'U').toUpperCase()}
              </span>
            </div>
            <div className="flex-1">
              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border mb-2 ${roleColor[user?.role || 'student']}`}>
                <Shield className="w-3 h-3" />
                {roleLabel[user?.role || 'student']}
              </div>
              {editingName ? (
                <div className="flex gap-3 mt-1 items-center flex-wrap">
                  <input
                    className="bg-base border border-border rounded-lg px-3 py-1.5 text-primary text-sm focus:outline-none focus:border-cyan w-32"
                    value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Prénom"
                  />
                  <input
                    className="bg-base border border-border rounded-lg px-3 py-1.5 text-primary text-sm focus:outline-none focus:border-cyan w-32"
                    value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Nom"
                  />
                  <Button size="sm" onClick={handleSaveName} isLoading={savingName} icon={<Save className="w-3 h-3"/>}>
                    Sauvegarder
                  </Button>
                  <button onClick={() => setEditingName(false)} className="text-muted hover:text-primary text-sm">Annuler</button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold text-primary">{displayName}</h2>
                  <button onClick={() => setEditingName(true)} className="text-muted hover:text-cyan transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
              )}
              <p className="text-secondary flex items-center gap-1.5 mt-1">
                <Mail className="w-4 h-4" />
                {user?.email}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Account Info */}
          <div className="bg-card border border-white/10 rounded-2xl p-6 shadow-card">
            <h2 className="text-lg font-bold text-primary mb-5 flex items-center gap-2">
              <User className="w-5 h-5 text-cyan" /> Informations du compte
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted mb-1">Adresse email</p>
                <p className="text-primary font-medium">{user?.email}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-muted mb-1">Rôle</p>
                <p className="text-primary font-medium">{roleLabel[user?.role || 'student']}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-muted mb-1">Identifiant</p>
                <p className="text-muted font-mono text-sm truncate">{user?.id}</p>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-card border border-white/10 rounded-2xl p-6 shadow-card">
            <h2 className="text-lg font-bold text-primary mb-5 flex items-center gap-2">
              <Bell className="w-5 h-5 text-cyan" /> Préférences de notifications
            </h2>
            <div className="space-y-4">
              <label className="flex items-center justify-between cursor-pointer group">
                <div>
                  <p className="text-sm font-medium text-primary">Notifications par email</p>
                  <p className="text-xs text-muted">Recevoir les mises à jour par email</p>
                </div>
                <button
                  onClick={() => setNotifEmail(!notifEmail)}
                  className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none ${notifEmail ? 'bg-cyan' : 'bg-card-2'}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${notifEmail ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <p className="text-sm font-medium text-primary">Notifications dans l'app</p>
                  <p className="text-xs text-muted">Toujours activées</p>
                </div>
                <div className="w-11 h-6 rounded-full bg-cyan opacity-60 relative cursor-not-allowed">
                  <span className="absolute top-0.5 right-0.5 w-5 h-5 bg-white rounded-full shadow" />
                </div>
              </label>
            </div>
          </div>

          {/* Change Password */}
          <div className="bg-card border border-white/10 rounded-2xl p-6 shadow-card md:col-span-2">
            <h2 className="text-lg font-bold text-primary mb-5 flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-cyan" /> Changer le mot de passe
            </h2>
            <form onSubmit={handleChangePassword} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input label="Mot de passe actuel" type="password" placeholder="••••••••" value={currentPwd} onChange={(e) => setCurrentPwd(e.target.value)} required />
              <Input label="Nouveau mot de passe" type="password" placeholder="••••••••" value={newPwd} onChange={(e) => setNewPwd(e.target.value)} required />
              <Input label="Confirmer" type="password" placeholder="••••••••" value={confirmPwd} onChange={(e) => setConfirmPwd(e.target.value)} required />
              <div className="md:col-span-3 flex justify-end">
                <Button type="submit" isLoading={pwdLoading}>Mettre à jour le mot de passe</Button>
              </div>
            </form>
          </div>

          {/* Danger zone */}
          <div className="bg-red-950/20 border border-red-500/20 rounded-2xl p-6 shadow-card md:col-span-2">
            <h2 className="text-lg font-bold text-red-400 mb-2 flex items-center gap-2">
              <LogOut className="w-5 h-5" /> Déconnexion
            </h2>
            <p className="text-secondary text-sm mb-4">Vous serez redirigé vers la page de connexion.</p>
            <Button variant="secondary" onClick={handleLogout} className="border-red-500/30 text-red-400 hover:bg-red-500/10">
              <LogOut className="w-4 h-4 mr-2" /> Se déconnecter
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
