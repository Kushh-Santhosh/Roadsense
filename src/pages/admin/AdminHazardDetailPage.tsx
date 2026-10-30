import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { StorageService } from '../../services/storageService';
import { Hazard, VerificationStatus } from '../../types';
import { StatusBadge, SeverityBadge, CategoryLabel } from '../../components/HazardBadge';
import { LeafletMap } from '../../components/LeafletMap';
import {
  ArrowLeft,
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Activity,
  Upload,
  FileText,
  Shield,
  Building2,
  Users
} from 'lucide-react';

export const AdminHazardDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [hazard, setHazard] = useState<Hazard | null>(null);

  // Form State
  const [status, setStatus] = useState<VerificationStatus>('submitted');
  const [assignedTeam, setAssignedTeam] = useState('');
  const [internalNotes, setInternalNotes] = useState('');
  const [resolutionRemarks, setResolutionRemarks] = useState('');
  const [resolutionEvidenceUrl, setResolutionEvidenceUrl] = useState('');
  const [savedNotice, setSavedNotice] = useState(false);

  useEffect(() => {
    if (id) {
      const found = StorageService.getHazardById(id);
      if (found) {
        setHazard(found);
        setStatus(found.status);
        setAssignedTeam(found.assignedTeam || '');
        setInternalNotes(found.internalNotes || '');
        setResolutionRemarks(found.resolutionRemarks || '');
        setResolutionEvidenceUrl(found.resolutionEvidenceUrl || '');
      }
    }
  }, [id]);

  if (!hazard) {
    return (
      <div className="min-h-screen bg-brand-warm-white py-16 text-center font-sans">
        <h2 className="text-xl font-bold text-brand-navy">Hazard Not Found</h2>
        <Link to="/admin/reports" className="text-brand-orange underline text-sm mt-2 block">
          Return to Dispatch Table
        </Link>
      </div>
    );
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    StorageService.updateHazardStatus(id, status, {
      assignedTeam,
      internalNotes,
      resolutionRemarks,
      resolutionEvidenceUrl: resolutionEvidenceUrl || undefined
    });

    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
    const updated = StorageService.getHazardById(id);
    if (updated) setHazard(updated);
  };

  return (
    <div className="min-h-screen bg-brand-warm-white py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            to="/admin/reports"
            className="flex items-center gap-1.5 text-xs font-bold text-brand-slate hover:text-brand-navy transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Review Queue
          </Link>
          <span className="font-mono text-xs text-brand-slate bg-white px-2 py-1 rounded-md border border-brand-neutral-grey">
            ID: {hazard.id}
          </span>
        </div>

        {savedNotice && (
          <div className="bg-brand-green-light border border-green-200 text-brand-green p-3 rounded-2xl text-xs font-bold text-center animate-fadeIn">
            ✓ Remediation record and audit trail updated successfully.
          </div>
        )}

        {/* Hazard Title Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-neutral-grey shadow-subtle space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <SeverityBadge severity={hazard.severity} />
              <StatusBadge status={hazard.status} />
              {hazard.aiDetected && (
                <span className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 text-xs font-bold border border-purple-200 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-purple-600" />
                  AI RDD2022 Classified
                </span>
              )}
            </div>
            <span className="text-xs text-brand-slate flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              First Reported: {new Date(hazard.firstReportedAt).toLocaleString()}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-navy tracking-tight">
            {hazard.title}
          </h1>

          <div className="flex items-center gap-2 text-xs text-brand-slate font-medium">
            <MapPin className="w-4 h-4 text-brand-orange" />
            <span>{hazard.locality}</span>
            <span>•</span>
            <span>{hazard.address}</span>
            <span>•</span>
            <span className="font-mono text-slate-500">[{hazard.latitude.toFixed(5)}, {hazard.longitude.toFixed(5)}]</span>
          </div>
        </div>

        {/* Grid: Evidence Photographs & Map Location */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Photos */}
          <div className="bg-white rounded-3xl p-6 border border-brand-neutral-grey shadow-subtle space-y-4">
            <h3 className="text-sm font-bold text-brand-navy uppercase tracking-wider">
              Photographic Evidence
            </h3>
            <div className="rounded-2xl overflow-hidden bg-slate-100 h-64 border border-brand-neutral-grey">
              <img
                src={hazard.primaryImageUrl}
                alt={hazard.title}
                className="w-full h-full object-cover"
              />
            </div>
            <p className="text-xs text-brand-slate leading-relaxed">
              {hazard.description}
            </p>
          </div>

          {/* Leaflet Map Preview */}
          <div className="bg-white rounded-3xl p-6 border border-brand-neutral-grey shadow-subtle space-y-4">
            <h3 className="text-sm font-bold text-brand-navy uppercase tracking-wider">
              Geospatial Coordinates
            </h3>
            <div className="h-64 rounded-2xl overflow-hidden border border-brand-neutral-grey">
              <LeafletMap
                hazards={[hazard]}
                center={[hazard.latitude, hazard.longitude]}
                zoom={16}
                height="100%"
                showFilters={false}
              />
            </div>
            <div className="text-xs text-brand-slate flex justify-between">
              <span>Ward / Division: {hazard.locality}</span>
              <span className="font-bold text-brand-navy">Confidence: {hazard.confidenceScore}%</span>
            </div>
          </div>
        </div>

        {/* Authority Dispatch & Resolution Worksheet Form */}
        <form onSubmit={handleSave} className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-neutral-grey shadow-subtle space-y-6">
          <div className="border-b border-brand-neutral-grey pb-3">
            <h3 className="text-base font-bold text-brand-navy uppercase tracking-wider flex items-center gap-2">
              <Building2 className="w-5 h-5 text-brand-orange" />
              Remediation Action & Municipal Dispatch Sign-off
            </h3>
            <p className="text-xs text-brand-slate mt-0.5">
              Updates will automatically sync to citizen rider map and audit trail.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-brand-navy block">
                Verification & Repair Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as VerificationStatus)}
                className="w-full p-2.5 rounded-xl border border-brand-neutral-grey bg-white text-xs font-semibold text-brand-navy focus:ring-2 focus:ring-brand-orange/40"
              >
                <option value="submitted">Submitted (Awaiting Triage)</option>
                <option value="under_verification">Under Verification (Site Inspection Required)</option>
                <option value="community_confirmed">Community Confirmed</option>
                <option value="forwarded_review">Forwarded for Engineering Review</option>
                <option value="resolved">Resolved (Repaired & Patched)</option>
                <option value="rejected">Rejected (Not a Hazard / False Alarm)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-brand-navy block">
                Assigned Maintenance Squad / Contractor
              </label>
              <input
                type="text"
                value={assignedTeam}
                onChange={(e) => setAssignedTeam(e.target.value)}
                placeholder="e.g. North Zone Rapid Cold-Mix Squad 4"
                className="w-full p-2.5 rounded-xl border border-brand-neutral-grey text-xs text-brand-navy font-medium"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-brand-navy block">
              Internal Maintenance Notes
            </label>
            <textarea
              rows={2}
              value={internalNotes}
              onChange={(e) => setInternalNotes(e.target.value)}
              placeholder="e.g. High vehicular volume; schedule cold asphalt rolling during non-peak window (11:00 AM - 3:00 PM)..."
              className="w-full p-3 rounded-2xl border border-brand-neutral-grey text-xs text-brand-navy"
            />
          </div>

          {status === 'resolved' && (
            <div className="p-4 bg-brand-green-light border border-green-200 rounded-2xl space-y-4 animate-fadeIn">
              <h4 className="text-xs font-bold text-brand-green uppercase flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                Resolution Completion Proof & Remarks
              </h4>

              <div className="space-y-2">
                <label className="text-xs font-bold text-brand-navy block">
                  Post-Repair Remarks
                </label>
                <textarea
                  rows={2}
                  value={resolutionRemarks}
                  onChange={(e) => setResolutionRemarks(e.target.value)}
                  placeholder="e.g. Bituminous hot-mix patching completed; level compacted and surface swept."
                  className="w-full p-3 rounded-xl border border-green-300 text-xs bg-white text-brand-navy"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-brand-navy block">
                  Post-Repair Proof Photo URL
                </label>
                <input
                  type="text"
                  value={resolutionEvidenceUrl}
                  onChange={(e) => setResolutionEvidenceUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/... or uploaded photo link"
                  className="w-full p-2.5 rounded-xl border border-green-300 text-xs bg-white text-brand-navy font-mono"
                />
              </div>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 px-6 rounded-2xl bg-brand-orange hover:bg-brand-orange-hover text-white font-extrabold text-sm shadow-md shadow-brand-orange/20 transition-all cursor-pointer"
            >
              Update Hazard Record & Record Audit Log
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
