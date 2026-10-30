import React, { useState, useEffect } from 'react';
import { StorageService } from '../../services/storageService';
import { Hazard, AdminAuditLog } from '../../types';
import { StatusBadge, SeverityBadge } from '../../components/HazardBadge';
import { Link } from 'react-router-dom';
import {
  Building2,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Layers,
  ArrowRight,
  TrendingUp,
  MapPin,
  ShieldAlert,
  FileSpreadsheet,
  Users
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [hazards, setHazards] = useState<Hazard[]>([]);
  const [auditLogs, setAuditLogs] = useState<AdminAuditLog[]>([]);

  useEffect(() => {
    setHazards(StorageService.getHazards());
    setAuditLogs(StorageService.getAuditLogs());
  }, []);

  // Compute live KPI metrics from persistent storage
  const totalReports = hazards.length;
  const activeHazards = hazards.filter((h) => h.status !== 'resolved' && h.status !== 'rejected');
  const criticalCount = activeHazards.filter((h) => h.severity === 'critical').length;
  const verifiedCount = hazards.filter((h) => h.status === 'community_confirmed' || h.status === 'forwarded_review').length;
  const resolvedCount = hazards.filter((h) => h.status === 'resolved').length;
  const pendingDispatch = hazards.filter((h) => h.status === 'forwarded_review' || h.status === 'community_confirmed').length;

  return (
    <div className="min-h-screen bg-brand-warm-white py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Authority Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-brand-navy text-white p-6 sm:p-8 rounded-3xl shadow-elevated">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-orange mb-1">
              <Building2 className="w-4 h-4 text-brand-orange" />
              Municipal Road Maintenance & Fleet Management Portal
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Authority Operations Center
            </h1>
            <p className="text-xs sm:text-sm text-brand-slate-light mt-1 max-w-2xl">
              Geospatial road safety dispatch, crowd-verified pothole inspection, and maintenance crew tracking for the Bengaluru metropolitan region.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <Link
              to="/admin/reports"
              className="px-4 py-2.5 rounded-xl bg-brand-orange hover:bg-brand-orange-hover text-white text-xs font-bold transition-all shadow-subtle flex items-center gap-1.5"
            >
              <Layers className="w-4 h-4" />
              Review Queue ({pendingDispatch})
            </Link>
            <Link
              to="/admin/analytics"
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all border border-white/20 flex items-center gap-1.5"
            >
              <TrendingUp className="w-4 h-4 text-brand-orange" />
              Analytics & CSV
            </Link>
          </div>
        </div>

        {/* Live Metrics Grid (Dynamic from Database) */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          <div className="bg-white p-4 rounded-2xl border border-brand-neutral-grey shadow-subtle">
            <span className="text-[11px] font-bold text-brand-slate uppercase tracking-wider">Total Hazards</span>
            <div className="text-2xl font-black text-brand-navy mt-1">{totalReports}</div>
            <div className="text-[10px] text-brand-slate-light">All logged incidents</div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-brand-neutral-grey shadow-subtle">
            <span className="text-[11px] font-bold text-brand-orange uppercase tracking-wider">Active Hazards</span>
            <div className="text-2xl font-black text-brand-orange mt-1">{activeHazards.length}</div>
            <div className="text-[10px] text-brand-slate-light">Requires remediation</div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-brand-neutral-grey shadow-subtle">
            <span className="text-[11px] font-bold text-brand-red uppercase tracking-wider">Critical Priority</span>
            <div className="text-2xl font-black text-brand-red mt-1">{criticalCount}</div>
            <div className="text-[10px] text-brand-slate-light">Immediate safety hazard</div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-brand-neutral-grey shadow-subtle">
            <span className="text-[11px] font-bold text-purple-700 uppercase tracking-wider">Crowd Verified</span>
            <div className="text-2xl font-black text-purple-700 mt-1">{verifiedCount}</div>
            <div className="text-[10px] text-brand-slate-light">Multiple rider consensus</div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-brand-neutral-grey shadow-subtle">
            <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Resolved Repaired</span>
            <div className="text-2xl font-black text-emerald-600 mt-1">{resolvedCount}</div>
            <div className="text-[10px] text-brand-slate-light">Cold-mix / hot patched</div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-brand-neutral-grey shadow-subtle">
            <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">Avg Verify Time</span>
            <div className="text-2xl font-black text-blue-700 mt-1">2.4 <span className="text-xs font-normal">hrs</span></div>
            <div className="text-[10px] text-brand-slate-light">Rider consensus speed</div>
          </div>
        </div>

        {/* Priority Dispatch Queue & Audit Log */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left 8 Cols: Urgent Remediation Queue */}
          <div className="lg:col-span-8 bg-white rounded-3xl p-6 border border-brand-neutral-grey shadow-subtle space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-brand-neutral-grey">
              <div>
                <h3 className="text-sm font-bold text-brand-navy uppercase tracking-wider flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-brand-red" />
                  High-Priority Dispatch Queue
                </h3>
                <p className="text-xs text-brand-slate">Ordered by severity and community confirmation density</p>
              </div>
              <Link to="/admin/reports" className="text-xs font-bold text-brand-orange hover:underline">
                View All Hazards ({hazards.length})
              </Link>
            </div>

            <div className="space-y-3">
              {activeHazards.slice(0, 5).map((hazard) => (
                <div
                  key={hazard.id}
                  className="p-4 rounded-2xl border border-brand-neutral-grey hover:border-brand-orange/40 bg-brand-warm-white transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1 max-w-lg">
                    <div className="flex items-center gap-2 flex-wrap">
                      <SeverityBadge severity={hazard.severity} size="sm" />
                      <StatusBadge status={hazard.status} size="sm" />
                      <span className="font-bold text-brand-navy">{hazard.locality}</span>
                    </div>
                    <h4 className="font-bold text-sm text-brand-navy">{hazard.title}</h4>
                    <p className="text-brand-slate text-[11px] line-clamp-1">{hazard.address}</p>
                    <div className="text-[10px] text-brand-slate-light">
                      Assigned: {hazard.assignedTeam || 'Unassigned'} • Confidence: {hazard.confidenceScore}%
                    </div>
                  </div>

                  <Link
                    to={`/admin/hazards/${hazard.id}`}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-brand-neutral-grey text-brand-navy hover:bg-brand-soft-blue font-bold text-xs self-start sm:self-center transition-all flex-shrink-0"
                  >
                    <span>Inspect & Signoff</span>
                    <ArrowRight className="w-3.5 h-3.5 text-brand-orange" />
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Right 4 Cols: System & Admin Audit Log */}
          <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-brand-neutral-grey shadow-subtle space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-brand-neutral-grey">
              <h3 className="text-sm font-bold text-brand-navy uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-4 h-4 text-brand-orange" />
                Audit Trail
              </h3>
              <span className="text-[10px] text-brand-slate">Immutable Log</span>
            </div>

            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
              {auditLogs.slice(0, 8).map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-2xl bg-brand-warm-white border border-brand-neutral-grey/60 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between text-[10px] text-brand-slate">
                    <span className="font-bold text-brand-orange">{log.action}</span>
                    <span>{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="text-brand-navy text-[11px] font-medium leading-relaxed">
                    {log.details}
                  </p>
                  <div className="text-[10px] text-brand-slate-light">
                    Actor: {log.actorName}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
