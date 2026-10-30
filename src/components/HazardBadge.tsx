import React from 'react';
import { HazardCategory, HazardSeverity, VerificationStatus } from '../types';
import { AlertTriangle, AlertCircle, Info, CheckCircle2, XCircle, Clock } from 'lucide-react';

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
  status: VerificationStatus;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const configs: Record<
    VerificationStatus,
    { label: string; bg: string; icon: React.ComponentType<{ className?: string }> }
  > = {
    submitted: {
      label: 'Submitted',
      bg: 'bg-slate-100 text-brand-slate border-slate-300',
      icon: Clock
    },
    under_verification: {
      label: 'Under Verification',
      bg: 'bg-blue-50 text-blue-700 border-blue-200',
      icon: Info
    },
    community_confirmed: {
      label: 'Community Confirmed',
      bg: 'bg-purple-50 text-purple-700 border-purple-200',
      icon: CheckCircle2
    },
    forwarded_review: {
      label: 'Forwarded for Review',
      bg: 'bg-amber-50 text-amber-800 border-amber-300',
      icon: AlertCircle
    },
    resolved: {
      label: 'Resolved',
      bg: 'bg-green-50 text-brand-green border-green-200',
      icon: CheckCircle2
    },
    rejected: {
      label: 'Rejected',
      bg: 'bg-red-50 text-red-700 border-red-200',
      icon: XCircle
    }
  };

  const current = configs[status] || configs.submitted;
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

export const CategoryLabel: React.FC<{ category: HazardCategory }> = ({ category }) => {
  const labels: Record<HazardCategory, string> = {
    pothole: 'Pothole',
    road_cracks: 'Road Cracks',
    uneven_surface: 'Uneven Surface',
    open_manhole: 'Open Manhole',
    damaged_manhole: 'Damaged Manhole Cover',
    waterlogging: 'Waterlogging',
    road_construction: 'Road Construction',
    fallen_tree_debris: 'Fallen Tree / Debris',
    exposed_utility: 'Exposed Utility / Drain',
    damaged_edge: 'Damaged Road Edge',
    other: 'Other Road Hazard'
  };

  return <span>{labels[category] || category}</span>;
};
