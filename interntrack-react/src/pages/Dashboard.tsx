import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';
import { AppLayout } from '../components/layout/AppLayout';
import { StatCard } from '../components/ui/StatCard';
import { DossierCard } from '../components/ui/DossierCard';
import { TimelineStep } from '../components/ui/TimelineStep';
import { Button } from '../components/ui/Button';
import { useToast } from '../hooks/useToast';
import { Plus, Sparkles } from 'lucide-react';

export default function Dashboard() {
  const user = useAuthStore((state) => state.user);
  const [internships, setInternships] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectModal, setRejectModal] = useState<{ id: string } | null>(null);
  const [rejectComment, setRejectComment] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchInternships();
  }, []);

  const fetchInternships = async () => {
    setLoading(true);
    try {
      const res = await api.get('/internships/');
      setInternships(res.data);
    } catch (err) {
      toast({ type: 'error', title: 'Erreur', description: 'Impossible de charger les données.' });
    } finally {
      setLoading(false);
    }
  };

  const handleValidation = async (id: string, newStatus: string, comment?: string) => {
    try {
      await api.patch(`/internships/${id}/status/`, { status: newStatus, rejection_comment: comment || '' });
      toast({ type: 'success', title: 'Statut mis à jour' });
      setRejectModal(null);
      setRejectComment('');
      fetchInternships();
    } catch (err) {
      toast({ type: 'error', title: 'Erreur', description: 'Une erreur est survenue lors de la validation.' });
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex h-[50vh] items-center justify-center">
          <div className="animate-spin w-8 h-8 border-4 border-cyan border-t-transparent rounded-full"></div>
        </div>
      </AppLayout>
    );
  }

  // ETUDIANT
  if (user?.role === 'student') {
    const currentInternship = internships[0];

    return (
      <AppLayout>
        {/* HERO SECTION */}
        <div className="relative overflow-hidden rounded-3xl mb-10 group">
          {/* Animated Backgrounds */}
          <div className="absolute inset-0 bg-card/80 backdrop-blur-2xl z-0"></div>
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan/20 blur-[120px] rounded-full pointer-events-none group-hover:bg-cyan/30 transition-colors duration-1000 -translate-y-1/2 translate-x-1/3"></div>
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-500/20 blur-[100px] rounded-full pointer-events-none group-hover:bg-purple-500/30 transition-colors duration-1000 translate-y-1/3 -translate-x-1/4"></div>
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] z-0"></div>
          
          <div className="relative z-10 p-8 sm:p-12 border border-white/10 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-500 group-hover:shadow-[0_8px_40px_rgb(0,180,216,0.15)] group-hover:border-cyan/30">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan/10 border border-cyan/20 text-cyan text-xs font-semibold mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <Sparkles className="w-3.5 h-3.5" /> Espace Étudiant
            </div>
            
            <h1 className="text-display-lg text-primary font-extrabold mb-4 tracking-tight leading-tight animate-in fade-in slide-in-from-bottom-5 duration-700 delay-100">
              Bonjour, <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan to-purple-400">{(user as any).first_name || 'Étudiant'}</span>
            </h1>
            
            {currentInternship ? (
              <p className="text-secondary text-lg max-w-2xl leading-relaxed animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200">
                Votre dossier pour <strong className="text-primary bg-white/5 px-2 py-0.5 rounded-md border border-white/10">{currentInternship.company_name}</strong> est {currentInternship.status === 'validated' ? <span className="text-success font-semibold px-2 py-0.5 rounded-md bg-success/10 border border-success/20">validé</span> : <span className="text-warning font-semibold px-2 py-0.5 rounded-md bg-warning/10 border border-warning/20">en cours de traitement</span>}.
              </p>
            ) : (
              <p className="text-secondary text-lg max-w-2xl leading-relaxed animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200">
                Vous n'avez pas encore soumis de dossier de stage. Commencez dès maintenant pour faire valider votre mission par votre enseignant.
              </p>
            )}
            
            <div className="mt-8 flex gap-4 animate-in fade-in slide-in-from-bottom-7 duration-700 delay-300">
              {!currentInternship ? (
                <Button size="lg" icon={<Plus />} onClick={() => navigate('/internships/new')} className="shadow-glow-cyan hover:scale-105 transition-transform duration-300 relative overflow-hidden group/btn">
                  <span className="relative z-10">Créer un dossier</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:animate-[shimmer_1.5s_infinite]"></div>
                </Button>
              ) : (
                <Button size="lg" variant="secondary" onClick={() => navigate(`/internships/${currentInternship.id}`)} className="hover:scale-105 transition-all duration-300 border-white/20 hover:border-cyan/50 hover:bg-cyan/10">
                  Voir mon dossier
                </Button>
              )}
            </div>
          </div>
        </div>

        {currentInternship && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <h2 className="text-h2 mb-6 tracking-tight flex items-center gap-2">
                Suivi du dossier
                <div className="h-px bg-white/10 flex-1 ml-4 hidden sm:block"></div>
              </h2>
              <div className="relative bg-card/50 backdrop-blur-md border border-white/5 rounded-2xl p-6 sm:p-8 shadow-card overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-cyan/10 blur-[50px] pointer-events-none group-hover:bg-cyan/20 transition-colors"></div>
                <div className="relative z-10">
                  <TimelineStep 
                    title="Brouillon créé" 
                    date={new Date(currentInternship.created_at).toLocaleDateString()} 
                    status="completed" 
                  />
                  <TimelineStep 
                    title="Dossier soumis" 
                    date={new Date(currentInternship.created_at).toLocaleDateString()} 
                    status="completed" 
                  />
                  <TimelineStep 
                    title="Validation Enseignant" 
                    actor={currentInternship.teacher?.user?.first_name || 'Enseignant'}
                    status={currentInternship.status === 'validated' ? 'completed' : currentInternship.status === 'rejected' ? 'pending' : 'current'} 
                    comment={currentInternship.status === 'rejected' ? 'Dossier incomplet, merci de rajouter la signature du tuteur.' : undefined}
                  />
                  <TimelineStep 
                    title="Convention éditée" 
                    status={currentInternship.status === 'validated' ? 'current' : 'pending'} 
                    isLast 
                  />
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              <h2 className="text-h2 mb-6 tracking-tight flex items-center gap-2">
                Actions rapides
                <div className="h-px bg-white/10 flex-1 ml-4 hidden sm:block"></div>
              </h2>
              <div className="flex flex-col gap-4">
                <div className="bg-card/40 backdrop-blur-sm border border-white/5 rounded-2xl p-5 shadow-card hover:bg-card/60 transition-all duration-300 cursor-pointer group hover:-translate-y-1 hover:shadow-cyan/10">
                  <div className="w-10 h-10 rounded-full bg-cyan/10 flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-cyan/20 transition-transform text-cyan">
                    <Plus className="w-5 h-5" />
                  </div>
                  <p className="text-sm font-semibold text-primary group-hover:text-cyan transition-colors">Ajouter une annexe</p>
                  <p className="text-xs text-muted mt-1">PDF uniquement, max 5Mo</p>
                </div>
                
                <div className="relative overflow-hidden bg-gradient-to-br from-card/80 to-accent/10 border border-white/10 rounded-2xl p-6 shadow-card group hover:-translate-y-1 hover:shadow-accent/10 transition-all duration-300">
                  <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-accent/20 rounded-full blur-2xl pointer-events-none group-hover:bg-accent/30 transition-colors"></div>
                  <div className="relative z-10">
                    <h4 className="text-xs font-bold text-muted uppercase tracking-wider mb-2">Prochaine échéance</h4>
                    <p className="text-h2 text-cyan font-extrabold tracking-tight mb-1">Dans 14 jours</p>
                    <p className="text-sm text-secondary font-medium">Remise du rapport de mi-stage</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </AppLayout>
    );
  }

  // ENSEIGNANT OR ADMIN
  const pendingCount = internships.filter(i => i.status === 'submitted').length;
  const validatedCount = internships.filter(i => i.status === 'validated').length;

  return (
    <AppLayout>
      <div className="mb-8">
        <h1 className="text-h1 mb-2 tracking-tight">Tableau de bord {user?.role === 'admin' ? 'Administration' : 'Enseignant'}</h1>
        <p className="text-secondary">Voici l'état des dossiers de stage de vos étudiants.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard label="Dossiers en attente" value={pendingCount} trend={{ value: 12, label: "vs hier", positive: false }} delay={0} />
        <StatCard label="Dossiers validés" value={validatedCount} trend={{ value: 5, label: "vs semaine", positive: true }} delay={100} />
        <StatCard label="Taux de validation" value={`${internships.length > 0 ? Math.round((validatedCount/internships.length)*100) : 0}%`} delay={200} />
        {user?.role === 'admin' && <StatCard label="Alertes actives" value="2" trend={{ value: 0, label: "stable", positive: true }} className="border-danger/30" delay={300} />}
      </div>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-h2 tracking-tight">Dossiers récents</h2>
        <div className="flex gap-2">
          <span className="px-3 py-1 bg-accent/15 text-accent font-semibold text-sm rounded-md cursor-pointer border border-accent/20">Tous</span>
          <span className="px-3 py-1 text-secondary hover:bg-card hover:text-primary font-medium text-sm rounded-md cursor-pointer transition-colors border border-transparent hover:border-border">En attente</span>
        </div>
      </div>

      {internships.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center shadow-sm">
          <p className="text-secondary">Aucun dossier de stage trouvé.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {internships.map((internship, idx) => (
            <DossierCard 
              key={internship.id}
              internship={internship}
              onValidate={(id) => handleValidation(id, 'validated')}
              onReject={(id) => setRejectModal({ id })}
              onView={(id) => navigate(`/internships/${id}`)}
              isUrgent={internship.status === 'submitted'}
              delay={idx * 80}
            />
          ))}
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-base/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-card border border-border rounded-xl shadow-2xl p-6 w-full max-w-md animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-primary mb-2">Rejeter le dossier</h3>
            <p className="text-sm text-secondary mb-4">Veuillez indiquer le motif du rejet. L'étudiant devra corriger son dossier en fonction de vos remarques.</p>
            <textarea
              className="w-full bg-input border border-border rounded-lg p-3 text-primary text-sm focus:outline-none focus:ring-2 focus:ring-cyan/50 focus:border-cyan transition-all mb-6 min-h-[120px] resize-none"
              placeholder="Ex: Il manque la signature du tuteur de l'entreprise..."
              value={rejectComment}
              onChange={(e) => setRejectComment(e.target.value)}
            />
            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={() => { setRejectModal(null); setRejectComment(''); }}>Annuler</Button>
              <Button variant="danger" disabled={!rejectComment.trim()} onClick={() => handleValidation(rejectModal.id, 'rejected', rejectComment)}>
                Confirmer le rejet
              </Button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
