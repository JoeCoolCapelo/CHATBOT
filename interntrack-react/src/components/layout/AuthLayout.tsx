import React from 'react';
import { Link } from 'react-router-dom';
import { Bot, ArrowLeft } from 'lucide-react';

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-base relative overflow-hidden font-sans text-primary">
      {/* Background Glows & Accents */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-cyan/10 blur-[120px] mix-blend-screen" />
        <div className="absolute top-[40%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-purple/10 blur-[120px] mix-blend-screen" />
        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
      </div>

      {/* Main Container - Swapped layout using lg:flex-row-reverse */}
      <div className="relative z-10 w-full max-w-[1100px] mx-4 flex flex-col lg:flex-row-reverse bg-card/40 backdrop-blur-xl border border-border rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] overflow-hidden my-8">
        
        {/* Form Side (Now on the right due to flex-row-reverse) */}
        <div className="w-full lg:w-1/2 p-8 sm:p-12 bg-card/80 flex flex-col relative z-10">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-secondary hover:text-cyan transition-colors w-fit mb-10 group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Retour
          </Link>
          <div className="w-full max-w-sm mx-auto flex-1 flex flex-col justify-center">
            {children}
          </div>
        </div>

        {/* Visual/Brand Side (Now on the left) */}
        <div className="hidden lg:flex lg:w-1/2 p-10 flex-col relative overflow-hidden bg-gradient-to-br from-card-2/50 to-card/50 border-r border-border">
          {/* Animated Background Glow */}
          <div className="absolute inset-0 z-0 opacity-50">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] rounded-full bg-gradient-to-tr from-cyan/20 via-purple/20 to-blue-500/20 blur-3xl animate-[spin_15s_linear_infinite]" />
          </div>

          <div className="relative z-10 flex flex-col h-full">
            {/* Top Logo */}
            <div className="flex items-center gap-3 mb-12">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black text-white bg-gradient-to-br from-cyan to-blue-600 shadow-[0_0_15px_rgba(34,211,238,0.4)]">
                IT
              </div>
              <span className="font-bold text-xl tracking-tight text-primary">InternTrack <span className="text-cyan">AI</span></span>
            </div>
            
            <div className="flex-1 flex flex-col justify-center">
              <h2 className="text-4xl font-bold tracking-tight text-primary leading-tight mb-4">
                La gestion de stage <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan via-blue-500 to-purple">
                  réinventée.
                </span>
              </h2>
              <p className="text-secondary text-lg max-w-md mb-8">
                Connectez-vous pour générer vos conventions en un clic, suivre vos dossiers en temps réel et discuter avec votre assistant IA dédié.
              </p>

              {/* Image Preview */}
              <div className="relative rounded-2xl overflow-hidden border border-border/50 shadow-2xl transform hover:-translate-y-1 transition-transform duration-500">
                <div className="absolute inset-0 bg-gradient-to-t from-base via-transparent to-transparent z-10 opacity-40"></div>
                <img 
                  src="/images/student.jpg" 
                  alt="Étudiant travaillant" 
                  className="w-full h-48 object-cover"
                />
                <div className="absolute bottom-4 left-4 z-20 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple/20 flex items-center justify-center border border-purple/30 backdrop-blur-md">
                    <Bot className="w-4 h-4 text-purple" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white shadow-sm">InternBot IA</div>
                    <div className="text-xs text-white/80">Assistant actif</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom info */}
            <div className="mt-12 text-sm font-medium text-secondary flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-success shadow-[0_0_8px_rgba(16,185,129,0.6)] animate-pulse"></div>
              Système opérationnel
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
