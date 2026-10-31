import React, { useState, useEffect } from 'react';
import { LeafletMap } from '../components/LeafletMap';
import { HazardCard } from '../components/HazardCard';
import { StorageService } from '../services/storageService';
import { Hazard } from '../types';
import { Link } from 'react-router-dom';
import {
  MapPin,
  AlertTriangle,
  Layers,
  Filter,
  Shield,
  X,
  Compass,
  ArrowRight,
  RefreshCw,
  ChevronUp,
  ChevronDown,
  List
} from 'lucide-react';

export const LiveMapPage: React.FC = () => {
  const [hazards, setHazards] = useState<Hazard[]>([]);
  const [selectedHazard, setSelectedHazard] = useState<Hazard | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);

  const loadData = () => {
    setHazards(StorageService.getHazards());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSelectHazard = (h: Hazard) => {
    setSelectedHazard(h);
    // On mobile, auto-open bottom sheet with selected hazard
    setMobileSheetOpen(true);
  };

  return (
    <div className="h-[calc(100vh-7.5rem)] sm:h-[calc(100vh-6.5rem)] flex flex-col font-sans bg-brand-warm-white overflow-hidden relative">
      {/* Header bar */}
      <div className="bg-white border-b border-brand-neutral-grey/80 px-4 py-2.5 flex items-center justify-between z-20 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <MapPin className="w-5 h-5 text-brand-orange" />
          <div>
            <h1 className="text-sm sm:text-base font-extrabold text-brand-navy leading-tight">
              Live Road Hazard Map
            </h1>
            <span className="text-[10px] text-brand-slate font-medium hidden sm:inline">
              Bengaluru Metro Region • Real-time Corridor Intelligence
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Desktop Sidebar Toggle Button */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-brand-neutral-grey text-xs font-bold text-brand-navy hover:bg-brand-soft-blue transition-colors cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5 text-brand-orange" />
            <span>{sidebarOpen ? 'Hide Incidents' : 'Show Incidents'}</span>
          </button>

          {/* Mobile Incident Bottom Sheet Trigger Pill */}
          <button
            onClick={() => setMobileSheetOpen(!mobileSheetOpen)}
            className="md:hidden flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-brand-neutral-grey text-xs font-bold text-brand-navy bg-white hover:bg-brand-soft-blue transition-colors cursor-pointer"
          >
            <List className="w-3.5 h-3.5 text-brand-orange" />
            <span>{hazards.length} Incidents</span>
          </button>

          <Link
            to="/app/report"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-orange hover:bg-brand-orange-hover text-white text-xs font-bold transition-all shadow-subtle cursor-pointer"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Report Hazard</span>
            <span className="sm:hidden">Report</span>
          </Link>
        </div>
      </div>

      {/* Main Map Container & Responsive Layout */}
      <div className="flex-1 relative flex overflow-hidden w-full h-full">
        {/* Leaflet Map: Dominant Element */}
        <div className="flex-1 h-full relative flex flex-col min-w-0">
          <LeafletMap
            hazards={hazards}
            selectedHazard={selectedHazard}
            onSelectHazard={handleSelectHazard}
            height="100%"
            showFilters={true}
          />
        </div>

        {/* Desktop Sidebar Panel */}
        {sidebarOpen && (
          <aside className="hidden md:flex w-80 lg:w-96 bg-white border-l border-brand-neutral-grey/80 flex-col z-20 shadow-elevated flex-shrink-0">
            <div className="p-3.5 border-b border-brand-neutral-grey flex items-center justify-between bg-brand-warm-white">
              <div>
                <h3 className="font-bold text-xs uppercase tracking-wider text-brand-navy">
                  Active Road Hazards ({hazards.length})
                </h3>
                <p className="text-[11px] text-brand-slate">Ordered by community consensus</p>
              </div>
              {selectedHazard && (
                <button
                  onClick={() => setSelectedHazard(null)}
                  className="text-xs text-brand-orange font-bold hover:underline cursor-pointer"
                >
                  Clear Selection
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {selectedHazard ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-brand-orange">
                    <span>Selected Pin Inspection</span>
                    <button onClick={() => setSelectedHazard(null)} className="cursor-pointer">
                      <X className="w-4 h-4 text-brand-slate hover:text-brand-navy" />
                    </button>
                  </div>
                  <HazardCard hazard={selectedHazard} onVoteSuccess={loadData} />
                </div>
              ) : (
                hazards.map((hazard) => (
                  <HazardCard
                    key={hazard.id}
                    hazard={hazard}
                    onSelect={(h) => setSelectedHazard(h)}
                    onVoteSuccess={loadData}
                    compact={true}
                  />
                ))
              )}
            </div>
          </aside>
        )}

        {/* Mobile Map-First Bottom Sheet */}
        {mobileSheetOpen && (
          <div className="md:hidden fixed bottom-16 left-0 right-0 max-h-[58vh] bg-white rounded-t-3xl shadow-modal border-t border-brand-neutral-grey/90 z-30 flex flex-col overflow-hidden animate-fadeIn">
            {/* Grab Handle */}
            <div
              className="pt-2 pb-1 bg-brand-warm-white border-b border-brand-neutral-grey flex flex-col items-center cursor-pointer select-none"
              onClick={() => setMobileSheetOpen(false)}
            >
              <div className="w-10 h-1 rounded-full bg-slate-300 mb-1" />
              <div className="w-full px-4 flex items-center justify-between">
                <span className="text-xs font-bold text-brand-navy uppercase tracking-wider">
                  {selectedHazard ? 'Selected Incident' : `Bengaluru Hazards (${hazards.length})`}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setMobileSheetOpen(false);
                  }}
                  className="p-1 text-brand-slate hover:text-brand-navy"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Bottom Sheet Content */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
              {selectedHazard ? (
                <HazardCard hazard={selectedHazard} onVoteSuccess={loadData} />
              ) : (
                hazards.map((hazard) => (
                  <HazardCard
                    key={hazard.id}
                    hazard={hazard}
                    onSelect={(h) => setSelectedHazard(h)}
                    onVoteSuccess={loadData}
                    compact={true}
                  />
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
