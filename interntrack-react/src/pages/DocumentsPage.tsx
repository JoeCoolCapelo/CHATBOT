import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AppLayout } from '../components/layout/AppLayout';
import { useToast } from '../hooks/useToast';
import {
  FileText, Download, Eye, Calendar, HardDrive,
  Search, Filter, FolderOpen
} from 'lucide-react';

interface DocItem {
  id: string;
  type: string;
  file_name: string;
  file_size: number;
  file_url: string;
  uploaded_at: string;
  internship: string;
}

interface InternshipBasic {
  id: string;
  company_name: string;
  job_title: string;
  documents: DocItem[];
}

const TYPE_LABELS: Record<string, string> = {
  convention: 'Convention',
  report: 'Rapport',
  certificate: 'Attestation',
};

const TYPE_COLORS: Record<string, string> = {
  convention: 'bg-cyan-400/10 text-cyan-400 border-cyan-400/20',
  report: 'bg-purple-400/10 text-purple-400 border-purple-400/20',
  certificate: 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20',
};

export default function DocumentsPage() {
  const [internships, setInternships] = useState<InternshipBasic[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/internships/');
        setInternships(res.data);
      } catch {
        toast({ type: 'error', title: 'Erreur', description: 'Impossible de charger les documents.' });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const DJANGO_BASE = 'http://127.0.0.1:8001';

  // Normalize relative URLs stored in DB to absolute URLs pointing at Django
  const normalizeUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    // relative path like /documents/... or /media/documents/...
    const path = url.startsWith('/media/') ? url : `/media${url}`;
    return `${DJANGO_BASE}${path}`;
  };

  // Flatten all documents with their internship info
  const allDocs = internships.flatMap(intern =>
    (intern.documents || []).map(doc => ({
      ...doc,
      file_url: normalizeUrl(doc.file_url),
      companyName: intern.company_name,
      jobTitle: intern.job_title,
      internshipId: intern.id,
    }))
  );

  // Filter
  const filteredDocs = allDocs.filter(doc => {
    const matchesSearch = searchQuery === '' ||
      doc.file_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.companyName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || doc.type === filterType;
    return matchesSearch && matchesType;
  });

  const totalSize = allDocs.reduce((sum, d) => sum + d.file_size, 0);

  if (loading) {
    return (
      <AppLayout>
        <div className="flex h-[50vh] items-center justify-center">
          <div className="animate-spin w-8 h-8 border-4 border-cyan border-t-transparent rounded-full" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Mes Documents</h1>
          <p className="text-slate-400">Retrouvez tous les documents associés à vos dossiers de stage.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-card border border-white/10 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-lg bg-cyan-400/10 flex items-center justify-center">
                <FileText className="w-4 h-4 text-cyan-400" />
              </div>
              <p className="text-xs uppercase tracking-wider text-slate-500">Total documents</p>
            </div>
            <p className="text-2xl font-bold text-white">{allDocs.length}</p>
          </div>
          <div className="bg-card border border-white/10 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-lg bg-purple-400/10 flex items-center justify-center">
                <FolderOpen className="w-4 h-4 text-purple-400" />
              </div>
              <p className="text-xs uppercase tracking-wider text-slate-500">Dossiers liés</p>
            </div>
            <p className="text-2xl font-bold text-white">{internships.length}</p>
          </div>
          <div className="bg-card border border-white/10 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-lg bg-emerald-400/10 flex items-center justify-center">
                <HardDrive className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-xs uppercase tracking-wider text-slate-500">Espace utilisé</p>
            </div>
            <p className="text-2xl font-bold text-white">
              {totalSize < 1024 * 1024
                ? `${Math.round(totalSize / 1024)} Ko`
                : `${(totalSize / (1024 * 1024)).toFixed(1)} Mo`}
            </p>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher un document..."
              className="w-full bg-card border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/20 transition-colors"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-card border border-white/10 rounded-xl pl-10 pr-8 py-2.5 text-sm text-white appearance-none focus:outline-none focus:border-cyan-400/50 cursor-pointer"
            >
              <option value="all">Tous les types</option>
              <option value="convention">Convention</option>
              <option value="report">Rapport</option>
              <option value="certificate">Attestation</option>
            </select>
          </div>
        </div>

        {/* Document list */}
        {filteredDocs.length === 0 ? (
          <div className="bg-card border border-white/10 rounded-2xl p-12 text-center">
            <FileText className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 text-lg font-medium mb-1">Aucun document trouvé</p>
            <p className="text-slate-500 text-sm">
              {allDocs.length === 0
                ? 'Soumettez un dossier de stage pour voir vos documents ici.'
                : 'Aucun document ne correspond à votre recherche.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDocs.map((doc) => (
              <div
                key={doc.id}
                className="bg-card/40 backdrop-blur-md border border-white/10 rounded-2xl p-6 flex flex-col hover:border-cyan-400/50 hover:shadow-[0_0_20px_rgba(34,211,238,0.15)] transition-all duration-300 group relative"
              >
                {/* Header: Icon & Type */}
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-cyan-400/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <FileText className="w-6 h-6 text-cyan-400" />
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${TYPE_COLORS[doc.type] || 'bg-slate-400/10 text-slate-400 border-slate-400/20'}`}>
                    {TYPE_LABELS[doc.type] || doc.type}
                  </span>
                </div>

                {/* Info */}
                <div className="flex-1 mb-6">
                  <p className="text-base font-bold text-white mb-2 line-clamp-2" title={doc.file_name}>{doc.file_name}</p>
                  
                  <div className="space-y-2 mt-4">
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <FolderOpen className="w-3.5 h-3.5 text-slate-500" />
                      <button
                        onClick={() => navigate(`/internships/${doc.internshipId}`)}
                        className="text-cyan-400/80 hover:text-cyan-400 transition-colors truncate"
                        title={doc.companyName}
                      >
                        {doc.companyName}
                      </button>
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      <span>{new Date(doc.uploaded_at).toLocaleDateString('fr-FR')}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <HardDrive className="w-3.5 h-3.5 text-slate-500" />
                      <span>
                        {doc.file_size < 1024 * 1024
                          ? `${Math.round(doc.file_size / 1024)} Ko`
                          : `${(doc.file_size / (1024 * 1024)).toFixed(1)} Mo`}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions (Footer) */}
                <div className="flex items-center gap-3 pt-4 border-t border-white/5 mt-auto">
                  <a
                    href={doc.file_url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-2 rounded-xl bg-white/5 hover:bg-cyan-400/10 border border-transparent hover:border-cyan-400/20 text-sm font-medium text-slate-300 hover:text-cyan-400 flex items-center justify-center gap-2 transition-all"
                  >
                    <Eye className="w-4 h-4" /> Voir
                  </a>
                  <a
                    href={doc.file_url}
                    download
                    className="flex-1 py-2 rounded-xl bg-cyan-400/10 hover:bg-cyan-400/20 border border-cyan-400/20 hover:border-cyan-400/40 text-sm font-medium text-cyan-400 flex items-center justify-center gap-2 transition-all"
                  >
                    <Download className="w-4 h-4" /> Télécharger
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
