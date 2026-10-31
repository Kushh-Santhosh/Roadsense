import React, { useState, useEffect } from 'react';
import { StorageService } from '../services/storageService';
import { Hazard, HazardReport } from '../types';
import { StatusBadge, SeverityBadge, CategoryLabel } from '../components/HazardBadge';
import { Link } from 'react-router-dom';
import {
  FileText,
  MapPin,
  Clock,
  ThumbsUp,
  AlertTriangle,
  CheckCircle2,
  Activity,
  ArrowRight,
  Plus
} from 'lucide-react';

export const MyReportsPage: React.FC = () => {
  const [hazards, setHazards] = useState<Hazard[]>([]);
  const currentUser = StorageService.getCurrentUser();

  useEffect(() => {
    setHazards(StorageService.getHazards());
  }, []);

  // Filter hazards reported by or confirmed by current user
  const userReports: Hazard[] = hazards.filter(
    (h) =>
      h.reports?.some((r) => r.userId === currentUser.id) ||
      h.confirmations?.some((c) => c.userId === currentUser.id)
  );

  return (
    <div className="min-h-screen bg-brand-warm-white py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-orange mb-1">
              <FileText className="w-3.5 h-3.5" />
              Community Contributions Record
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-navy tracking-tight">
              My Submitted Reports & Verifications
            </h1>
            <p className="text-sm text-brand-slate mt-1">
              Track the verification status, community confirmations, and municipal repair resolutions of your reports.
            </p>
          </div>

          <Link
            to="/app/report"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-orange hover:bg-brand-orange-hover text-white text-xs font-bold transition-all shadow-subtle self-start"
          >
            <Plus className="w-4 h-4" />
            New Report
          </Link>
        </div>

        {/* User stats overview */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-brand-neutral-grey shadow-subtle">
            <span className="text-xs text-brand-slate uppercase font-semibold">Total Submissions</span>
            <div className="text-2xl font-extrabold text-brand-navy mt-1">{currentUser.reportsCount}</div>
            <div className="text-[11px] text-brand-slate-light">Submitted to network</div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-brand-neutral-grey shadow-subtle">
            <span className="text-xs text-brand-slate uppercase font-semibold">Confirmations</span>
            <div className="text-2xl font-extrabold text-brand-navy mt-1">{currentUser.confirmationsCount}</div>
            <div className="text-[11px] text-brand-slate-light">Commuter verifications</div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-brand-neutral-grey shadow-subtle">
            <span className="text-xs text-brand-slate uppercase font-semibold">Active Hazards</span>
            <div className="text-2xl font-extrabold text-brand-orange mt-1">
              {userReports.filter((h) => h.status !== 'resolved').length}
            </div>
            <div className="text-[11px] text-brand-slate-light">Pending municipal repair</div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-brand-neutral-grey shadow-subtle">
            <span className="text-xs text-brand-slate uppercase font-semibold">Repaired</span>
            <div className="text-2xl font-extrabold text-emerald-600 mt-1">
              {userReports.filter((h) => h.status === 'resolved').length}
            </div>
            <div className="text-[11px] text-brand-slate-light">Confirmed remediated</div>
          </div>
        </div>

        {/* Reports Timeline List */}
        <div className="space-y-4">
          {userReports.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 border border-brand-neutral-grey text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-orange-100 text-brand-orange mx-auto flex items-center justify-center">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-brand-navy">No Reports Submitted Yet</h3>
              <p className="text-xs text-brand-slate max-w-sm mx-auto">
                Encountered a pothole, open manhole, or waterlogged dip? Submit your first road hazard report in under 20 seconds.
              </p>
              <Link
                to="/app/report"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-orange text-white text-xs font-bold shadow-subtle"
              >
                Report a Hazard Now
              </Link>
            </div>
          ) : (
            userReports.map((hazard) => (
              <div
                key={hazard.id}
                className="bg-white rounded-3xl p-5 border border-brand-neutral-grey shadow-subtle space-y-4 hover:shadow-card transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-brand-neutral-grey/60 pb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <StatusBadge status={hazard.status} />
                    <SeverityBadge severity={hazard.severity} size="sm" />
                    <span className="text-xs font-mono font-bold text-slate-400">ID: {hazard.id}</span>
                  </div>
                  <span className="text-xs text-brand-slate flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    First Reported: {new Date(hazard.firstReportedAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  {hazard.primaryImageUrl && (
                    <img
                      src={hazard.primaryImageUrl}
                      alt={hazard.title}
                      className="w-full sm:w-36 h-28 rounded-2xl object-cover bg-slate-100 flex-shrink-0 border border-brand-neutral-grey"
                    />
                  )}

                  <div className="flex-1 space-y-2">
                    <h3 className="font-extrabold text-base text-brand-navy leading-snug">
                      {hazard.title}
                    </h3>
                    <p className="text-xs text-brand-slate leading-relaxed">
                      {hazard.description}
                    </p>

                    <div className="flex items-center gap-2 text-xs text-brand-slate flex-wrap pt-1">
                      <span className="flex items-center gap-1 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-brand-orange" />
                        {hazard.locality} ({hazard.address})
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="font-semibold text-brand-navy">
                        Confidence: {hazard.confidenceScore}%
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="text-brand-orange font-bold">
                        {hazard.confirmationsCount} Community Confirmations
                      </span>
                    </div>

                    {/* Resolution evidence if resolved */}
                    {hazard.status === 'resolved' && hazard.resolutionRemarks && (
                      <div className="bg-brand-green-light border border-green-200 p-3 rounded-2xl text-xs text-brand-green mt-2 space-y-1">
                        <div className="font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" />
                          Repair Verified by Maintenance Squad
                        </div>
                        <p>{hazard.resolutionRemarks}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Status Timeline */}
                <div className="bg-brand-warm-white p-3 rounded-2xl border border-brand-neutral-grey/60 text-xs flex items-center justify-between">
                  <span className="text-brand-slate">
                    Verification Stage: <strong>{hazard.status.replace('_', ' ').toUpperCase()}</strong>
                  </span>
                  <Link
                    to="/app/map"
                    className="text-xs font-bold text-brand-orange hover:text-brand-orange-hover flex items-center gap-1"
                  >
                    View on Live Map <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

