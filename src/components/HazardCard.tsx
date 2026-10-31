import React, { useState } from 'react';
import { Hazard } from '../types';
import { SeverityBadge, StatusBadge, CategoryLabel, WaterlogHazardWarningPill } from './HazardBadge';
import { HazardTrustTimeline } from './HazardTrustTimeline';
import { StorageService } from '../services/storageService';
import {
  MapPin,
  Clock,
  ThumbsUp,
  ThumbsDown,
  Activity,
  CheckCircle,
  Flag,
  Share2,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Eye,
  Camera,
  Waves,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';

interface HazardCardProps {
  hazard: Hazard;
  onSelect?: (hazard: Hazard) => void;
  onVoteSuccess?: () => void;
  compact?: boolean;
}

export const HazardCard: React.FC<HazardCardProps> = ({
  hazard,
  onSelect,
  onVoteSuccess,
  compact = false
}) => {
  const [hasVoted, setHasVoted] = useState<'still' | 'gone' | null>(null);
  const [voteFeedback, setVoteFeedback] = useState<string | null>(null);
  const [showTimeline, setShowTimeline] = useState(false);

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

  const isWaterlog =
    hazard.category === 'waterlogged_road' ||
    hazard.category === 'waterlogging' ||
    hazard.additionalLabel === 'POTENTIALLY_HIDDEN_SURFACE_HAZARD';

  const evidence = hazard.evidence || {
    independentRiderConfirmations: hazard.confirmationsCount || 0,
    uniqueUserIdsConfirmed: [],
    hasPhotoEvidence: !!hazard.primaryImageUrl,
    lastConfirmedAt: hazard.lastUpdatedAt || hazard.firstReportedAt,
    sensorCandidateCount: hazard.sensorDetected ? 1 : 0,
    isDisputed: false
  };

  const handleVote = (type: 'still_present' | 'no_longer_present') => {
    StorageService.confirmHazard(hazard.id, type);
    setHasVoted(type === 'still_present' ? 'still' : 'gone');
    setVoteFeedback(
      type === 'still_present'
        ? 'Confirmed hazard is still present (+15 pts)'
        : 'Voted hazard is no longer present'
    );
    setTimeout(() => setVoteFeedback(null), 3000);
    if (onVoteSuccess) onVoteSuccess();
  };

  return (
    <div
      className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden flex flex-col ${
        isWaterlog
          ? 'border-blue-300 shadow-sm ring-1 ring-blue-100'
          : 'border-brand-neutral-grey/80 shadow-subtle hover:shadow-card'
      } ${compact ? 'p-3' : 'p-4 sm:p-5'}`}
    >
      {/* Card Header: Badges & Time */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-1.5 flex-wrap">
          <SeverityBadge severity={hazard.severity} size="sm" />
          <StatusBadge status={hazard.canonicalStatus || hazard.status} size="sm" />
          {isWaterlog && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
              <Waves className="w-3 h-3 text-blue-600" />
              Surface Obscured
            </span>
          )}
        </div>
        <span className="text-[11px] font-medium text-brand-slate flex items-center gap-1 flex-shrink-0">
          <Clock className="w-3 h-3" />
          {timeAgo(evidence.lastConfirmedAt || hazard.lastUpdatedAt)}
        </span>
      </div>

      {/* Waterlog specific advisory callout */}
      {isWaterlog && !compact && (
        <div className="mb-3">
          <WaterlogHazardWarningPill />
        </div>
      )}

      {/* Main Image & Title */}
      <div className="flex gap-3.5 mb-3">
        {hazard.primaryImageUrl && (
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-brand-soft-blue flex-shrink-0 border border-brand-neutral-grey">
            <img
              src={hazard.primaryImageUrl}
              alt={hazard.title}
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105 cursor-pointer"
              onClick={() => onSelect && onSelect(hazard)}
              loading="lazy"
            />
            {hazard.isDemo && (
              <span className="absolute bottom-1 right-1 bg-brand-navy/90 text-white text-[9px] font-bold px-1.5 py-0.5 rounded backdrop-blur-sm">
                DEMO
              </span>
            )}
          </div>
        )}

        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div>
            <h4
              onClick={() => onSelect && onSelect(hazard)}
              className="font-bold text-sm sm:text-base text-brand-navy hover:text-brand-orange transition-colors cursor-pointer line-clamp-2 leading-snug"
            >
              {hazard.title}
            </h4>
            <p className="text-xs text-brand-slate line-clamp-2 mt-1 leading-relaxed">
              {hazard.description}
            </p>
          </div>

          <div className="flex items-center gap-1 text-xs text-brand-slate font-medium mt-1">
            <MapPin className="w-3.5 h-3.5 text-brand-orange flex-shrink-0" />
            <span className="truncate">{hazard.locality}</span>
            <span className="text-slate-300">•</span>
            <span className="text-brand-slate-light truncate text-[11px]">{hazard.address}</span>
          </div>
        </div>
      </div>

      {/* Evidence-Backed Fact Strip (Separates confirmed facts from suggestions) */}
      <div className="bg-brand-warm-white rounded-xl p-2.5 mb-3 border border-brand-neutral-grey/60 text-xs space-y-2">
        <div className="flex items-center justify-between flex-wrap gap-2 text-[11px]">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Independent Confirmations */}
            <span className="inline-flex items-center gap-1 font-semibold text-brand-navy bg-white px-2 py-0.5 rounded border border-brand-neutral-grey/80">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              {evidence.independentRiderConfirmations} {evidence.independentRiderConfirmations === 1 ? 'rider' : 'riders'} confirmed
            </span>

            {/* Photo Evidence */}
            {evidence.hasPhotoEvidence && (
              <span className="inline-flex items-center gap-1 font-semibold text-brand-navy bg-white px-2 py-0.5 rounded border border-brand-neutral-grey/80">
                <Camera className="w-3 h-3 text-brand-orange" />
                Photo
              </span>
            )}

            {/* Sensor Spike */}
            {evidence.sensorCandidateCount > 0 && (
              <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                <Activity className="w-3 h-3 text-emerald-600" />
                {evidence.sensorCandidateCount} sensor {evidence.sensorCandidateCount === 1 ? 'spike' : 'spikes'}
              </span>
            )}
          </div>

          {/* Trust Timeline Toggle Button */}
          <button
            onClick={() => setShowTimeline(!showTimeline)}
            className="text-[11px] font-bold text-brand-orange hover:text-brand-orange-hover flex items-center gap-0.5"
          >
            <span>Trust Timeline</span>
            {showTimeline ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Distress Classification (if available) - Clearly labeled */}
        {evidence.aiSuggestion && (
          <div className="text-[10px] text-brand-slate bg-brand-warm-white px-2 py-1 rounded-md border border-brand-neutral-grey flex items-center justify-between">
            <span>
              <strong className="text-brand-navy">Distress Tag:</strong> {evidence.aiSuggestion.category} ({evidence.aiSuggestion.damageType})
            </span>
            <span className="font-mono font-bold text-brand-navy">
              RDD2022
            </span>
          </div>
        )}
      </div>

      {/* Expandable Trust Timeline */}
      {showTimeline && (
        <div className="mb-3 pt-2 border-t border-brand-neutral-grey/60 animate-fadeIn">
          <HazardTrustTimeline hazard={hazard} />
        </div>
      )}

      {/* Feedback Toast */}
      {voteFeedback && (
        <div className="mb-2 text-xs bg-brand-green-light border border-green-200 text-brand-green p-2 rounded-lg text-center font-medium animate-fadeIn">
          {voteFeedback}
        </div>
      )}

      {/* Community Verification Actions */}
      <div className="flex items-center justify-between pt-1 border-t border-brand-neutral-grey/50 gap-2">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={() => handleVote('still_present')}
            disabled={hasVoted !== null}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              hasVoted === 'still'
                ? 'bg-brand-orange text-white'
                : 'bg-brand-soft-blue text-brand-navy hover:bg-brand-orange/15 hover:text-brand-orange'
            }`}
            title="Confirm hazard is still on the road"
          >
            <ThumbsUp className="w-3.5 h-3.5" />
            <span>Still Present ({hazard.stillPresentVotes})</span>
          </button>

          <button
            onClick={() => handleVote('no_longer_present')}
            disabled={hasVoted !== null}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              hasVoted === 'gone'
                ? 'bg-brand-green text-white'
                : 'bg-slate-100 text-brand-slate hover:bg-slate-200 hover:text-brand-navy'
            }`}
            title="Mark as repaired or no longer present"
          >
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Repaired ({hazard.noLongerPresentVotes})</span>
          </button>
        </div>

        <button
          onClick={() => onSelect && onSelect(hazard)}
          className="text-xs font-semibold text-brand-orange hover:text-brand-orange-hover flex items-center gap-0.5"
        >
          <span>Inspect</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
