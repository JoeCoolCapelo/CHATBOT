import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthLayout } from '../components/layout/AuthLayout';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { useAuthStore } from '../store/authStore';
import { useToast } from '../hooks/useToast';

export default function Register() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    role: 'student',
    student_id: '',
    department: '',
  });
  const [loading, setLoading] = useState(false);
  
  const register = useAuthStore(state => state.register);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(formData);
      toast({ type: 'success', title: 'Inscription réussie', description: 'Votre compte a été créé avec succès.' });
      navigate('/dashboard');
    } catch (err: any) {
      toast({ type: 'error', title: 'Erreur', description: 'Impossible de créer le compte. Vérifiez les informations.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="mb-8 text-center lg:text-left">
        <h1 className="text-h1 mb-2 tracking-tight">Inscription</h1>
        <p className="text-secondary text-sm">Rejoignez la plateforme InternTrack AI.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input 
            label="Prénom" name="first_name" required
            value={formData.first_name} onChange={handleChange}
          />
          <Input 
            label="Nom" name="last_name" required
            value={formData.last_name} onChange={handleChange}
          />
        </div>

        <Input 
          label="Email" type="email" name="email" required
          value={formData.email} onChange={handleChange}
        />
        
        <Input 
          label="Mot de passe" type="password" name="password" required
          value={formData.password} onChange={handleChange}
        />

        <Select label="Rôle" name="role" value={formData.role} onChange={handleChange}>
          <option value="student">Étudiant</option>
          <option value="teacher">Enseignant / Référent</option>
        </Select>

        {formData.role === 'student' && (
          <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-fast">
            <Input 
              label="N° Étudiant" name="student_id" required
              value={formData.student_id} onChange={handleChange}
            />
            <Input 
              label="Département" name="department" required
              value={formData.department} onChange={handleChange}
            />
          </div>
        )}

        <Button type="submit" className="w-full mt-6" size="lg" isLoading={loading}>
          Créer mon compte
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-secondary">
        Déjà un compte ? <Link to="/login" className="text-cyan hover:underline font-medium">Se connecter</Link>
      </p>
    </AuthLayout>
  );
}
