import React from 'react';
import { Hazard, TrustTimelineEvent } from '../types';
import { StatusBadge } from './HazardBadge';
import {
  ShieldCheck,
  Camera,
  Activity,
  Clock,
  UserCheck,
  AlertCircle,
  FileCheck,
  CheckCircle2,
  Calendar,
  Layers
} from 'lucide-react';

interface HazardTrustTimelineProps {
  hazard: Hazard;
  className?: string;
}

export const HazardTrustTimeline: React.FC<HazardTrustTimelineProps> = ({ hazard, className = '' }) => {
  const timeAgo = (dateStr: string) => {
    if (!dateStr) return 'Recently';
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 60) return `${Math.max(1, mins)}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const getTimelineIcon = (type?: string) => {
    switch (type) {
      case 'citizen_report':
        return <Camera className="w-3.5 h-3.5 text-brand-orange" />;
      case 'community_vote':
        return <UserCheck className="w-3.5 h-3.5 text-blue-600" />;
      case 'ai_inference':
        return <Camera className="w-3.5 h-3.5 text-brand-orange" />;
      case 'sensor_candidate':
        return <Activity className="w-3.5 h-3.5 text-emerald-600" />;
      case 'authority_action':
        return <FileCheck className="w-3.5 h-3.5 text-blue-600" />;
      case 'n8n_automation':
        return <Layers className="w-3.5 h-3.5 text-amber-600" />;
      default:
        return <Clock className="w-3.5 h-3.5 text-brand-slate" />;
    }
  };

  const evidence = hazard.evidence || {
    independentRiderConfirmations: hazard.confirmationsCount || 0,
    uniqueUserIdsConfirmed: [],
    hasPhotoEvidence: !!hazard.primaryImageUrl,
    lastConfirmedAt: hazard.lastUpdatedAt || hazard.firstReportedAt,
    sensorCandidateCount: hazard.sensorDetected ? 1 : 0,
    isDisputed: false
  };

  return (
    <div className={`space-y-4 font-sans ${className}`}>
      {/* 1. Underlying Evidence Grid (Separate facts from suggestions) */}
      <div className="bg-brand-warm-white rounded-2xl p-4 border border-brand-neutral-grey space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-brand-navy uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-brand-orange" />
            Verified Evidence Breakdown
          </span>
          <StatusBadge status={hazard.canonicalStatus || hazard.status} size="sm" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
          {/* Fact 1: Independent Confirmations */}
          <div className="bg-white p-2.5 rounded-xl border border-brand-neutral-grey/70">
            <div className="text-[10px] text-brand-slate font-medium">Independent Confirmations</div>
            <div className="text-base font-extrabold text-brand-navy mt-0.5">
              {evidence.independentRiderConfirmations}{' '}
              <span className="text-[11px] font-normal text-brand-slate">riders</span>
            </div>
            <div className="text-[10px] text-emerald-700 font-semibold mt-0.5">
              {evidence.independentRiderConfirmations >= 2 ? '✓ Corroborated' : 'Awaiting 2nd rider'}
            </div>
          </div>

          {/* Fact 2: Photo Proof */}
          <div className="bg-white p-2.5 rounded-xl border border-brand-neutral-grey/70">
            <div className="text-[10px] text-brand-slate font-medium">Photo Evidence</div>
            <div className="text-sm font-bold text-brand-navy mt-1 flex items-center gap-1">
              <Camera className="w-3.5 h-3.5 text-brand-orange" />
              <span>{evidence.hasPhotoEvidence ? 'Attached' : 'None'}</span>
            </div>
            <div className="text-[10px] text-brand-slate-light mt-0.5">Visual verification</div>
          </div>

          {/* Fact 3: Sensor Observations */}
          <div className="bg-white p-2.5 rounded-xl border border-brand-neutral-grey/70">
            <div className="text-[10px] text-brand-slate font-medium">Sensor Candidates</div>
            <div className="text-base font-extrabold text-brand-navy mt-0.5 flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 text-emerald-600" />
              <span>{evidence.sensorCandidateCount}</span>
            </div>
            <div className="text-[10px] text-brand-slate-light">Accelerometer spikes</div>
          </div>

          {/* Fact 4: Last Confirmed */}
          <div className="bg-white p-2.5 rounded-xl border border-brand-neutral-grey/70">
            <div className="text-[10px] text-brand-slate font-medium">Last Confirmed</div>
            <div className="text-xs font-bold text-brand-navy mt-1 truncate">
              {timeAgo(evidence.lastConfirmedAt)}
            </div>
            <div className="text-[10px] text-brand-slate-light">Freshness monitor</div>
          </div>
        </div>

        {/* Technical Distress Suggestion (Distinctly labeled as a suggestion, not a verified fact) */}
        {evidence.aiSuggestion && (
          <div className="bg-brand-warm-white border border-brand-neutral-grey p-2.5 rounded-xl text-xs flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Camera className="w-4 h-4 text-brand-orange flex-shrink-0" />
              <div>
                <span className="font-bold text-brand-navy">Distress Tag: </span>
                <span className="text-brand-slate">{evidence.aiSuggestion.category}</span>
                <span className="text-brand-slate-light text-[11px] ml-1">({evidence.aiSuggestion.damageType})</span>
              </div>
            </div>
            <span className="text-[11px] bg-white px-2 py-0.5 rounded font-mono font-bold text-brand-navy border border-brand-neutral-grey">
              RDD2022
            </span>
          </div>
        )}
      </div>

      {/* 2. Chronological Trust Timeline */}
      <div className="bg-white rounded-2xl p-4 border border-brand-neutral-grey space-y-3">
        <h4 className="text-xs font-bold text-brand-navy uppercase tracking-wider flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-brand-orange" />
          Evidence Audit Trail & Trust Journey
        </h4>

        <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
          {(hazard.trustTimeline || []).map((event, idx) => (
            <div key={event.id || idx} className="relative group">
              {/* Timeline Node Bullet */}
              <div className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-white border-2 border-brand-orange flex items-center justify-center shadow-xs">
                <div className="w-1.5 h-1.5 rounded-full bg-brand-orange" />
              </div>

              <div className="text-xs space-y-0.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-brand-navy flex items-center gap-1.5">
                    {getTimelineIcon(event.evidenceType)}
                    {event.title}
                  </span>
                  <span className="text-[10px] text-brand-slate-light font-mono">
                    {new Date(event.timestamp).toLocaleDateString()} {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="text-[11px] text-brand-slate">
                  <strong>By:</strong> {event.actor}
                </div>
                <p className="text-[11px] text-brand-slate-light leading-relaxed">
                  {event.details}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

