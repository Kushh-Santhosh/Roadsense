import React from 'react';
import { HazardCategory, HazardSeverity, VerificationStatus, CanonicalVerificationStatus } from '../types';
import {
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  HelpCircle,
  Waves,
  RefreshCw,
  FileCheck
} from 'lucide-react';

interface SeverityBadgeProps {
  severity: HazardSeverity;
  size?: 'sm' | 'md';
}

export const SeverityBadge: React.FC<SeverityBadgeProps> = ({ severity, size = 'md' }) => {
  const configs = {
    critical: {
      label: 'Critical Hazard',
      bg: 'bg-red-50 text-brand-red border-brand-red/30',
      dot: 'bg-brand-red',
      icon: AlertTriangle
    },
    high: {
      label: 'High-Risk',
      bg: 'bg-orange-50 text-brand-orange border-brand-orange/30',
      dot: 'bg-brand-orange',
      icon: AlertCircle
    },
    moderate: {
      label: 'Moderate',
      bg: 'bg-amber-50 text-amber-700 border-amber-300',
      dot: 'bg-amber-500',
      icon: Info
    },
    resolved: {
      label: 'Resolved',
      bg: 'bg-green-50 text-brand-green border-green-300',
      dot: 'bg-brand-green',
      icon: CheckCircle2
    }
  };

  const current = configs[severity] || configs.high;
  const Icon = current.icon;
  const isSm = size === 'sm';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold rounded-full border ${current.bg} ${
        isSm ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${current.dot} animate-pulse`} />
      <Icon className={isSm ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      {current.label}
    </span>
  );
};

interface StatusBadgeProps {
  status: VerificationStatus | string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const configs: Record<
    string,
    { label: string; bg: string; icon: React.ComponentType<{ className?: string }> }
  > = {
    // Canonical 8 Statuses
    NEWLY_REPORTED: {
      label: 'Newly Reported',
      bg: 'bg-slate-100 text-brand-slate border-slate-300',
      icon: Clock
    },
    UNDER_REVIEW: {
      label: 'Under Review',
      bg: 'bg-blue-50 text-blue-700 border-blue-200',
      icon: Info
    },
    COMMUNITY_CORROBORATED: {
      label: 'Community Corroborated',
      bg: 'bg-purple-50 text-purple-700 border-purple-200',
      icon: ShieldCheck
    },
    RECENTLY_CONFIRMED: {
      label: 'Recently Confirmed',
      bg: 'bg-emerald-50 text-emerald-800 border-emerald-300',
      icon: CheckCircle2
    },
    DISPUTED: {
      label: 'Disputed Report',
      bg: 'bg-amber-50 text-amber-800 border-amber-300',
      icon: AlertCircle
    },
    STALE_NEEDS_RECONFIRMATION: {
      label: 'Stale (Needs Reconfirmation)',
      bg: 'bg-orange-50 text-amber-900 border-amber-300',
      icon: RefreshCw
    },
    RESOLUTION_SUBMITTED: {
      label: 'Resolution Submitted',
      bg: 'bg-teal-50 text-teal-800 border-teal-300',
      icon: FileCheck
    },
    CONFIRMED_RESOLVED: {
      label: 'Confirmed Resolved',
      bg: 'bg-green-50 text-brand-green border-green-200',
      icon: CheckCircle2
    },
    // Backward Compatibility aliases
    submitted: {
      label: 'Newly Reported',
      bg: 'bg-slate-100 text-brand-slate border-slate-300',
      icon: Clock
    },
    under_verification: {
      label: 'Under Review',
      bg: 'bg-blue-50 text-blue-700 border-blue-200',
      icon: Info
    },
    community_confirmed: {
      label: 'Community Corroborated',
      bg: 'bg-purple-50 text-purple-700 border-purple-200',
      icon: ShieldCheck
    },
    forwarded_review: {
      label: 'Under Review',
      bg: 'bg-amber-50 text-amber-800 border-amber-300',
      icon: AlertCircle
    },
    resolved: {
      label: 'Confirmed Resolved',
      bg: 'bg-green-50 text-brand-green border-green-200',
      icon: CheckCircle2
    },
    rejected: {
      label: 'Disputed',
      bg: 'bg-red-50 text-red-700 border-red-200',
      icon: XCircle
    }
  };

  const current = configs[status] || configs.NEWLY_REPORTED;
  const Icon = current.icon;
  const isSm = size === 'sm';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${current.bg} ${
        isSm ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'
      }`}
    >
      <Icon className={isSm ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      {current.label}
    </span>
  );
};

export const CanonicalStatusBadge: React.FC<StatusBadgeProps> = StatusBadge;

export const CategoryLabel: React.FC<{ category: HazardCategory; additionalLabel?: string }> = ({
  category,
  additionalLabel
}) => {
  const labels: Record<HazardCategory, string> = {
    pothole: 'Pothole',
    road_cracks: 'Road Cracks',
    uneven_surface: 'Uneven Road',
    waterlogged_road: 'Waterlogged Road',
    potentially_hidden_surface_hazard: 'Potentially Hidden Surface Hazard',
    open_drain: 'Open Drain',
    damaged_manhole: 'Damaged Manhole Cover',
    road_construction: 'Road Construction',
    loose_gravel_debris: 'Loose Gravel or Debris',
    fallen_tree_obstruction: 'Fallen Tree or Obstruction',
    damaged_edge: 'Damaged Road Edge',
    other: 'Other Road Hazard',
    // Aliases
    waterlogging: 'Waterlogged Road',
    open_manhole: 'Open Manhole',
    fallen_tree_debris: 'Fallen Tree / Debris',
    exposed_utility: 'Exposed Utility Trench'
  };

  return (
    <span className="inline-flex items-center gap-1">
      <span>{labels[category] || category}</span>
      {additionalLabel === 'POTENTIALLY_HIDDEN_SURFACE_HAZARD' && (
        <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded font-semibold">
          Surface Hidden
        </span>
      )}
    </span>
  );
};

export const WaterlogHazardWarningPill: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div
      className={`flex items-start gap-2 bg-blue-50 border border-blue-200 p-2.5 rounded-xl text-blue-900 text-xs ${className}`}
    >
      <Waves className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
      <div>
        <strong className="block font-semibold">Waterlogged Road — Potentially Hidden Surface Hazard:</strong>
        <span className="text-blue-800 text-[11px] leading-tight">
          Waterlogged road ahead. Road surface may be uneven. Proceed cautiously.
        </span>
      </div>
    </div>
  );
};
