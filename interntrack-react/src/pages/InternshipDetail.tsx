import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';
import { AppLayout } from '../components/layout/AppLayout';
import { Button } from '../components/ui/Button';
import { useToast } from '../hooks/useToast';
import {
  ArrowLeft, Building2, Briefcase, CalendarDays, FileText,
  CheckCircle2, Clock, XCircle, AlertCircle, User, Download,
  Mail, Phone, GraduationCap, BadgeCheck, MessageSquare, Send, TriangleAlert, Plus
} from 'lucide-react';
import { FileUpload } from '../components/ui/FileUpload';

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any; bg: string }> = {
  draft:      { label: 'Brouillon',        color: 'text-slate-400',  icon: Clock,         bg: 'bg-slate-400/10' },
  submitted:  { label: 'Soumis',           color: 'text-blue-400',   icon: AlertCircle,   bg: 'bg-blue-400/10'  },
  validating: { label: 'En validation',    color: 'text-yellow-400', icon: Clock,         bg: 'bg-yellow-400/10'},
  validated:  { label: 'Validé',           color: 'text-emerald-400',icon: CheckCircle2,  bg: 'bg-emerald-400/10'},
  rejected:   { label: 'Rejeté',           color: 'text-red-400',    icon: XCircle,       bg: 'bg-red-400/10'   },
};

