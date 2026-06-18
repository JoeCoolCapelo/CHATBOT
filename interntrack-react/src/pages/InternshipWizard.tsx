import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AppLayout } from '../components/layout/AppLayout';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { FileUpload } from '../components/ui/FileUpload';
import { useToast } from '../hooks/useToast';
import { CheckCircle2, ChevronRight, Save } from 'lucide-react';
import { cn } from '../lib/utils';

export default function InternshipWizard() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    company_name: '',
    job_title: '',
    start_date: '',
    end_date: '',
    description: '',
  });
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const submitForm = async () => {
    setLoading(true);
    try {
      const res = await api.post('/internships/', { ...formData, status: 'submitted' });
      const internshipId = res.data.id;
      
      if (file) {
        const formDataFile = new FormData();
        formDataFile.append('file', file);
        formDataFile.append('type', 'convention');
        formDataFile.append('internship_id', internshipId.toString());
        
        await api.post(`/documents/upload/`, formDataFile, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      
      toast({ type: 'success', title: 'Dossier soumis', description: 'Votre demande de stage a été envoyée.' });
      navigate('/internships');
    } catch (err) {
      toast({ type: 'error', title: 'Erreur', description: "Impossible de soumettre le dossier." });
    } finally {
      setLoading(false);
    }
  };

  const saveDraft = async () => {
    setLoading(true);
    try {
      const res = await api.post('/internships/', { ...formData, status: 'draft' });
      const internshipId = res.data.id;
      
      if (file) {
        const formDataFile = new FormData();
        formDataFile.append('file', file);
        formDataFile.append('type', 'convention');
        formDataFile.append('internship_id', internshipId.toString());
        
        await api.post(`/documents/upload/`, formDataFile, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      
      toast({ type: 'success', title: 'Brouillon sauvegardé', description: 'Votre brouillon a été enregistré.' });
      navigate('/internships');
    } catch (err) {
      toast({ type: 'error', title: 'Erreur', description: "Impossible de sauvegarder le brouillon." });
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { num: 1, title: 'Informations' },
    { num: 2, title: 'Entreprise' },
    { num: 3, title: 'Documents' },
    { num: 4, title: 'Récapitulatif' }
  ];

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
        
        {step < 5 && (
          <div className="mb-10">
            <h1 className="text-h1 mb-8 tracking-tight">Déclarer un nouveau stage</h1>
            <div className="flex items-center justify-between relative">
              <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[2px] bg-card-2 -z-10"></div>
              <div className="absolute left-0 top-1/2 -translate-y-1/2 h-[2px] bg-cyan -z-10 transition-all duration-[500ms] ease-out" style={{ width: `${((step - 1) / 3) * 100}%` }}></div>
              
              {steps.map(s => (
                <div key={s.num} className="flex flex-col items-center gap-2">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all duration-[500ms] ease-out shadow-sm",
                    step > s.num ? "bg-cyan border-cyan text-base" : 
                    step === s.num ? "bg-card border-cyan text-cyan scale-110" : 
                    "bg-base border-card-2 text-muted"
                  )}>
                    {step > s.num ? <CheckCircle2 className="w-5 h-5" /> : s.num}
                  </div>
                  <span className={cn(
                    "text-caption font-semibold uppercase tracking-wider hidden sm:block",
                    step >= s.num ? "text-primary" : "text-muted"
                  )}>{s.title}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-card border border-border rounded-xl shadow-card overflow-hidden">
          {step === 1 && (
            <div className="p-8 animate-in fade-in slide-in-from-right-8 duration-normal ease-[var(--transition-timing-function-standard)]">
              <h2 className="text-h2 mb-2 tracking-tight">Informations Générales</h2>
              <p className="text-secondary mb-8">Renseignez les informations globales concernant la mission de stage.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input label="Intitulé du poste" name="job_title" value={formData.job_title} onChange={handleChange} placeholder="Développeur React..." />
                <div className="hidden md:block"></div>
                <Input label="Date de début" name="start_date" type="date" value={formData.start_date} onChange={handleChange} />
                <Input label="Date de fin" name="end_date" type="date" value={formData.end_date} onChange={handleChange} />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="p-8 animate-in fade-in slide-in-from-right-8 duration-normal ease-[var(--transition-timing-function-standard)]">
              <h2 className="text-h2 mb-2 tracking-tight">L'Entreprise</h2>
              <p className="text-secondary mb-8">Informations concernant la structure d'accueil.</p>
              
              <div className="space-y-6">
                <Input label="Nom de l'entreprise" name="company_name" value={formData.company_name} onChange={handleChange} placeholder="Apple, Microsoft..." />
                
                <div className="flex flex-col gap-1.5">
                  <label className="text-overline uppercase text-muted tracking-wider">Description des missions</label>
                  <textarea 
                    name="description" 
                    value={formData.description} 
                    onChange={handleChange} 
                    className="w-full min-h-[120px] bg-input border border-border rounded-md p-3 text-sm text-primary placeholder:text-muted focus:outline-none focus:border-cyan focus:ring-2 focus:ring-cyan/20 resize-y transition-colors duration-fast"
                    placeholder="Décrivez vos missions principales..."
                  />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="p-8 animate-in fade-in slide-in-from-right-8 duration-normal ease-[var(--transition-timing-function-standard)]">
              <h2 className="text-h2 mb-2 tracking-tight">Documents Requis</h2>
              <p className="text-secondary mb-8">Uploadez la convention signée par l'entreprise.</p>
              
              <FileUpload onFileSelect={setFile} selectedFile={file} />
            </div>
          )}

          {step === 4 && (
            <div className="p-8 animate-in fade-in slide-in-from-right-8 duration-normal ease-[var(--transition-timing-function-standard)]">
              <h2 className="text-h2 mb-2 tracking-tight">Récapitulatif</h2>
              <p className="text-secondary mb-8">Vérifiez vos informations avant de soumettre définitivement le dossier.</p>
              
              <div className="bg-base rounded-lg p-6 space-y-6 border border-border/50 shadow-inner">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-caption text-muted uppercase tracking-wider mb-1">Entreprise</h4>
                    <p className="font-semibold text-primary">{formData.company_name || '—'}</p>
                  </div>
                  <div>
                    <h4 className="text-caption text-muted uppercase tracking-wider mb-1">Poste</h4>
                    <p className="font-semibold text-primary">{formData.job_title || '—'}</p>
                  </div>
                  <div>
                    <h4 className="text-caption text-muted uppercase tracking-wider mb-1">Période</h4>
                    <p className="font-semibold text-primary">{formData.start_date || '—'} au {formData.end_date || '—'}</p>
                  </div>
                  <div>
                    <h4 className="text-caption text-muted uppercase tracking-wider mb-1">Document</h4>
                    <p className="font-semibold flex items-center text-success">
                      {file ? <><CheckCircle2 className="w-4 h-4 mr-1.5"/> Joint ({file.name})</> : <span className="text-danger">Manquant</span>}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 bg-warning/10 border border-warning/30 p-4 rounded-lg flex gap-3 animate-in fade-in duration-normal">
                <div className="w-6 h-6 rounded-full bg-warning/20 flex items-center justify-center shrink-0">
                  <span className="text-warning font-bold text-sm">!</span>
                </div>
                <p className="text-sm text-warning/90">
                  En soumettant ce dossier, vous confirmez l'exactitude des informations. Le dossier sera transmis à votre enseignant référent.
                </p>
              </div>
            </div>
          )}

          {/* Success Step removed since we navigate away instantly */}
          
          {/* Footer Navigation */}
          {step < 5 && (
            <div className="p-6 border-t border-border bg-card-2/30 flex justify-between items-center">
              <div className="flex gap-2">
                <Button variant="ghost" className="text-muted hover:text-danger hover:bg-danger/10" onClick={() => navigate('/internships')}>Annuler</Button>
                {step > 1 && (
                  <Button variant="ghost" onClick={() => setStep(s => s - 1)}>Précédent</Button>
                )}
              </div>
              
              <div className="flex gap-4">
                <Button variant="secondary" icon={<Save className="w-4 h-4"/>} className="hidden sm:inline-flex" onClick={saveDraft} isLoading={loading}>Sauvegarder Brouillon</Button>
                {step < 4 ? (
                  <Button onClick={() => setStep(s => s + 1)}>
                    Suivant <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                ) : (
                  <Button onClick={submitForm} isLoading={loading} disabled={!file}>
                    Soumettre le dossier
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
