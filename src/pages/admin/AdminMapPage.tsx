import React, { useState, useEffect } from 'react';
import { StorageService } from '../../services/storageService';
import { Hazard, HazardCategory, HazardSeverity, VerificationStatus } from '../../types';
import { LeafletMap } from '../../components/LeafletMap';
import { HazardCard } from '../../components/HazardCard';
import { Link } from 'react-router-dom';
import {
  MapPin,
  Filter,
  Layers,
  ArrowRight,
  ShieldAlert,
  Building2,
  X
} from 'lucide-react';

export const AdminMapPage: React.FC = () => {
  const [hazards, setHazards] = useState<Hazard[]>([]);
  const [selectedHazard, setSelectedHazard] = useState<Hazard | null>(null);

  // Filters
  const [localityFilter, setLocalityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    setHazards(StorageService.getHazards());
  }, []);

  const localities = Array.from(new Set(hazards.map((h) => h.locality)));

  const filteredHazards = hazards.filter((h) => {
    if (localityFilter !== 'all' && h.locality !== localityFilter) return false;
    if (statusFilter !== 'all') {
      const matchLegacy = h.status === statusFilter;
      const matchCanonical = h.canonicalStatus === statusFilter;
      if (!matchLegacy && !matchCanonical) return false;
    }
    if (severityFilter !== 'all' && h.severity !== severityFilter) return false;
    if (categoryFilter !== 'all') {
      if (categoryFilter === 'waterlogged_road') {
        if (h.category !== 'waterlogged_road' && h.additionalLabel !== 'POTENTIALLY_HIDDEN_SURFACE_HAZARD') {
          return false;
        }
      } else if (h.category !== categoryFilter) {
        return false;
      }
    }
    return true;
  });

  return (
    <div className="h-[calc(100vh-6.5rem)] flex flex-col font-sans bg-brand-warm-white overflow-hidden">
      {/* Top Filter Header */}
      <div className="bg-brand-navy text-white px-4 py-3 flex flex-wrap items-center justify-between gap-3 z-20 flex-shrink-0">
        <div className="flex items-center gap-2">
          <Building2 className="w-5 h-5 text-brand-orange" />
          <h1 className="text-base font-extrabold">
            Geographic Intelligence & Municipal Road Heatmap
          </h1>
          <span className="text-xs bg-white/10 px-2 py-0.5 rounded text-brand-slate-light">
            {filteredHazards.length} Incidents Displayed
          </span>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-2 text-xs flex-wrap">
          {/* Locality Ward Filter */}
          <select
            value={localityFilter}
            onChange={(e) => setLocalityFilter(e.target.value)}
            className="bg-brand-navy-light text-white border border-white/20 rounded-lg px-2.5 py-1.5 focus:outline-none"
          >
            <option value="all">All Localities / Wards</option>
            {localities.map((loc) => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-brand-navy-light text-white border border-white/20 rounded-lg px-2.5 py-1.5 focus:outline-none"
          >
            <option value="all">All Hazard Types</option>
            <option value="waterlogged_road">🌊 Waterlogged Road</option>
            <option value="pothole">🕳️ Potholes</option>
            <option value="road_cracks">Road Cracks</option>
            <option value="damaged_manhole">Damaged Manhole</option>
            <option value="open_drain">Open Drain</option>
            <option value="road_construction">Construction</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-brand-navy-light text-white border border-white/20 rounded-lg px-2.5 py-1.5 focus:outline-none"
          >
            <option value="all">All Verification Stages</option>
            <option value="NEWLY_REPORTED">NEWLY_REPORTED</option>
            <option value="UNDER_REVIEW">UNDER_REVIEW</option>
            <option value="COMMUNITY_CORROBORATED">COMMUNITY_CORROBORATED</option>
            <option value="RECENTLY_CONFIRMED">RECENTLY_CONFIRMED</option>
            <option value="STALE_NEEDS_RECONFIRMATION">STALE_NEEDS_RECONFIRMATION</option>
            <option value="CONFIRMED_RESOLVED">CONFIRMED_RESOLVED</option>
            <option value="DISPUTED">DISPUTED</option>
            <option value="submitted">Legacy: Submitted</option>
            <option value="community_confirmed">Legacy: Confirmed</option>
            <option value="resolved">Legacy: Resolved</option>
          </select>

          {/* Severity Filter */}
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="bg-brand-navy-light text-white border border-white/20 rounded-lg px-2.5 py-1.5 focus:outline-none"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="moderate">Moderate</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
      </div>

      {/* Main Map with Detail Drawer */}
      <div className="flex-1 relative flex overflow-hidden">
        <div className="flex-1 h-full relative flex flex-col min-w-0">
          <LeafletMap
            hazards={filteredHazards}
            selectedHazard={selectedHazard}
            onSelectHazard={(h) => setSelectedHazard(h)}
            height="100%"
            showFilters={false}
          />
        </div>

        {selectedHazard && (
          <div className="absolute right-4 top-4 bottom-4 w-80 sm:w-96 bg-white rounded-3xl p-5 border border-brand-neutral-grey shadow-modal z-30 flex flex-col justify-between overflow-y-auto animate-fadeIn">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-brand-neutral-grey">
                <span className="text-xs font-bold text-brand-orange uppercase">Hazard Inspection</span>
                <button onClick={() => setSelectedHazard(null)}>
                  <X className="w-4 h-4 text-brand-slate" />
                </button>
              </div>

              <HazardCard hazard={selectedHazard} />

              <div className="space-y-2 text-xs bg-brand-warm-white p-3 rounded-2xl border border-brand-neutral-grey">
                <div className="flex justify-between font-bold text-brand-navy">
                  <span>Assigned Squad:</span>
                  <span>{selectedHazard.assignedTeam || 'None assigned'}</span>
                </div>
                <div className="flex justify-between text-brand-slate">
                  <span>Internal Notes:</span>
                  <span>{selectedHazard.internalNotes || 'Pending inspection'}</span>
                </div>
              </div>
            </div>

            <Link
              to={`/admin/hazards/${selectedHazard.id}`}
              className="mt-4 w-full py-2.5 px-4 rounded-xl bg-brand-orange text-white text-xs font-bold text-center hover:bg-brand-orange-hover transition-all flex items-center justify-center gap-1.5"
            >
              <span>Open Detailed Sign-Off Worksheet</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

