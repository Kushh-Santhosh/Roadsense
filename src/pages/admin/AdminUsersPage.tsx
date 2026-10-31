import React, { useState } from 'react';
import { StorageService } from '../../services/storageService';
import { UserProfile } from '../../types';
import { DEMO_USERS } from '../../data/seedData';
import { Users, Shield, Award, Mail, CheckCircle2, UserCheck } from 'lucide-react';

export const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>(DEMO_USERS);

  return (
    <div className="min-h-screen bg-brand-warm-white py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-orange mb-1">
            <Users className="w-4 h-4 text-brand-orange" />
            Access Control & Community Reputation
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-navy tracking-tight">
            User Roles & Contributor Roster
          </h1>
          <p className="text-sm text-brand-slate mt-1">
            Manage rider accounts, authority engineers, and contributor trust ratings.
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-brand-neutral-grey shadow-subtle overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-brand-warm-white border-b border-brand-neutral-grey text-brand-slate font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-4">User</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Locality / Division</th>
                  <th className="p-4">Trust Score</th>
                  <th className="p-4">Contributions</th>
                  <th className="p-4">Joined Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-neutral-grey/70">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-brand-soft-blue/20 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-brand-navy text-white text-xs font-bold flex items-center justify-center flex-shrink-0 shadow-subtle border border-brand-neutral-grey">
                          {user.name
                            .split(' ')
                            .map((n) => n[0])
                            .filter(Boolean)
                            .slice(0, 2)
                            .join('')
                            .toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-sm text-brand-navy">{user.name}</div>
                          <div className="text-[11px] text-brand-slate font-mono">{user.email}</div>
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-bold uppercase text-[10px] ${
                          user.role === 'authority'
                            ? 'bg-brand-navy text-white'
                            : 'bg-brand-orange/15 text-brand-orange'
                        }`}
                      >
                        <Shield className="w-3 h-3" />
                        {user.role}
                      </span>
                    </td>

                    <td className="p-4 font-medium text-brand-navy">
                      {user.locality || 'Bengaluru, India'}
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-1.5 font-bold text-purple-700">
                        <Award className="w-3.5 h-3.5" />
                        <span>{user.trustScore}%</span>
                      </div>
                    </td>

                    <td className="p-4 text-brand-slate font-medium">
                      {user.reportsCount} reports • {user.confirmationsCount} confirmations
                    </td>

                    <td className="p-4 text-brand-slate-light">
                      {new Date(user.joinedAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

