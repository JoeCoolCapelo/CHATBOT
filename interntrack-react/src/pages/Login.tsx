import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthLayout } from '../components/layout/AuthLayout';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useAuthStore } from '../store/authStore';
import { useToast } from '../hooks/useToast';
import { Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const login = useAuthStore(state => state.login);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast({ type: 'success', title: 'Connexion réussie', description: 'Bienvenue sur InternTrack AI !' });
      navigate('/dashboard');
    } catch (err: any) {
      toast({ type: 'error', title: 'Erreur de connexion', description: 'Identifiants incorrects' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="mb-10 text-center lg:text-left">
        <div className="lg:hidden w-12 h-12 rounded bg-gradient-to-br from-cyan to-accent flex items-center justify-center mx-auto mb-6 shadow-glow-cyan">
          <span className="font-bold text-white text-xl">IT</span>
        </div>
        <h1 className="text-h1 mb-2 tracking-tight">Connexion à InternTrack AI</h1>
        <p className="text-secondary text-sm">Gérez vos stages avec la puissance de l'IA.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Input 
          label="Email" 
          type="email" 
          placeholder="jean.dupont@universite.fr"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        
        <div className="relative">
          <Input 
            label="Mot de passe" 
            type={showPassword ? "text" : "password"} 
            placeholder="••••••••"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <button 
            type="button"
            className="absolute right-3 top-[32px] text-muted hover:text-primary transition-colors focus:outline-none"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        <div className="flex items-center justify-between mt-2">
          <label className="flex items-center gap-2 cursor-pointer group">
            <input type="checkbox" className="w-4 h-4 rounded bg-input border-border text-cyan focus:ring-cyan/20 focus:ring-offset-base" />
            <span className="text-caption text-secondary group-hover:text-primary transition-colors">Se souvenir de moi</span>
          </label>
          <a href="#" className="text-caption text-cyan hover:underline">Mot de passe oublié ?</a>
        </div>

        <Button type="submit" className="w-full mt-4" size="lg" isLoading={loading}>
          Se connecter
        </Button>
      </form>

      <div className="mt-8">
        <div className="relative flex items-center py-4">
          <div className="flex-grow border-t border-border"></div>
          <span className="flex-shrink-0 mx-4 text-caption text-muted uppercase tracking-wider">ou accès rapide (démo)</span>
          <div className="flex-grow border-t border-border"></div>
        </div>
        <div className="flex justify-center gap-3">
          <Button variant="secondary" size="sm" onClick={() => {setEmail('etudiant@interntrack.fr'); setPassword('Etu1234!');}}>Étudiant</Button>
          <Button variant="secondary" size="sm" onClick={() => {setEmail('prof@interntrack.fr'); setPassword('Prof1234!');}}>Enseignant</Button>
        </div>
      </div>

      <p className="mt-8 text-center text-sm text-secondary">
        Pas encore de compte ? <Link to="/register" className="text-cyan hover:underline font-medium">Créer un compte</Link>
      </p>
    </AuthLayout>
  );
}
