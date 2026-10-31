import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { StorageService } from '../services/storageService';
import { Logo } from '../components/Logo';
import { Bike, Building2, ArrowRight, Shield, Sparkles } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleDemoRider = () => {
    StorageService.setCurrentUser('user-kushal');
    navigate('/app');
  };

  const handleDemoAdmin = () => {
    StorageService.setCurrentUser('admin-officer');
    navigate('/admin');
  };

  const handleLogin = (e: React.FormEvent) => {
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
            Sign In to RoadSense
          </h1>
          <p className="text-xs text-brand-slate">
            Road safety intelligence network for two-wheeler commuters
          </p>
        </div>

        {/* Demo Fast Logins */}
        <div className="space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-brand-slate text-center block">
            Fast One-Click Demo Access
          </span>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={handleDemoRider}
              className="p-3 rounded-2xl border border-brand-neutral-grey bg-brand-warm-white hover:bg-brand-soft-blue hover:border-brand-orange/40 text-left transition-all group"
            >
              <div className="flex items-center gap-1.5 text-xs font-bold text-brand-navy group-hover:text-brand-orange">
                <Bike className="w-4 h-4 text-brand-orange" />
                <span>Rider Mode</span>
              </div>
              <div className="text-[10px] text-brand-slate mt-0.5">Kushal (Commuter)</div>
            </button>

            <button
              onClick={handleDemoAdmin}
              className="p-3 rounded-2xl border border-brand-neutral-grey bg-brand-warm-white hover:bg-brand-soft-blue hover:border-brand-navy/40 text-left transition-all group"
            >
              <div className="flex items-center gap-1.5 text-xs font-bold text-brand-navy group-hover:text-brand-orange">
                <Building2 className="w-4 h-4 text-brand-orange" />
                <span>Authority Mode</span>
              </div>
              <div className="text-[10px] text-brand-slate mt-0.5">Eng. Narayanan</div>
            </button>
          </div>
        </div>

        <div className="relative flex items-center justify-center">
          <span className="absolute bg-white px-3 text-[11px] text-brand-slate-light">or sign in with email</span>
          <div className="w-full border-t border-brand-neutral-grey" />
        </div>

        {/* Login form */}
        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-brand-navy block mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="kushal@roadsense.dev"
              className="w-full p-3 rounded-xl border border-brand-neutral-grey focus:ring-2 focus:ring-brand-orange/40 text-brand-navy"
            />
          </div>

          <div>
            <label className="font-bold text-brand-navy block mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full p-3 rounded-xl border border-brand-neutral-grey focus:ring-2 focus:ring-brand-orange/40 text-brand-navy"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 px-4 rounded-xl bg-brand-orange hover:bg-brand-orange-hover text-white font-extrabold text-sm shadow-md shadow-brand-orange/20 transition-all cursor-pointer"
          >
            Sign In
          </button>
        </form>

        <div className="text-center text-xs text-brand-slate">
          Don&apos;t have an account?{' '}
          <Link to="/signup" className="text-brand-orange font-bold hover:underline">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
};

