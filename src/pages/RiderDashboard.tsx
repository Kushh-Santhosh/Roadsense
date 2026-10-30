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
  ChevronRight
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
  const recentReports = [...activeHazards]
    .sort((a, b) => new Date(b.lastUpdatedAt).getTime() - new Date(a.lastUpdatedAt).getTime())
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-brand-warm-white pb-16 font-sans">
      {/* Rider Greeting Header */}
      <div className="bg-gradient-to-b from-brand-soft-blue to-brand-warm-white border-b border-brand-neutral-grey/60 pt-8 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-orange mb-1">
                <span className="w-2 h-2 rounded-full bg-brand-orange animate-pulse" />
                Bengaluru Rider Intelligence Network
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-navy tracking-tight">
                Welcome back, {currentUser.name.split(' ')[0]}
              </h1>
              <p className="text-sm text-brand-slate mt-1 max-w-xl">
                Real-time hazard monitoring across Bengaluru corridors. Know where potholes, open grates, and road damages lie before you ride.
              </p>
            </div>

            {/* Quick Actions Row */}
            <div className="flex items-center gap-3 flex-wrap">
              <Link
                to="/app/report"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-orange hover:bg-brand-orange-hover text-white font-semibold text-sm transition-all shadow-sm shadow-brand-orange/20 hover:scale-[1.02]"
              >
                <AlertTriangle className="w-4 h-4" />
                Report Hazard (20s)
              </Link>
              <Link
                to="/app/ride"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-navy hover:bg-brand-navy-light text-white font-semibold text-sm transition-all shadow-subtle hover:scale-[1.02]"
              >
                <Activity className="w-4 h-4 text-emerald-400" />
                Start Ride Mode
              </Link>
            </div>
          </div>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-6">
            <div className="bg-white p-4 rounded-2xl border border-brand-neutral-grey shadow-subtle">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-brand-slate uppercase tracking-wider">Active Incidents</span>
                <span className="w-2 h-2 rounded-full bg-brand-orange" />
              </div>
              <div className="text-2xl font-extrabold text-brand-navy mt-1">{activeHazards.length}</div>
              <div className="text-[11px] text-brand-slate-light mt-0.5">Bengaluru Demo Region</div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-brand-neutral-grey shadow-subtle">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-brand-red uppercase tracking-wider">Critical Alerts</span>
                <span className="w-2 h-2 rounded-full bg-brand-red animate-ping" />
              </div>
              <div className="text-2xl font-extrabold text-brand-red mt-1">{criticalHazards.length}</div>
              <div className="text-[11px] text-brand-slate-light mt-0.5">Immediate swerve hazards</div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-brand-neutral-grey shadow-subtle">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-brand-slate uppercase tracking-wider">Your Trust Score</span>
                <Award className="w-4 h-4 text-purple-600" />
              </div>
              <div className="text-2xl font-extrabold text-brand-navy mt-1">{currentUser.trustScore}%</div>
              <div className="text-[11px] text-brand-slate-light mt-0.5">{currentUser.points} Community points</div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-brand-neutral-grey shadow-subtle">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-brand-slate uppercase tracking-wider">Your Contributions</span>
                <Shield className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-extrabold text-brand-navy mt-1">{currentUser.reportsCount} Reports</div>
              <div className="text-[11px] text-brand-slate-light mt-0.5">{currentUser.confirmationsCount} confirmations</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area: Map & Community Feed */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left 7 Columns: Interactive Map View */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-brand-navy flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-brand-orange" />
                  Live Corridor Hazard Map
                </h2>
                <p className="text-xs text-brand-slate">
                  Click markers to inspect road cavities, fatigue cracks, and broken grates.
                </p>
              </div>
              <Link
                to="/app/map"
                className="text-xs font-bold text-brand-orange hover:text-brand-orange-hover flex items-center gap-1"
              >
                Fullscreen Map <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Leaflet Map Embed */}
            <LeafletMap
              hazards={activeHazards}
              selectedHazard={selectedHazard}
              onSelectHazard={(h) => setSelectedHazard(h)}
              height="480px"
              showFilters={true}
            />

            {/* Quick Feature Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <Link
                to="/app/roadscan"
                className="bg-white p-4 rounded-2xl border border-brand-neutral-grey hover:border-purple-300 shadow-subtle hover:shadow-card transition-all group"
              >
                <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
                  <Camera className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm text-brand-navy group-hover:text-purple-700">RoadScan AI</h3>
                <p className="text-xs text-brand-slate mt-1">Upload road image to detect potholes & cracks via RDD2022 vision model.</p>
              </Link>

              <Link
                to="/app/ride"
                className="bg-white p-4 rounded-2xl border border-brand-neutral-grey hover:border-emerald-300 shadow-subtle hover:shadow-card transition-all group"
              >
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
                  <Activity className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm text-brand-navy group-hover:text-emerald-700">Ride Mode</h3>
                <p className="text-xs text-brand-slate mt-1">Phone accelerometer telemetry detects sudden vertical bump spikes.</p>
              </Link>

              <Link
                to="/app/routes"
                className="bg-white p-4 rounded-2xl border border-brand-neutral-grey hover:border-blue-300 shadow-subtle hover:shadow-card transition-all group"
              >
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
                  <Navigation className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm text-brand-navy group-hover:text-blue-700">Route Warnings</h3>
                <p className="text-xs text-brand-slate mt-1">Plan commute route & receive spoken audio warnings for upcoming road hazards.</p>
              </Link>
            </div>
          </div>

          {/* Right 5 Columns: Selected Hazard Details / Recent Community Feed */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-brand-navy flex items-center gap-2">
                  <Clock className="w-5 h-5 text-brand-orange" />
                  Recent Community Reports
                </h2>
                <p className="text-xs text-brand-slate">Real-time crowd confirmations & status updates</p>
              </div>
              <Link
                to="/app/my-reports"
                className="text-xs font-semibold text-brand-slate hover:text-brand-navy"
              >
                My Reports
              </Link>
            </div>

            {/* Selected Hazard Drilldown Card (if marker clicked) */}
            {selectedHazard && (
              <div className="border-2 border-brand-orange/40 rounded-2xl p-1 bg-brand-orange/5 animate-fadeIn">
                <div className="p-2 text-xs font-bold text-brand-orange flex items-center justify-between">
                  <span>Selected Map Marker</span>
                  <button
                    onClick={() => setSelectedHazard(null)}
                    className="text-brand-slate hover:text-brand-navy"
                  >
                    Close
                  </button>
                </div>
                <HazardCard
                  hazard={selectedHazard}
                  onVoteSuccess={() => loadData()}
                />
              </div>
            )}

            {/* Recent Hazards List */}
            <div className="space-y-3">
              {recentReports.map((hazard) => (
                <HazardCard
                  key={hazard.id}
                  hazard={hazard}
                  onSelect={(h) => setSelectedHazard(h)}
                  onVoteSuccess={() => loadData()}
                />
              ))}
            </div>

            {/* Safety Reminder Banner */}
            <div className="bg-brand-navy rounded-2xl p-4 text-white text-xs leading-relaxed space-y-2">
              <div className="font-bold text-brand-orange flex items-center gap-1.5">
                <Shield className="w-4 h-4" />
                Rider Safety Protocol
              </div>
              <p className="text-brand-slate-light">
                Never interact with your smartphone or check maps while your two-wheeler is in motion. Pull over to a safe curb before reporting or confirming hazards.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
