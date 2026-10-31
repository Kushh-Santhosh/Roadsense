import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LeafletMap } from '../components/LeafletMap';
import { HazardCard } from '../components/HazardCard';
import { StorageService } from '../services/storageService';
import { Hazard } from '../types';
import {
  AlertTriangle,
  Activity,
  Camera,
  Navigation,
  Shield,
  MapPin,
  Clock,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Award,
  Layers,
  ChevronRight,
  ShieldAlert,
  Droplet
} from 'lucide-react';

export const RiderDashboard: React.FC = () => {
  const [hazards, setHazards] = useState<Hazard[]>([]);
  const [selectedHazard, setSelectedHazard] = useState<Hazard | null>(null);
  const currentUser = StorageService.getCurrentUser();
  const navigate = useNavigate();

  const loadData = () => {
    const list = StorageService.getHazards();
    setHazards(list);
  };

  useEffect(() => {
    loadData();
  }, []);

  const activeHazards = hazards.filter((h) => h.status !== 'resolved' && h.status !== 'rejected');
  const criticalHazards = activeHazards.filter((h) => h.severity === 'critical');
  const waterloggedHazards = activeHazards.filter(
    (h) => h.category === 'waterlogged_road' || h.additionalLabel === 'POTENTIALLY_HIDDEN_SURFACE_HAZARD'
  );
  const recentReports = [...activeHazards]
    .sort((a, b) => new Date(b.lastUpdatedAt).getTime() - new Date(a.lastUpdatedAt).getTime())
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-brand-warm-white pb-16 font-sans">
      {/* Top Mobility Header */}
      <div className="bg-white border-b border-brand-neutral-grey/80 pt-6 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
            <div>
              <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-brand-orange mb-1">
                <span className="w-2 h-2 rounded-full bg-brand-orange animate-pulse" />
                Bengaluru Two-Wheeler Safety Network • Demonstration Dataset
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-brand-navy tracking-tight">
                Welcome back, {currentUser.name.split(' ')[0]}
              </h1>
              <p className="text-xs sm:text-sm text-brand-slate mt-1 max-w-2xl leading-relaxed">
                Real-time road condition intelligence across Outer Ring Road, Hebbal, Indiranagar, and Whitefield corridors.
              </p>
            </div>

            {/* Primary Action Buttons */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <Link
                to="/app/report"
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-brand-orange hover:bg-brand-orange-hover text-white font-bold text-xs transition-all shadow-subtle hover:scale-[1.01] cursor-pointer"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>Report Road Hazard (20s)</span>
              </Link>
              <Link
                to="/app/ride"
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-brand-navy hover:bg-brand-navy-light text-white font-bold text-xs transition-all shadow-subtle hover:scale-[1.01] cursor-pointer"
              >
                <Activity className="w-4 h-4 text-emerald-400" />
                <span>Start Ride Mode</span>
              </Link>
            </div>
          </div>

          {/* Refined Mobility Telemetry Metrics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-6">
            <div className="bg-brand-warm-white p-4 rounded-2xl border border-brand-neutral-grey">
              <div className="flex items-center justify-between text-xs text-brand-slate font-semibold">
                <span>Active Hazards</span>
                <span className="w-2 h-2 rounded-full bg-brand-orange" />
              </div>
              <div className="text-2xl font-black text-brand-navy mt-1">{activeHazards.length}</div>
              <div className="text-[10px] text-brand-slate mt-0.5">Bengaluru Demo Corridors</div>
            </div>

            <div className="bg-brand-warm-white p-4 rounded-2xl border border-brand-neutral-grey">
              <div className="flex items-center justify-between text-xs text-brand-red font-semibold">
                <span>Critical Hazards</span>
                <span className="w-2 h-2 rounded-full bg-brand-red animate-ping" />
              </div>
              <div className="text-2xl font-black text-brand-red mt-1">{criticalHazards.length}</div>
              <div className="text-[10px] text-brand-slate mt-0.5">Immediate swerve / rim risk</div>
            </div>

            <div className="bg-brand-warm-white p-4 rounded-2xl border border-brand-neutral-grey">
              <div className="flex items-center justify-between text-xs text-blue-700 font-semibold">
                <span>Waterlogged Risks</span>
                <Droplet className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <div className="text-2xl font-black text-blue-800 mt-1">{waterloggedHazards.length}</div>
              <div className="text-[10px] text-brand-slate mt-0.5">Hidden surface depth</div>
            </div>

            <div className="bg-brand-warm-white p-4 rounded-2xl border border-brand-neutral-grey">
              <div className="flex items-center justify-between text-xs text-brand-slate font-semibold">
                <span>Your Contributions</span>
                <Shield className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <div className="text-2xl font-black text-brand-navy mt-1">{currentUser.reportsCount} <span className="text-xs font-normal text-brand-slate">reports</span></div>
              <div className="text-[10px] text-brand-slate mt-0.5">{currentUser.confirmationsCount} confirmations recorded</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area: Map & Community Feed */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left 7 Columns: Interactive Map View */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-extrabold text-brand-navy flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-brand-orange" />
                  Live Corridor Hazard Map
                </h2>
                <p className="text-xs text-brand-slate">
                  Click markers to inspect road cavities, fatigue cracks, and submerged hazards.
                </p>
              </div>
              <Link
                to="/app/map"
                className="text-xs font-bold text-brand-orange hover:text-brand-orange-hover flex items-center gap-1"
              >
                Full Map View <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {/* Leaflet Map Embed with reliable height & container */}
            <div className="w-full h-[460px] flex flex-col">
              <LeafletMap
                hazards={activeHazards}
                selectedHazard={selectedHazard}
                onSelectHazard={(h) => setSelectedHazard(h)}
                height="100%"
                showFilters={true}
              />
            </div>

            {/* Quick Feature Navigation Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <Link
                to="/app/roadscan"
                className="bg-white p-4 rounded-2xl border border-brand-neutral-grey hover:border-purple-300 shadow-subtle hover:shadow-card transition-all group"
              >
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                  <Camera className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-xs text-brand-navy group-hover:text-purple-700">RoadScan AI</h3>
                <p className="text-[11px] text-brand-slate mt-0.5 leading-relaxed">RDD2022 computer vision distress analyzer.</p>
              </Link>

              <Link
                to="/app/ride"
                className="bg-white p-4 rounded-2xl border border-brand-neutral-grey hover:border-emerald-300 shadow-subtle hover:shadow-card transition-all group"
              >
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                  <Activity className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-xs text-brand-navy group-hover:text-emerald-700">Ride Mode</h3>
                <p className="text-[11px] text-brand-slate mt-0.5 leading-relaxed">Distraction-free voice alerts & bump detection.</p>
              </Link>

              <Link
                to="/app/routes"
                className="bg-white p-4 rounded-2xl border border-brand-neutral-grey hover:border-blue-300 shadow-subtle hover:shadow-card transition-all group"
              >
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                  <Navigation className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-xs text-brand-navy group-hover:text-blue-700">Route Warnings</h3>
                <p className="text-[11px] text-brand-slate mt-0.5 leading-relaxed">Corridor hazard buffer early warning preview.</p>
              </Link>
            </div>
          </div>

          {/* Right 5 Columns: Incident Cards Feed */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-extrabold text-brand-navy flex items-center gap-2">
                  <Clock className="w-4 h-4 text-brand-orange" />
                  Recent Community Reports
                </h2>
                <p className="text-xs text-brand-slate">Real-time crowd confirmations & status updates</p>
              </div>
              <Link to="/app/my-reports" className="text-xs font-bold text-brand-orange hover:underline">
                My Reports
              </Link>
            </div>

            <div className="space-y-3 max-h-[620px] overflow-y-auto pr-1">
              {recentReports.map((hazard) => (
                <HazardCard
                  key={hazard.id}
                  hazard={hazard}
                  onSelect={(h) => setSelectedHazard(h)}
                  onVoteSuccess={loadData}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
