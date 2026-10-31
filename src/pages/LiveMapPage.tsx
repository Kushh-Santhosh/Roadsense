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
  RefreshCw
} from 'lucide-react';

export const LiveMapPage: React.FC = () => {
  const [hazards, setHazards] = useState<Hazard[]>([]);
  const [selectedHazard, setSelectedHazard] = useState<Hazard | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const loadData = () => {
    setHazards(StorageService.getHazards());
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="h-[calc(100vh-6.5rem)] flex flex-col font-sans bg-brand-warm-white overflow-hidden">
      {/* Header bar */}
      <div className="bg-white border-b border-brand-neutral-grey/80 px-4 py-2.5 flex items-center justify-between z-20 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-brand-orange" />
            <h1 className="text-base sm:text-lg font-extrabold text-brand-navy">
              Live Road Hazard Map
            </h1>
          </div>
          <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[11px] font-bold bg-brand-navy text-white">
            Bengaluru Demonstration Network
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="px-3 py-1.5 rounded-lg border border-brand-neutral-grey text-xs font-semibold text-brand-navy hover:bg-brand-soft-blue flex items-center gap-1.5"
          >
            <Layers className="w-3.5 h-3.5 text-brand-orange" />
            <span>{sidebarOpen ? 'Hide Incidents' : 'Show Incidents'}</span>
          </button>
          <Link
            to="/app/report"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-orange hover:bg-brand-orange-hover text-white text-xs font-bold transition-all shadow-subtle"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Report Hazard</span>
          </Link>
        </div>
      </div>

      {/* Main Map Container & Sidebar */}
      <div className="flex-1 relative flex overflow-hidden">
        {/* Leaflet Map filling space */}
        <div className="flex-1 h-full relative">
          <LeafletMap
            hazards={hazards}
            selectedHazard={selectedHazard}
            onSelectHazard={(h) => setSelectedHazard(h)}
            height="100%"
            showFilters={true}
          />
        </div>

        {/* Sidebar Panel */}
        {sidebarOpen && (
          <aside className="w-80 sm:w-96 bg-white border-l border-brand-neutral-grey/80 flex flex-col z-20 shadow-elevated">
            <div className="p-3.5 border-b border-brand-neutral-grey flex items-center justify-between bg-brand-warm-white">
              <div>
                <h3 className="font-bold text-xs uppercase tracking-wider text-brand-navy">
                  Active Road Hazards ({hazards.length})
                </h3>
                <p className="text-[11px] text-brand-slate">Ordered by community confirmation</p>
              </div>
              <button
                onClick={() => setSelectedHazard(null)}
                className="text-xs text-brand-orange font-semibold hover:underline"
              >
                Clear selection
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {selectedHazard ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-brand-orange">
                    <span>Selected Pin Details</span>
                    <button onClick={() => setSelectedHazard(null)}>
                      <X className="w-4 h-4 text-brand-slate" />
                    </button>
                  </div>
                  <HazardCard
                    hazard={selectedHazard}
                    onVoteSuccess={loadData}
                  />
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
      </div>
    </div>
  );
};

