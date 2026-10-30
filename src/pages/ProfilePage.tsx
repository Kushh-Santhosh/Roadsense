import React from 'react';
import { StorageService } from '../services/storageService';
import { DEMO_USERS } from '../data/seedData';
import {
  User,
  Shield,
  Award,
  MapPin,
  CheckCircle2,
  Calendar,
  Mail,
  Phone,
  RefreshCw,
  LogOut,
  Sparkles
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const currentUser = StorageService.getCurrentUser();
  const allUsers = DEMO_USERS;

  const handleSwitchUser = (userId: string) => {
    StorageService.setCurrentUser(userId);
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-brand-warm-white py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Profile Header Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-neutral-grey shadow-card space-y-6">
          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-24 h-24 rounded-3xl object-cover ring-4 ring-brand-orange/30 shadow-elevated"
            />
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-brand-orange/15 text-brand-orange text-xs font-bold uppercase tracking-wider">
                <Shield className="w-3.5 h-3.5" />
                {currentUser.role === 'rider' ? 'Verified Two-Wheeler Commuter' : 'Authority Engineer'}
              </div>
              <h1 className="text-2xl font-black text-brand-navy">{currentUser.name}</h1>
              <div className="text-xs text-brand-slate flex items-center justify-center sm:justify-start gap-2">
                <Mail className="w-3.5 h-3.5" />
                <span>{currentUser.email}</span>
                <span>•</span>
                <MapPin className="w-3.5 h-3.5 text-brand-orange" />
                <span>{currentUser.locality || 'Bengaluru, India'}</span>
              </div>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-brand-neutral-grey text-center">
            <div className="bg-brand-warm-white p-3.5 rounded-2xl border border-brand-neutral-grey">
              <div className="text-xs text-brand-slate font-semibold uppercase">Trust Score</div>
              <div className="text-2xl font-black text-brand-navy mt-1">{currentUser.trustScore}%</div>
              <div className="text-[10px] text-emerald-600 font-bold">Top 5% Rider</div>
            </div>
            <div className="bg-brand-warm-white p-3.5 rounded-2xl border border-brand-neutral-grey">
              <div className="text-xs text-brand-slate font-semibold uppercase">Community Pts</div>
              <div className="text-2xl font-black text-brand-orange mt-1">{currentUser.points}</div>
              <div className="text-[10px] text-brand-slate-light">Earned via verified reports</div>
            </div>
            <div className="bg-brand-warm-white p-3.5 rounded-2xl border border-brand-neutral-grey">
              <div className="text-xs text-brand-slate font-semibold uppercase">Submissions</div>
              <div className="text-2xl font-black text-brand-navy mt-1">{currentUser.reportsCount}</div>
              <div className="text-[10px] text-brand-slate-light">{currentUser.confirmationsCount} confirmations</div>
            </div>
          </div>
        </div>

        {/* Demo Persona Switcher */}
        <div className="bg-white rounded-3xl p-6 border border-brand-neutral-grey shadow-subtle space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-brand-navy">
                Demonstration Persona Switcher
              </h3>
              <p className="text-xs text-brand-slate">
                Switch between different riders and authority accounts to evaluate perspectives
              </p>
            </div>
            <span className="text-[11px] font-bold text-brand-orange bg-brand-orange/10 px-2 py-0.5 rounded">
              Demo Test Tool
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {allUsers.map((user) => {
              const isSelected = user.id === currentUser.id;
              return (
                <button
                  key={user.id}
                  onClick={() => handleSwitchUser(user.id)}
                  className={`p-3.5 rounded-2xl border text-left transition-all flex items-center gap-3 ${
                    isSelected
                      ? 'border-brand-orange bg-brand-orange/10 ring-2 ring-brand-orange/30'
                      : 'border-brand-neutral-grey hover:border-slate-300 bg-white'
                  }`}
                >
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-10 h-10 rounded-xl object-cover ring-2 ring-slate-200"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-brand-navy truncate">{user.name}</div>
                    <div className="text-[11px] text-brand-slate truncate capitalize">
                      {user.role} • {user.locality?.split(',')[0]}
                    </div>
                  </div>
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-brand-orange" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
