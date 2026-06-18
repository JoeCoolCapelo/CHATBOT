import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';
import { AppLayout } from '../components/layout/AppLayout';
import { StatCard } from '../components/ui/StatCard';
import { DossierCard } from '../components/ui/DossierCard';
import { Skeleton } from '../components/ui/Skeleton';
import { useToast } from '../hooks/useToast';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Download, Filter, ChevronDown, Sparkles, Search } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { StatusBadge } from '../components/ui/StatusBadge';

const barData = [
  { dept: 'Info', count: 12 },
  { dept: 'Gestion', count: 8 },
  { dept: 'Marketing', count: 5 },
  { dept: 'Finance', count: 9 },
  { dept: 'RH', count: 4 },
];

const lineData = Array.from({ length: 30 }, (_, i) => ({
  day: `J-${30 - i}`,
  activite: Math.floor(Math.random() * 20) + 3,
}));

const CustomTooltipStyle = {
  contentStyle: {
    background: 'var(--color-card)',
    border: '1px solid var(--color-border)',
    borderRadius: '8px',
    color: 'var(--color-primary)',
    fontSize: '12px',
  },
  itemStyle: { color: 'var(--color-cyan)' },
  labelStyle: { color: 'var(--color-secondary)' },
};

export default function AdminDashboard() {
  const user = useAuthStore(state => state.user);
  const [internships, setInternships] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'submitted' | 'validated' | 'rejected'>('all');
  const [deptFilter, setDeptFilter] = useState<string>('all');
  const [rejectModal, setRejectModal] = useState<{ id: string } | null>(null);
  const [rejectComment, setRejectComment] = useState('');
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const res = await api.get('/internships/');
      setInternships(res.data);
    } catch {
      toast({ type: 'error', title: 'Erreur', description: 'Impossible de charger les données.' });
    } finally {
      setLoading(false);
    }
  };

  const handleValidation = async (id: string, status: string, comment?: string) => {
    try {
      await api.patch(`/internships/${id}/status/`, { status, rejection_comment: comment || '' });
      toast({ type: 'success', title: status === 'validated' ? 'Dossier validé ✅' : 'Dossier rejeté' });
      setRejectModal(null);
      setRejectComment('');
      fetchAll();
    } catch {
      toast({ type: 'error', title: 'Erreur', description: 'Mise à jour impossible.' });
    }
  };

  const openRejectModal = (id: string) => { setRejectModal({ id }); setRejectComment(''); };

  const pending = internships.filter(i => i.status === 'submitted');
  const validated = internships.filter(i => i.status === 'validated');
  const rejected = internships.filter(i => i.status === 'rejected');

  const filtered = (() => {
    let list = filter === 'all' ? internships
      : filter === 'submitted' ? pending
      : filter === 'validated' ? validated
      : rejected;
    if (deptFilter !== 'all') {
      list = list.filter(i => (i.student?.department || 'Non renseigné') === deptFilter);
    }
    return list;
  })();

  const departments = ['all', ...Array.from(new Set(internships.map((i: any) => i.student?.department || 'Non renseigné')))] as string[];

  const tabs: { key: typeof filter; label: string; count: number }[] = [
    { key: 'all', label: 'Tous', count: internships.length },
    { key: 'submitted', label: 'En attente', count: pending.length },
    { key: 'validated', label: 'Validés', count: validated.length },
    { key: 'rejected', label: 'Rejetés', count: rejected.length },
  ];

  return (
    <AppLayout>
      {/* Premium Header */}
      <div className="relative overflow-hidden bg-card/60 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 sm:p-10 mb-8 shadow-2xl group transition-all duration-700 hover:shadow-[0_8px_40px_rgb(0,180,216,0.15)] hover:border-cyan/30">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-cyan/20 blur-[100px] rounded-full pointer-events-none group-hover:bg-cyan/30 transition-colors duration-1000 translate-x-1/3 -translate-y-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-purple-500/10 blur-[80px] rounded-full pointer-events-none group-hover:bg-purple-500/20 transition-colors duration-1000 -translate-x-1/4 translate-y-1/4"></div>
        
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300 text-xs font-semibold mb-4">
              <Sparkles className="w-3.5 h-3.5 text-cyan" /> Vue Globale
            </div>
            <h1 className="text-display-sm text-primary font-bold tracking-tight mb-2">
              Tableau de bord <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan to-purple-400">{user?.role === 'admin' ? 'Administration' : 'Enseignant'}</span>
            </h1>
            <p className="text-secondary text-lg">Supervision en temps réel des dossiers de stage de vos étudiants.</p>
          </div>
          <Button variant="secondary" size="lg" icon={<Download className="w-5 h-5" />} className="shadow-glow-cyan hover:scale-105 transition-all duration-300 border-white/20 hover:border-cyan/50 hover:bg-cyan/10 bg-card/50 backdrop-blur-md">
            Exporter le rapport CSV
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 mb-10">
        <StatCard label="Total dossiers" value={internships.length} trend={{ value: 8, label: 'ce mois', positive: true }} />
        <StatCard
          label="Taux de validation"
          value={internships.length ? `${Math.round((validated.length / internships.length) * 100)}%` : '0%'}
          trend={{ value: 3, label: 'vs mois dernier', positive: true }}
        />
        <StatCard label="En attente" value={pending.length} trend={{ value: pending.length > 5 ? 15 : 0, label: 'urgents', positive: false }} />
        <StatCard label="Délai moyen" value="4.2j" trend={{ value: 12, label: 'amélioration', positive: true }} />
        <StatCard label="Alertes actives" value="2" className="border border-danger/30 hover:border-danger bg-danger/5 shadow-[0_0_15px_rgb(239,68,68,0.1)] hover:shadow-[0_0_25px_rgb(239,68,68,0.2)] transition-all" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-12">
        <div className="bg-card/40 backdrop-blur-md border border-white/5 rounded-3xl p-8 shadow-2xl relative overflow-hidden group">
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan/20 to-purple-500/20 rounded-3xl blur opacity-0 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 pointer-events-none"></div>
          <div className="relative z-10">
            <h2 className="text-h3 mb-2 tracking-tight text-white font-bold flex items-center gap-2">Dossiers par département</h2>
            <p className="text-sm text-slate-400 mb-8">Répartition globale des demandes de stage</p>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={barData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="dept" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} dy={10} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} dx={-10} />
                <Tooltip {...CustomTooltipStyle} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                <Bar dataKey="count" fill="url(#colorCyan)" radius={[6, 6, 0, 0]}>
                  {/* We can define gradients inside a defs tag for the chart, but Recharts usually needs it in the component. We'll stick to solid neon cyan here if url is not defined */}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card/40 backdrop-blur-md border border-white/5 rounded-3xl p-8 shadow-2xl relative overflow-hidden group">
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/20 to-cyan/20 rounded-3xl blur opacity-0 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 pointer-events-none"></div>
          <div className="relative z-10">
            <h2 className="text-h3 mb-2 tracking-tight text-white font-bold flex items-center gap-2">Activité récente</h2>
            <p className="text-sm text-slate-400 mb-8">Nombre d'actions quotidiennes (30 derniers jours)</p>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={lineData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCyan" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00b4d8" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#00b4d8" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="day" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} interval={6} dy={10} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} dx={-10} />
              <Tooltip {...CustomTooltipStyle} />
              <Line type="monotone" dataKey="activite" stroke="#00b4d8" strokeWidth={3} dot={{ r: 0 }} activeDot={{ r: 6, fill: '#00b4d8', stroke: '#0b1120', strokeWidth: 2 }} />
            </LineChart>
          </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Table section */}
      <div className="bg-card/30 backdrop-blur-md border border-white/5 rounded-3xl shadow-2xl overflow-hidden group hover:border-white/10 transition-colors duration-500">
        <div className="p-6 sm:p-8 border-b border-white/5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 bg-white/[0.02]">
          <div className="flex gap-2 bg-black/20 rounded-xl p-1.5 border border-white/5 overflow-x-auto">
            {tabs.map(t => (
              <button
                key={t.key}
                onClick={() => setFilter(t.key)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 flex items-center gap-2 whitespace-nowrap ${
                  filter === t.key
                    ? 'bg-cyan/10 text-cyan shadow-[0_0_15px_rgba(0,180,216,0.15)]'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {t.label}
                <span className={`text-xs px-2 py-0.5 rounded-full font-bold transition-colors ${
                  filter === t.key ? 'bg-cyan/20 text-cyan' : 'bg-white/10 text-slate-400'
                }`}>{t.count}</span>
              </button>
            ))}
          </div>
          <div className="flex items-center gap-4">
            {/* Department filter */}
            <div className="relative group/filter">
              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="appearance-none bg-black/20 border border-white/10 rounded-xl pl-4 pr-10 py-2.5 text-sm text-slate-300 hover:text-white hover:border-cyan/30 focus:outline-none focus:border-cyan focus:ring-1 focus:ring-cyan cursor-pointer transition-all shadow-inner"
              >
                <option value="all" className="bg-card text-white">Tous les départements</option>
                {departments.filter(d => d !== 'all').map(dept => (
                  <option key={dept} value={dept} className="bg-card text-white">{dept}</option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none group-hover/filter:text-cyan transition-colors" />
            </div>
            <button className="flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-cyan transition-colors px-4 py-2.5 rounded-xl hover:bg-cyan/5">
              <Filter className="w-4 h-4" /> Filtres
            </button>
          </div>
        </div>

        {/* Cards */}
        <div className="p-6 sm:p-8">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-6 h-48 flex flex-col gap-4 animate-pulse">
                  <div className="flex gap-4"><div className="w-12 h-12 bg-white/10 rounded-full" /><div className="flex-1 space-y-2"><div className="h-4 bg-white/10 rounded w-1/2" /><div className="h-3 bg-white/10 rounded w-1/3" /></div></div>
                  <div className="h-3 bg-white/10 rounded w-full" />
                  <div className="h-3 bg-white/10 rounded w-3/4" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10">
                <Search className="w-6 h-6 text-slate-400" />
              </div>
              <p className="text-slate-400 text-lg">Aucun dossier trouvé pour ces critères.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filtered.map((item, idx) => (
                <DossierCard 
                  key={item.id}
                  internship={item}
                  onValidate={(id) => handleValidation(id, 'validated')}
                  onReject={(id) => openRejectModal(id)}
                  onView={(id) => navigate(`/internships/${id}`)}
                  isUrgent={item.status === 'submitted'}
                  delay={idx * 50}
                />
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="px-6 sm:px-8 py-5 border-t border-white/5 flex items-center justify-between text-sm text-slate-400 bg-black/10">
          <span>Affichage de <strong className="text-white">{filtered.length}</strong> sur {internships.length} dossiers</span>
          <div className="flex gap-1">
            {[1, 2, 3].map(p => (
              <button key={p} className={`w-9 h-9 rounded-lg text-sm font-semibold transition-all duration-300 ${
                p === 1 ? 'bg-cyan/10 text-cyan border border-cyan/20 shadow-[0_0_10px_rgba(0,180,216,0.15)]' : 'hover:bg-white/10 hover:text-white'
              }`}>{p}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Rejection comment modal */}
      {rejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-2xl shadow-modal p-8 w-full max-w-md mx-4 animate-in fade-in zoom-in-95 duration-200">
            <h2 className="text-h2 font-bold text-primary mb-2">Rejeter le dossier</h2>
            <p className="text-secondary text-sm mb-6">Ajoutez un commentaire pour expliquer le motif du rejet. L'étudiant recevra une notification.</p>
            <textarea
              className="w-full min-h-[100px] bg-base border border-border rounded-xl p-3 text-sm text-primary placeholder:text-muted focus:outline-none focus:border-danger/50 focus:ring-1 focus:ring-danger/20 resize-none mb-4 transition-colors"
              placeholder="Motif du rejet (ex : convention incomplète, dates incorrectes...)"
              value={rejectComment}
              onChange={e => setRejectComment(e.target.value)}
            />
            <div className="flex gap-3 justify-end">
              <Button variant="ghost" onClick={() => setRejectModal(null)}>Annuler</Button>
              <Button
                variant="danger"
                onClick={() => handleValidation(rejectModal.id, 'rejected', rejectComment)}
              >
                Confirmer le rejet
              </Button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
