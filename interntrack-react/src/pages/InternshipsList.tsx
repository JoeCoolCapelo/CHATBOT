import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';
import { AppLayout } from '../components/layout/AppLayout';
import { Button } from '../components/ui/Button';
import { DossierCard } from '../components/ui/DossierCard';
import { useToast } from '../hooks/useToast';
import { Plus, Briefcase } from 'lucide-react';

export default function InternshipsList() {
  const [internships, setInternships] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    fetchInternships();
  }, []);

  const fetchInternships = async () => {
    setLoading(true);
    try {
      const res = await api.get('/internships/');
      setInternships(res.data);
    } catch (err) {
      toast({ type: 'error', title: 'Erreur', description: 'Impossible de charger vos stages.' });
    } finally {
      setLoading(false);
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

  return (
    <AppLayout>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-h1 mb-2 tracking-tight flex items-center gap-3">
            <Briefcase className="w-8 h-8 text-cyan" />
            Mes Stages
          </h1>
          <p className="text-secondary">Gérez l'ensemble de vos conventions de stage et suivez leur état.</p>
        </div>
        <Button 
          icon={<Plus />} 
          onClick={() => navigate('/internships/new')} 
          className="shadow-glow-cyan hover:scale-105 transition-transform duration-300 whitespace-nowrap"
        >
          Nouveau stage
        </Button>
      </div>

      {internships.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center shadow-[0_8px_30px_rgb(0,0,0,0.12)] max-w-2xl mx-auto mt-10">
          <div className="w-20 h-20 rounded-full bg-cyan/10 flex items-center justify-center mx-auto mb-6">
            <Briefcase className="w-10 h-10 text-cyan" />
          </div>
          <h2 className="text-h2 text-primary font-bold mb-3">Aucun stage déclaré</h2>
          <p className="text-secondary mb-8">Vous n'avez pas encore soumis de dossier de stage. Cliquez sur le bouton ci-dessous pour commencer votre déclaration.</p>
          <Button 
            size="lg" 
            icon={<Plus />} 
            onClick={() => navigate('/internships/new')} 
            className="shadow-glow-cyan mx-auto"
          >
            Déclarer mon premier stage
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {internships.map((internship, idx) => (
            <DossierCard 
              key={internship.id}
              internship={internship}
              onView={(id) => navigate(`/internships/${id}`)}
              delay={idx * 80}
            />
          ))}
        </div>
      )}
    </AppLayout>
  );
}