export default function InternshipDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const user = useAuthStore((state) => state.user);
  const [internship, setInternship] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [rejectModal, setRejectModal] = useState(false);
  const [rejectComment, setRejectComment] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadType, setUploadType] = useState('');
  const [uploadingDoc, setUploadingDoc] = useState(false);

  const fetchInternship = async () => {
    try {
      const res = await api.get(`/internships/${id}/`);
      setInternship(res.data);
      fetchMessages(res.data.id);
    } catch {
      toast({ type: 'error', title: 'Erreur', description: 'Impossible de charger ce dossier.' });
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchInternship();
  }, [id]);

  const fetchMessages = async (internshipId: string) => {
    try {
      const res = await api.get(`/internships/${internshipId}/messages/`);
      setMessages(res.data);
    } catch { /* silent */ }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !internship) return;
    setSendingMsg(true);
    try {
      const res = await api.post(`/internships/${internship.id}/messages/`, { content: newMessage.trim() });
      setMessages(prev => [...prev, res.data]);
      setNewMessage('');
    } catch {
      toast({ type: 'error', title: 'Erreur', description: 'Impossible d\'envoyer le message.' });
    } finally {
      setSendingMsg(false);
    }
  };

  const handleUploadDocument = async () => {
    if (!uploadFile || !id) return;
    setUploadingDoc(true);
    try {
      const formDataFile = new FormData();
      formDataFile.append('file', uploadFile);
      formDataFile.append('type', uploadType);
      formDataFile.append('internship_id', id);
      
      await api.post(`/documents/upload/`, formDataFile, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      toast({ type: 'success', title: 'Succès', description: 'Document ajouté avec succès.' });
      setShowUploadModal(false);
      setUploadFile(null);
      fetchInternship();
    } catch (err) {
      toast({ type: 'error', title: 'Erreur', description: 'Impossible d\'ajouter le document.' });
    } finally {
      setUploadingDoc(false);
    }
  };

  const handleValidation = async (newStatus: string, comment?: string) => {
    try {
      await api.patch(`/internships/${internship.id}/status/`, { status: newStatus, rejection_comment: comment || '' });
      setInternship({ ...internship, status: newStatus });
      setRejectModal(false);
      setRejectComment('');
      toast({ type: 'success', title: newStatus === 'validated' ? 'Dossier validé !' : 'Dossier rejeté' });
    } catch {
      toast({ type: 'error', title: 'Erreur', description: 'Mise à jour impossible.' });
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

  if (!internship) return null;

  const DJANGO_BASE = 'http://127.0.0.1:8001';
  const normalizeUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    const path = url.startsWith('/media/') ? url : `/media${url}`;
    return `${DJANGO_BASE}${path}`;
  };

  const statusConf = STATUS_CONFIG[internship.status] || STATUS_CONFIG.draft;
  const StatusIcon = statusConf.icon;
  const createdDate = new Date(internship.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

  const timelineSteps = [
    { label: 'Dossier créé',         done: true,                                       date: createdDate },
    { label: 'Dossier soumis',        done: ['submitted','validating','validated','rejected'].includes(internship.status) },
    { label: 'En cours de validation',done: ['validating','validated','rejected'].includes(internship.status) },
    { label: 'Décision finale',       done: ['validated','rejected'].includes(internship.status),
      success: internship.status === 'validated', rejected: internship.status === 'rejected' },
  ];

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto">

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Retour
        </button>

        {/* Header card */}
        <div className="bg-gradient-to-r from-card to-card-2 border border-white/10 rounded-2xl p-8 mb-6 shadow-xl relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_#00B4D8_0%,_transparent_60%)] opacity-10 pointer-events-none" />
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-3 ${statusConf.bg} ${statusConf.color}`}>
                <StatusIcon className="w-3.5 h-3.5" />
                {statusConf.label}
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tight">{internship.job_title}</h1>
              <p className="text-slate-400 mt-1 flex items-center gap-1.5">
                <Building2 className="w-4 h-4" />
                {internship.company_name}
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-xs text-slate-500 uppercase tracking-wider">Créé le</p>
              <p className="text-white font-semibold">{createdDate}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* LEFT: Main info */}
          <div className="lg:col-span-2 space-y-6">

            {/* Infos stage */}
            <div className="bg-card border border-white/10 rounded-2xl p-6 shadow-card">
              <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-cyan-400" /> Informations du stage
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <p className="text-xs uppercase tracking-wider text-slate-500 mb-1">Entreprise</p>
                  <p className="text-white font-semibold">{internship.company_name}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-slate-500 mb-1">Poste</p>
                  <p className="text-white font-semibold">{internship.job_title}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-1">
                    <CalendarDays className="w-3.5 h-3.5" /> Date de début
                  </p>
                  <p className="text-white font-semibold">{new Date(internship.start_date).toLocaleDateString('fr-FR')}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-1">
                    <CalendarDays className="w-3.5 h-3.5" /> Date de fin
                  </p>
                  <p className="text-white font-semibold">{new Date(internship.end_date).toLocaleDateString('fr-FR')}</p>
                </div>
                {internship.supervisor_name && (
                  <div>
                    <p className="text-xs uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-1">
                      <User className="w-3.5 h-3.5" /> Tuteur entreprise
                    </p>
                    <p className="text-white font-semibold">{internship.supervisor_name}</p>
                    {internship.supervisor_email && (
                      <p className="text-slate-400 text-sm">{internship.supervisor_email}</p>
                    )}
                  </div>
                )}
                {internship.description && (
                  <div className="sm:col-span-2">
                    <p className="text-xs uppercase tracking-wider text-slate-500 mb-1">Description des missions</p>
                    <p className="text-slate-300 text-sm leading-relaxed">{internship.description}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Student Info — visible by teacher/admin */}
            {(user?.role === 'teacher' || user?.role === 'admin') && internship.student && (
              <div className="bg-card border border-white/10 rounded-2xl p-6 shadow-card">
                <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-cyan-400" /> Informations du stagiaire
                </h2>
                <div className="flex items-center gap-4 mb-6 p-4 bg-white/5 rounded-xl border border-white/10">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-cyan-400 to-accent flex items-center justify-center text-white text-xl font-bold shrink-0">
                    {internship.student?.user?.first_name?.[0] || 'E'}
                  </div>
                  <div>
                    <p className="text-white font-bold text-lg">{internship.student?.user?.first_name} {internship.student?.user?.last_name}</p>
                    <p className="text-slate-400 text-sm flex items-center gap-1">
                      <BadgeCheck className="w-3.5 h-3.5 text-cyan-400" />
                      {internship.student?.department || 'Département non renseigné'}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-cyan-400/10 flex items-center justify-center shrink-0">
                      <Mail className="w-4 h-4 text-cyan-400" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wider">Email</p>
                      <p className="text-white text-sm font-medium">{internship.student?.user?.email || '—'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-cyan-400/10 flex items-center justify-center shrink-0">
                      <Phone className="w-4 h-4 text-cyan-400" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wider">Téléphone</p>
                      <p className="text-white text-sm font-medium">{internship.student?.phone || 'Non renseigné'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-cyan-400/10 flex items-center justify-center shrink-0">
                      <User className="w-4 h-4 text-cyan-400" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wider">Niveau d'études</p>
                      <p className="text-white text-sm font-medium">{internship.student?.level || 'Non renseigné'}</p>
                    </div>
                  </div>
                  {internship.student?.promotion && (
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-cyan-400/10 flex items-center justify-center shrink-0">
                        <GraduationCap className="w-4 h-4 text-cyan-400" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wider">Promotion</p>
                        <p className="text-white text-sm font-medium">{internship.student.promotion}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Documents */}
            <div className="bg-card border border-white/10 rounded-2xl p-6 shadow-card">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-cyan-400" /> Documents joints
                </h2>
                {user?.role === 'student' && (
                  <button 
                    onClick={() => setShowUploadModal(true)}
                    className="p-1.5 rounded-lg bg-cyan-400/10 hover:bg-cyan-400/20 text-cyan-400 transition-colors"
                    title="Ajouter un document"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                )}
              </div>
              {internship.documents && internship.documents.length > 0 ? (
                <div className="space-y-3">
                  {internship.documents.map((doc: any) => (
                    <div key={doc.id} className="flex items-center justify-between bg-white/5 rounded-xl px-4 py-3 border border-white/10">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-cyan-400/10 flex items-center justify-center">
                          <FileText className="w-4 h-4 text-cyan-400" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">{doc.file_name}</p>
                          <p className="text-xs text-slate-500 capitalize">{doc.type} · {Math.round(doc.file_size / 1024)} Ko</p>
                        </div>
                      </div>
                      <a href={normalizeUrl(doc.file_url)} target="_blank" rel="noreferrer"
                        className="w-8 h-8 rounded-lg bg-white/10 hover:bg-cyan-400/20 flex items-center justify-center transition-colors">
                        <Download className="w-4 h-4 text-slate-300 hover:text-cyan-400" />
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 text-sm">Aucun document joint.</p>
              )}
            </div>

          </div>

          {/* RIGHT: Timeline */}
          <div className="space-y-6">
            <div className="bg-card border border-white/10 rounded-2xl p-6 shadow-card">
              <h2 className="text-lg font-bold text-white mb-6">Suivi du dossier</h2>
              <div className="relative">
                {/* vertical line */}
                <div className="absolute left-4 top-0 bottom-0 w-px bg-white/10" />
                <div className="space-y-6">
                  {timelineSteps.map((step, i) => {
                    let dotColor = 'bg-slate-700 border-slate-600';
                    let textColor = 'text-slate-500';
                    if (step.done) {
                      dotColor = step.rejected ? 'bg-red-500 border-red-400' : 'bg-emerald-500 border-emerald-400';
                      textColor = step.rejected ? 'text-red-400' : 'text-white';
                    }
                    return (
                      <div key={i} className="flex items-start gap-4 pl-0 relative">
                        <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 z-10 ${dotColor}`}>
                          {step.done
                            ? step.rejected
                              ? <XCircle className="w-4 h-4 text-white" />
                              : <CheckCircle2 className="w-4 h-4 text-white" />
                            : <div className="w-2 h-2 rounded-full bg-slate-500" />
                          }
                        </div>
                        <div className="pt-1 min-w-0">
                          <p className={`text-sm font-semibold ${textColor}`}>{step.label}</p>
                          {step.date && <p className="text-xs text-slate-500 mt-0.5">{step.date}</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Current status message */}
            <div className={`rounded-2xl p-5 border ${statusConf.bg} border-white/10`}>
              <div className={`flex items-center gap-2 font-bold mb-1 ${statusConf.color}`}>
                <StatusIcon className="w-4 h-4" />
                Statut actuel
              </div>
              <p className="text-slate-300 text-sm">
                {internship.status === 'submitted' && 'Votre dossier a été soumis et est en attente de traitement par votre enseignant.'}
                {internship.status === 'validating' && 'Votre dossier est en cours de validation par votre enseignant référent.'}
                {internship.status === 'validated' && 'Félicitations ! Votre dossier de stage a été validé.'}
                {internship.status === 'rejected' && 'Votre dossier a été rejeté. Veuillez corriger les informations et soumettre à nouveau.'}
                {internship.status === 'draft' && 'Ce dossier est encore en brouillon et n\'a pas été soumis.'}
              </p>
            </div>

            {/* Teacher Actions */}
            {(user?.role === 'teacher' || user?.role === 'admin') && internship.status === 'submitted' && (
              <div className="bg-card border border-white/10 rounded-2xl p-5 shadow-card space-y-3">
                <h2 className="text-lg font-bold text-white mb-1">Décision</h2>
                <p className="text-slate-400 text-sm mb-4">Validez ou rejetez ce dossier de stage.</p>
                <Button className="w-full" onClick={() => handleValidation('validated')}>
                  <CheckCircle2 className="w-4 h-4 mr-2" /> Valider le dossier
                </Button>
                <Button variant="danger" className="w-full" onClick={() => setRejectModal(true)}>
                  <XCircle className="w-4 h-4 mr-2" /> Rejeter le dossier
                </Button>
              </div>
            )}

            <Button variant="secondary" className="w-full" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-4 h-4 mr-2" /> Retour
            </Button>
          </div>

        </div>
      </div>

      {/* Reject Modal */}
      {rejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-base/80 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-xl shadow-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-primary mb-2">Motif du rejet</h3>
            <p className="text-sm text-secondary mb-4">Précisez vos remarques afin que l'étudiant puisse corriger son dossier.</p>
            <textarea
              className="w-full bg-input border border-border rounded-lg p-3 text-primary text-sm focus:outline-none focus:ring-2 focus:ring-cyan/50 focus:border-cyan transition-all mb-6 min-h-[120px] resize-none"
              placeholder="Ex: Il manque la signature du tuteur..."
              value={rejectComment}
              onChange={(e) => setRejectComment(e.target.value)}
            />
            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={() => { setRejectModal(false); setRejectComment(''); }}>Annuler</Button>
              <Button variant="danger" disabled={!rejectComment.trim()} onClick={() => handleValidation('rejected', rejectComment)}>
                Confirmer le rejet
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-base/80 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-xl shadow-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-primary mb-2">Ajouter un document</h3>
            <p className="text-sm text-secondary mb-4">Uploadez un nouveau document pour ce dossier.</p>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="text-xs uppercase text-muted tracking-wider mb-1 block">Titre du document</label>
                <input
                  type="text"
                  placeholder="Ex: Rapport de mi-stage"
                  value={uploadType}
                  onChange={(e) => setUploadType(e.target.value)}
                  className="w-full bg-input border border-border rounded-lg p-2.5 text-primary text-sm focus:outline-none focus:ring-2 focus:ring-cyan/50 focus:border-cyan"
                />
              </div>
              <FileUpload onFileSelect={setUploadFile} selectedFile={uploadFile} />
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={() => { setShowUploadModal(false); setUploadFile(null); setUploadType(''); }}>Annuler</Button>
              <Button disabled={!uploadFile || !uploadType.trim() || uploadingDoc} isLoading={uploadingDoc} onClick={handleUploadDocument}>
                Uploader
              </Button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
