import { Link } from 'react-router-dom';
import { ArrowRight, Bot, ShieldCheck, Activity, Sparkles, ChevronRight, CheckCircle2, FileText, Moon, Sun, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useThemeStore } from '../store/themeStore';

// Custom hook to detect scroll
function useScrollY() {
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  return scrollY;
}

export default function LandingPage() {
  const scrollY = useScrollY();
  const { theme, toggleTheme } = useThemeStore();

  return (
    <div className="min-h-screen bg-base text-primary font-sans overflow-hidden selection:bg-cyan/30">
      {/* Background Glows */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-cyan/10 blur-[120px] mix-blend-screen" />
        <div className="absolute top-[40%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-purple/10 blur-[120px] mix-blend-screen" />
        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
      </div>

      {/* Nav */}
      <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrollY > 20 ? 'bg-base/80 backdrop-blur-md border-b border-border py-4' : 'bg-transparent py-6'} px-6 sm:px-12`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black text-white bg-gradient-to-br from-cyan to-blue-600 shadow-[0_0_15px_rgba(34,211,238,0.4)]">
              IT
            </div>
            <span className="font-bold text-xl tracking-tight hidden sm:block">InternTrack <span className="text-cyan">AI</span></span>
          </div>
          <div className="flex items-center gap-5">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-card-2 text-secondary hover:text-primary transition-colors"
              aria-label="Changer le thème"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <Link to="/login" className="text-sm font-medium text-secondary hover:text-primary transition-colors">Connexion</Link>
            <Link to="/register" className="group text-sm font-bold text-base bg-primary px-5 py-2.5 rounded-full hover:opacity-90 transition-all shadow-[0_0_20px_rgba(0,0,0,0.1)] hover:scale-105 flex items-center gap-2">
              Démarrer <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 pt-32 sm:pt-40 pb-20">
        
        {/* Hero Section */}
        <section className="px-6 sm:px-12 max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left side text */}
            <div className="text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-card border border-border text-sm text-cyan font-medium mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <Sparkles className="w-4 h-4" />
                La nouvelle ère de la gestion de stage
              </div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight mb-8 leading-[1.1] animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
                Simplifiez vos stages avec <br className="hidden sm:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan via-blue-500 to-purple">
                  l'intelligence artificielle
                </span>
              </h1>
              <p className="text-lg sm:text-xl text-secondary max-w-xl mb-10 leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
                InternTrack centralise vos conventions, suit vos dossiers en temps réel et met un assistant IA personnel à votre disposition. Plus de paperasse, que des résultats.
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
                <Link to="/register" className="w-full sm:w-auto text-base font-bold text-base bg-primary px-8 py-4 rounded-full hover:opacity-90 transition-all hover:scale-105 text-center">
                  Créer un compte gratuitement
                </Link>
                <Link to="/login" className="w-full sm:w-auto text-base font-medium text-primary bg-card border border-border px-8 py-4 rounded-full hover:bg-card-2 transition-all flex items-center justify-center gap-2">
                  Espace connexion <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Right side image */}
            <div className="relative animate-in fade-in slide-in-from-right-8 duration-1000 delay-300 mt-12 lg:mt-0">
              {/* Decorative glows around image */}
              <div className="absolute inset-0 bg-gradient-to-tr from-cyan/20 to-purple/20 rounded-3xl blur-2xl transform rotate-3"></div>
              {/* Image container */}
              <div className="relative rounded-3xl overflow-hidden border border-border/50 shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-t from-base via-transparent to-transparent z-10 opacity-30"></div>
                <img 
                  src="/images/student.jpg" 
                  alt="Étudiants en stage" 
                  className="w-full h-auto object-cover aspect-[4/3]"
                />
                {/* Floating badge over the image */}
                <div className="absolute bottom-6 left-6 z-20 bg-card/90 backdrop-blur-md border border-border rounded-xl p-4 flex items-center gap-4 shadow-xl">
                  <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center text-success">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-primary">Convention validée</p>
                    <p className="text-xs text-secondary">Aujourd'hui à 14h30</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Dashboard Preview */}
          <div className="mt-20 relative mx-auto max-w-5xl animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-500">
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-cyan to-purple opacity-30 blur-2xl"></div>
            <div className="relative rounded-2xl border border-border bg-card/80 backdrop-blur-xl shadow-2xl overflow-hidden flex flex-col">
              {/* Browser Header */}
              <div className="h-10 border-b border-border flex items-center px-4 gap-2 bg-card-2/50">
                <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
              </div>
              <div className="p-8 grid md:grid-cols-3 gap-6 text-left">
                <div className="md:col-span-2 space-y-4">
                  <div className="flex flex-col gap-1">
                    <div className="text-xl font-bold text-primary flex items-center gap-2">
                      Bonjour, Alex <User className="w-5 h-5 text-cyan" />
                    </div>
                    <div className="text-sm text-secondary">Voici l'état de vos dossiers de stage.</div>
                  </div>
                  <div className="p-5 bg-card-2 rounded-xl border border-border mt-6 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent animate-[shimmer_2s_infinite]"></div>
                    <div className="relative z-10 flex items-start justify-between">
                      <div>
                        <div className="text-xs font-bold tracking-wide text-cyan uppercase mb-1">Stage validé !</div>
                        <div className="text-lg font-bold text-primary mb-1">Développeur Frontend React</div>
                        <div className="text-sm text-secondary">TechVision Inc. • Paris</div>
                      </div>
                      <div className="px-3 py-1 bg-success/10 text-success border border-success/20 rounded-full text-xs font-bold">
                        En cours
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-card-2 rounded-xl border border-border flex flex-col justify-center">
                      <div className="text-sm text-secondary mb-1">Documents requis</div>
                      <div className="text-2xl font-bold text-primary">4 / 4</div>
                    </div>
                    <div className="p-4 bg-card-2 rounded-xl border border-border flex flex-col justify-center">
                      <div className="text-sm text-secondary mb-1">Prochain rendez-vous</div>
                      <div className="text-sm font-bold text-primary">12 Juin, 14h00</div>
                    </div>
                  </div>
                </div>
                <div className="bg-purple/5 border border-purple/10 rounded-xl p-4 flex flex-col">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-full bg-purple/10 flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.2)]">
                      <Bot className="w-4 h-4 text-purple" />
                    </div>
                    <div className="text-sm font-semibold text-primary">InternBot AI</div>
                  </div>
                  <div className="space-y-3 flex-1 text-[13px]">
                    <div className="px-3 py-2 bg-card-2 rounded-lg rounded-tl-none text-primary ml-2 w-[85%] border border-border/50 shadow-sm">
                      Bonjour Alex ! Comment puis-je t'aider aujourd'hui ?
                    </div>
                    <div className="px-3 py-2 bg-purple/20 border border-purple/10 rounded-lg rounded-tr-none text-primary w-[80%] ml-auto shadow-sm">
                      Où en est ma convention ?
                    </div>
                    <div className="px-3 py-2 bg-card-2 rounded-lg rounded-tl-none text-primary ml-2 w-[90%] border border-border/50 shadow-sm">
                      Ta convention a été signée par l'école hier à 14h !
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Bento Grid */}
        <section className="px-6 sm:px-12 max-w-7xl mx-auto mt-32">
          <div className="mb-16 text-center">
            <h2 className="text-3xl sm:text-5xl font-bold mb-4">Tout ce dont vous avez besoin</h2>
            <p className="text-secondary max-w-2xl mx-auto">Une suite d'outils pensée pour réduire le temps de gestion administratif de vos stages.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 bg-gradient-to-br from-card to-card-2 border border-border rounded-3xl p-8 relative overflow-hidden group hover:border-cyan/30 transition-colors">
              <div className="absolute top-0 right-0 w-64 h-64 bg-cyan/5 rounded-full blur-[80px] group-hover:bg-cyan/10 transition-colors duration-500"></div>
              <div className="relative z-10">
                <div className="w-12 h-12 bg-cyan/10 rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                  <Bot className="w-6 h-6 text-cyan" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Assistant IA Intégré</h3>
                <p className="text-secondary mb-6 max-w-md">Posez des questions sur le statut de vos conventions, les dates limites ou les documents manquants. L'IA analyse votre dossier en temps réel.</p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-sm text-secondary"><CheckCircle2 className="w-4 h-4 text-cyan" /> Historique des conversations</li>
                  <li className="flex items-center gap-2 text-sm text-secondary"><CheckCircle2 className="w-4 h-4 text-cyan" /> Réponses instantanées</li>
                  <li className="flex items-center gap-2 text-sm text-secondary"><CheckCircle2 className="w-4 h-4 text-cyan" /> Analyse de vos documents</li>
                </ul>
              </div>
            </div>

            <div className="bg-gradient-to-br from-card to-card-2 border border-border rounded-3xl p-8 relative overflow-hidden group hover:border-purple/30 transition-colors">
              <div className="relative z-10 h-full flex flex-col">
                <div className="w-12 h-12 bg-purple/10 rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
                  <Activity className="w-6 h-6 text-purple" />
                </div>
                <h3 className="text-xl font-bold mb-3">Suivi en direct</h3>
                <p className="text-secondary text-sm flex-1">Fini l'attente incertaine. Visualisez exactement à quelle étape se trouve votre convention (brouillon, validée, rejetée).</p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-card to-card-2 border border-border rounded-3xl p-8 relative overflow-hidden group hover:border-blue-500/30 transition-colors">
              <div className="relative z-10 h-full flex flex-col">
                <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                  <ShieldCheck className="w-6 h-6 text-blue-500" />
                </div>
                <h3 className="text-xl font-bold mb-3">Données sécurisées</h3>
                <p className="text-secondary text-sm flex-1">Vos documents personnels et conventions sont chiffrés et stockés de façon sécurisée (JWT).</p>
              </div>
            </div>

            <div className="md:col-span-2 bg-gradient-to-br from-card to-card-2 border border-border rounded-3xl p-8 relative overflow-hidden group hover:border-primary/20 transition-colors">
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-card-2 rounded-full blur-[80px] group-hover:bg-card transition-colors duration-500"></div>
              <div className="relative z-10">
                <div className="w-12 h-12 bg-card-2 rounded-2xl flex items-center justify-center mb-6 border border-border">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Génération simplifiée</h3>
                <p className="text-secondary mb-6 max-w-md">Remplissez un formulaire intelligent en 4 étapes et laissez la plateforme générer votre convention de stage au format PDF instantanément.</p>
                <div className="flex flex-wrap gap-2">
                  <div className="px-3 py-1 bg-card-2 rounded-full text-xs text-secondary border border-border">Gain de temps</div>
                  <div className="px-3 py-1 bg-card-2 rounded-full text-xs text-secondary border border-border">0 Erreur</div>
                  <div className="px-3 py-1 bg-card-2 rounded-full text-xs text-secondary border border-border">Format standardisé</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-6 sm:px-12 max-w-5xl mx-auto mt-32">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-cyan to-blue-600">
            <div className="absolute inset-0 opacity-20 mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='3'/%3E%3Ccircle cx='13' cy='13' r='3'/%3E%3C/g%3E%3C/svg%3E")`}}></div>
            <div className="relative z-10 px-8 py-16 text-center">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">Prêt à moderniser vos stages ?</h2>
              <p className="text-cyan-100 mb-8 max-w-xl mx-auto text-lg">Rejoignez des milliers d'étudiants et d'enseignants qui utilisent InternTrack AI pour simplifier leurs démarches administratives.</p>
              <Link to="/register" className="inline-block text-base font-bold text-blue-600 bg-white px-8 py-4 rounded-full hover:bg-slate-50 transition-all shadow-[0_10px_30px_rgba(0,0,0,0.3)] hover:scale-105">
                Commencer maintenant
              </Link>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-base relative z-10 py-12 px-6 sm:px-12 mt-20">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black text-white bg-gradient-to-br from-cyan to-blue-600">
              IT
            </div>
            <span className="font-bold tracking-tight text-primary">InternTrack <span className="text-cyan">AI</span></span>
          </div>
          <p className="text-secondary text-sm">© 2026 InternTrack AI. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
}
