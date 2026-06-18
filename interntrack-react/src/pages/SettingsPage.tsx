import { useState } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { Save, Shield, Bell, Database, Mail } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useToast } from '../hooks/useToast';
import { Navigate } from 'react-router-dom';

export default function SettingsPage() {
  const user = useAuthStore((state) => state.user);
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // If the user isn't admin/teacher, they probably shouldn't be here, but we'll allow teacher or admin
  if (user && user.role === 'student') {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      toast({
        type: 'success',
        title: 'Paramètres sauvegardés',
        description: 'La configuration globale a été mise à jour avec succès.',
      });
    }, 1000);
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary tracking-tight mb-2">Configuration Système</h1>
          <p className="text-secondary">Gérez les paramètres globaux de la plateforme InternTrack.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          
          {/* Settings Navigation Sidebar */}
          <div className="space-y-2">
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-cyan/10 text-cyan font-semibold border border-cyan/20">
              <Shield className="w-5 h-5" />
              Sécurité
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-muted hover:bg-card hover:text-primary transition-colors">
              <Bell className="w-5 h-5" />
              Notifications Globales
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-muted hover:bg-card hover:text-primary transition-colors">
              <Database className="w-5 h-5" />
              Stockage & Quotas
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-muted hover:bg-card hover:text-primary transition-colors">
              <Mail className="w-5 h-5" />
              Serveur SMTP
            </button>
          </div>

          {/* Settings Content */}
          <div className="md:col-span-3">
            <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-card">
              <h2 className="text-xl font-bold text-primary mb-6">Paramètres de sécurité</h2>
              
              <form onSubmit={handleSave} className="space-y-6">
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-secondary mb-2">Taille maximale des fichiers (PDF)</label>
                    <select className="w-full bg-base border border-border rounded-xl px-4 py-3 text-primary focus:outline-none focus:border-cyan focus:ring-1 focus:ring-cyan/50">
                      <option value="2">2 Mo</option>
                      <option value="5" selected>5 Mo</option>
                      <option value="10">10 Mo</option>
                      <option value="20">20 Mo</option>
                    </select>
                    <p className="text-xs text-muted mt-2">Limite la taille des conventions et rapports uploadés par les étudiants.</p>
                  </div>

                  <div className="pt-4 border-t border-border">
                    <label className="block text-sm font-semibold text-secondary mb-4">Campagne de stages active</label>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-muted mb-1">Date d'ouverture</label>
                        <input type="date" defaultValue="2026-01-01" className="w-full bg-base border border-border rounded-xl px-4 py-2.5 text-primary focus:outline-none focus:border-cyan" />
                      </div>
                      <div>
                        <label className="block text-xs text-muted mb-1">Date de clôture</label>
                        <input type="date" defaultValue="2026-06-30" className="w-full bg-base border border-border rounded-xl px-4 py-2.5 text-primary focus:outline-none focus:border-cyan" />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-primary">Mode maintenance</h4>
                      <p className="text-xs text-muted">Désactive l'accès aux étudiants temporairement.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-card-2 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan"></div>
                    </label>
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-border flex justify-end">
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="flex items-center gap-2 bg-cyan text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-cyan/90 transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-glow-cyan"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Save className="w-5 h-5" />
                    )}
                    Enregistrer les modifications
                  </button>
                </div>
              </form>

            </div>
          </div>
        </div>

      </div>
    </AppLayout>
  );
}
