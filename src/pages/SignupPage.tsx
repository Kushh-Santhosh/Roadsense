import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { StorageService } from '../services/storageService';
import { Logo } from '../components/Logo';
import { Bike, Shield, CheckCircle2 } from 'lucide-react';

export const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [locality, setLocality] = useState('');

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    StorageService.setCurrentUser('user-kushal');
    navigate('/app');
  };

  return (
    <div className="min-h-screen bg-brand-warm-white flex items-center justify-center p-4 font-sans">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-brand-neutral-grey shadow-card space-y-6">
        <div className="text-center space-y-2">
          <Logo size="lg" className="justify-center mb-2" />
          <h1 className="text-2xl font-black text-brand-navy tracking-tight">
            Join the Rider Network
          </h1>
          <p className="text-xs text-brand-slate">
            Crowdsourced road safety foresight for urban two-wheeler riders
          </p>
        </div>

        <form onSubmit={handleSignup} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-brand-navy block mb-1">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Kushal Gowda"
              className="w-full p-3 rounded-xl border border-brand-neutral-grey focus:ring-2 focus:ring-brand-orange/40 text-brand-navy"
            />
          </div>

          <div>
            <label className="font-bold text-brand-navy block mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="kushal@example.com"
              className="w-full p-3 rounded-xl border border-brand-neutral-grey focus:ring-2 focus:ring-brand-orange/40 text-brand-navy"
            />
          </div>

          <div>
            <label className="font-bold text-brand-navy block mb-1">Primary Commute Locality</label>
            <input
              type="text"
              required
              value={locality}
              onChange={(e) => setLocality(e.target.value)}
              placeholder="e.g. Indiranagar, Bengaluru"
              className="w-full p-3 rounded-xl border border-brand-neutral-grey focus:ring-2 focus:ring-brand-orange/40 text-brand-navy"
            />
          </div>

          <div className="bg-brand-warm-white p-3 rounded-xl border border-brand-neutral-grey text-[11px] text-brand-slate">
            By joining, you agree to follow the <strong>Stop-First Safety Protocol</strong> and never operate your device while riding.
          </div>

          <button
            type="submit"
            className="w-full py-3.5 px-4 rounded-xl bg-brand-orange hover:bg-brand-orange-hover text-white font-extrabold text-sm shadow-md shadow-brand-orange/20 transition-all cursor-pointer"
          >
            Create Rider Account
          </button>
        </form>

        <div className="text-center text-xs text-brand-slate">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-orange font-bold hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

